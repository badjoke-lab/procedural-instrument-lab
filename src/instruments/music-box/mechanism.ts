export type NoteEvent = { note: number; start: number }

export type MusicBoxConfig = {
  notes: number[]
  cylinderCenter: [number, number, number]
  cylinderRadius: number
  cylinderLength: number
  pinLength: number
  pinRadius: number
  tineSpacing: number
  contactTolerance: number
  driverGearTeeth: number
  cylinderGearTeeth: number
  driverGearRadius: number
}

export type Pin = {
  noteIndex: number
  angle: number
  axialPosition: number
}

export type Point3 = { x: number; y: number; z: number }

export type DriveKinematics = {
  crankAngle: number
  driverGearAngle: number
  cylinderGearAngle: number
  cylinderPhase: number
  ratio: number
}

export type PinTineEngagement = {
  engaged: boolean
  /** Distance from the rendered pin-sphere center to the rendered tine box. */
  distance: number
  deflection: number
  loadAngle: number
}

export type PinContactWindow = {
  entryAngle: number
  releaseAngle: number
  travelAngle: number
}

export type PinRenderGeometry = {
  stemCenter: Point3
  tipCenter: Point3
  rotationZ: number
}

export const TINE_REST_Y = 0.23
export const TINE_ANCHOR_X_OFFSET = 2.23
export const TINE_ANCHOR_X_STEP = 0.042
export const TINE_THICKNESS = 0.055
export const PIN_TIP_RADIUS_SCALE = 1.04
export const MAX_CONTACT_PHASE_STEP = 0.005

const TWO_PI = Math.PI * 2
const GEOMETRY_EPSILON = 1e-7
const CONTACT_ROOT_SCAN_STEPS = 720
const CONTACT_ROOT_BISECTIONS = 32
const LOAD_ROOT_SCAN_STEPS = 24
const contactWindowCache = new Map<string, PinContactWindow | null>()

export const DEFAULT_MUSIC_BOX_CONFIG: MusicBoxConfig = {
  notes: [60, 62, 64, 65, 67, 69, 71, 72],
  cylinderCenter: [-0.7, 0, 0],
  cylinderRadius: 1.05,
  cylinderLength: 3.2,
  pinLength: 0.18,
  pinRadius: 0.045,
  tineSpacing: 0.34,
  contactTolerance: 0.065,
  driverGearTeeth: 40,
  cylinderGearTeeth: 20,
  driverGearRadius: 0.62,
}

export function validateMusicBoxConfig(config: MusicBoxConfig): string[] {
  const issues: string[] = []
  const uniqueNotes = new Set(config.notes)

  if (config.notes.length === 0) issues.push('notes must contain at least one pitch')
  if (uniqueNotes.size !== config.notes.length) issues.push('notes must be unique')
  if (config.cylinderRadius <= 0) issues.push('cylinderRadius must be positive')
  if (config.cylinderLength <= 0) issues.push('cylinderLength must be positive')
  if (config.pinLength <= 0 || config.pinRadius <= 0) issues.push('pin dimensions must be positive')
  if (config.tineSpacing <= 0) issues.push('tineSpacing must be positive')
  if (config.contactTolerance <= 0) issues.push('contactTolerance must be positive')
  if (config.driverGearTeeth <= 0 || config.cylinderGearTeeth <= 0) issues.push('gear tooth counts must be positive')
  if (config.driverGearRadius <= 0) issues.push('driverGearRadius must be positive')

  const requiredAxialSpan = Math.max(0, config.notes.length - 1) * config.tineSpacing + config.pinRadius * 2
  if (requiredAxialSpan > config.cylinderLength) issues.push('note lanes do not fit within cylinderLength')
  if (config.tineSpacing < config.pinRadius * 2.5) issues.push('tineSpacing is too small for the configured pinRadius')

  return issues
}

export function assertMusicBoxConfig(config: MusicBoxConfig) {
  const issues = validateMusicBoxConfig(config)
  if (issues.length > 0) throw new Error(`Invalid music box configuration: ${issues.join('; ')}`)
}

export function gearRatio(config: MusicBoxConfig) {
  return config.driverGearTeeth / config.cylinderGearTeeth
}

export function cylinderGearRadius(config: MusicBoxConfig) {
  return config.driverGearRadius / gearRatio(config)
}

export function driveKinematics(crankAngle: number, config: MusicBoxConfig): DriveKinematics {
  assertMusicBoxConfig(config)
  const ratio = gearRatio(config)
  const cylinderGearAngle = -crankAngle * ratio
  return {
    crankAngle,
    driverGearAngle: crankAngle,
    cylinderGearAngle,
    cylinderPhase: cylinderGearAngle,
    ratio,
  }
}

export function compileTune(events: NoteEvent[], config: MusicBoxConfig): Pin[] {
  assertMusicBoxConfig(config)
  return events
    .map((event) => {
      const noteIndex = config.notes.indexOf(event.note)
      return {
        noteIndex,
        angle: event.start * TWO_PI,
        axialPosition: (noteIndex - (config.notes.length - 1) / 2) * config.tineSpacing,
      }
    })
    .filter((pin) => pin.noteIndex >= 0)
}

function radialPoint(angle: number, radius: number, axialPosition: number): Point3 {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    z: axialPosition,
  }
}

/** Local pin geometry consumed by the renderer before the cylinder group's phase rotation. */
export function pinRenderGeometry(pin: Pin, config: MusicBoxConfig): PinRenderGeometry {
  return {
    stemCenter: radialPoint(pin.angle, config.cylinderRadius + config.pinLength / 2, pin.axialPosition),
    tipCenter: radialPoint(pin.angle, config.cylinderRadius + config.pinLength, pin.axialPosition),
    rotationZ: pin.angle - Math.PI / 2,
  }
}

/** Center of the visible spherical pin tip. */
export function pinTipWorldPosition(pin: Pin, phase: number, config: MusicBoxConfig): Point3 {
  return pinTipWorldPositionAtAngle(pin.angle + phase, pin.axialPosition, config)
}

function pinTipWorldPositionAtAngle(angle: number, axialPosition: number, config: MusicBoxConfig): Point3 {
  const local = radialPoint(angle, config.cylinderRadius + config.pinLength, axialPosition)
  const [cx, cy, cz] = config.cylinderCenter
  return {
    x: cx + local.x,
    y: cy + local.y,
    z: cz + local.z,
  }
}

export function visiblePinTipRadius(config: MusicBoxConfig) {
  return config.pinRadius * PIN_TIP_RADIUS_SCALE
}

/** Rest centerline position of the visible free tine tip. */
export function tineContactPoint(noteIndex: number, config: MusicBoxConfig): Point3 {
  const [cx, cy, cz] = config.cylinderCenter
  return {
    x: cx + config.cylinderRadius + config.pinLength,
    y: cy + TINE_REST_Y,
    z: cz + (noteIndex - (config.notes.length - 1) / 2) * config.tineSpacing,
  }
}

/** Root used by the rendered tine group. */
export function tineAnchorPoint(noteIndex: number, config: MusicBoxConfig): Point3 {
  const [cx, cy] = config.cylinderCenter
  const contact = tineContactPoint(noteIndex, config)
  return {
    x: cx + TINE_ANCHOR_X_OFFSET + noteIndex * TINE_ANCHOR_X_STEP,
    y: cy + TINE_REST_Y,
    z: contact.z,
  }
}

export function tineLength(noteIndex: number, config: MusicBoxConfig) {
  const anchor = tineAnchorPoint(noteIndex, config)
  const contact = tineContactPoint(noteIndex, config)
  return Math.max(0.001, anchor.x - contact.x)
}

export function tineMaximumLoadAngle(noteIndex: number, config: MusicBoxConfig) {
  const length = tineLength(noteIndex, config)
  return Math.asin(Math.min(0.95, config.contactTolerance / length))
}

export function tineLoadAngle(noteIndex: number, contactProgress: number, motionDirection: number, config: MusicBoxConfig) {
  const maximumAngle = tineMaximumLoadAngle(noteIndex, config)
  const direction = Math.sign(motionDirection) || -1
  const progress = Math.max(0, Math.min(1, contactProgress))
  return -direction * progress * maximumAngle
}

/** Centerline position of the rendered free tine tip after applying its group rotation. */
export function tineTipPosition(noteIndex: number, loadAngle: number, config: MusicBoxConfig): Point3 {
  const anchor = tineAnchorPoint(noteIndex, config)
  const length = tineLength(noteIndex, config)
  return {
    x: anchor.x - Math.cos(loadAngle) * length,
    y: anchor.y - Math.sin(loadAngle) * length,
    z: anchor.z,
  }
}

/**
 * Exact 2D distance from a point in the pin/tine lane to the rendered tine box.
 * The rendered box spans local x=[-length,0], y=[-TINE_THICKNESS/2,+TINE_THICKNESS/2]
 * and is rotated around the same anchor by loadAngle.
 */
export function pointToTineBoxDistance(point: Point3, noteIndex: number, loadAngle: number, config: MusicBoxConfig) {
  const anchor = tineAnchorPoint(noteIndex, config)
  const length = tineLength(noteIndex, config)
  const halfThickness = TINE_THICKNESS / 2
  const dx = point.x - anchor.x
  const dy = point.y - anchor.y
  const cosine = Math.cos(loadAngle)
  const sine = Math.sin(loadAngle)
  const localX = cosine * dx + sine * dy
  const localY = -sine * dx + cosine * dy
  const nearestX = Math.max(-length, Math.min(0, localX))
  const nearestY = Math.max(-halfThickness, Math.min(halfThickness, localY))
  return Math.hypot(localX - nearestX, localY - nearestY)
}

export function pinTineSurfaceGap(pin: Pin, phase: number, loadAngle: number, config: MusicBoxConfig) {
  const pinTip = pinTipWorldPosition(pin, phase, config)
  return pointToTineBoxDistance(pinTip, pin.noteIndex, loadAngle, config) - visiblePinTipRadius(config)
}

export function distance3(a: Point3, b: Point3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

function normalizePositiveAngle(angle: number) {
  const normalized = angle % TWO_PI
  return normalized < 0 ? normalized + TWO_PI : normalized
}

function directedAngularDistance(from: number, to: number, direction: number) {
  return direction < 0
    ? normalizePositiveAngle(from - to)
    : normalizePositiveAngle(to - from)
}

function contactCacheKey(noteIndex: number, direction: number, config: MusicBoxConfig) {
  return [
    noteIndex,
    Math.sign(direction) || -1,
    ...config.cylinderCenter,
    config.cylinderRadius,
    config.pinLength,
    config.pinRadius,
    config.contactTolerance,
    config.tineSpacing,
    config.notes.length,
  ].join('|')
}

function contactGapAtWorldAngle(noteIndex: number, worldAngle: number, loadAngle: number, config: MusicBoxConfig) {
  const axialPosition = (noteIndex - (config.notes.length - 1) / 2) * config.tineSpacing
  const pinTip = pinTipWorldPositionAtAngle(worldAngle, axialPosition, config)
  return pointToTineBoxDistance(pinTip, noteIndex, loadAngle, config) - visiblePinTipRadius(config)
}

function bisectContactAngle(
  noteIndex: number,
  loadAngle: number,
  config: MusicBoxConfig,
  fromAngle: number,
  toAngle: number,
) {
  let low = fromAngle
  let high = toAngle
  let lowGap = contactGapAtWorldAngle(noteIndex, low, loadAngle, config)
  let highGap = contactGapAtWorldAngle(noteIndex, high, loadAngle, config)
  if (Math.abs(lowGap) <= GEOMETRY_EPSILON) return normalizePositiveAngle(low)
  if (Math.abs(highGap) <= GEOMETRY_EPSILON) return normalizePositiveAngle(high)

  for (let iteration = 0; iteration < CONTACT_ROOT_BISECTIONS; iteration += 1) {
    const middle = (low + high) / 2
    const middleGap = contactGapAtWorldAngle(noteIndex, middle, loadAngle, config)
    if (Math.abs(middleGap) <= GEOMETRY_EPSILON) return normalizePositiveAngle(middle)
    if (lowGap * middleGap <= 0) {
      high = middle
      highGap = middleGap
    } else {
      low = middle
      lowGap = middleGap
    }
  }

  return normalizePositiveAngle((low + high) / 2)
}

function findContactAngles(noteIndex: number, loadAngle: number, config: MusicBoxConfig) {
  const roots: number[] = []
  const step = TWO_PI / CONTACT_ROOT_SCAN_STEPS
  let previousAngle = 0
  let previousGap = contactGapAtWorldAngle(noteIndex, previousAngle, loadAngle, config)

  for (let index = 1; index <= CONTACT_ROOT_SCAN_STEPS; index += 1) {
    const angle = index * step
    const gap = contactGapAtWorldAngle(noteIndex, angle, loadAngle, config)
    if (previousGap * gap < 0) {
      const root = bisectContactAngle(noteIndex, loadAngle, config, previousAngle, angle)
      if (!roots.some((existing) => Math.abs(normalizePositiveAngle(existing - root)) < 1e-5)) roots.push(root)
    } else if (Math.abs(gap) <= GEOMETRY_EPSILON) {
      const root = normalizePositiveAngle(angle)
      if (!roots.some((existing) => Math.abs(normalizePositiveAngle(existing - root)) < 1e-5)) roots.push(root)
    }
    previousAngle = angle
    previousGap = gap
  }

  return roots
}

export function pinContactWindow(pin: Pin, motionDirection: number, config: MusicBoxConfig): PinContactWindow | null {
  const direction = Math.sign(motionDirection) || -1
  const key = contactCacheKey(pin.noteIndex, direction, config)
  if (contactWindowCache.has(key)) return contactWindowCache.get(key) ?? null

  const restRoots = findContactAngles(pin.noteIndex, 0, config)
  const probe = 0.001
  const entryCandidates = restRoots.filter((root) => {
    const before = contactGapAtWorldAngle(pin.noteIndex, root - direction * probe, 0, config)
    const after = contactGapAtWorldAngle(pin.noteIndex, root + direction * probe, 0, config)
    return before > 0 && after <= 0
  })
  const entryAngle = entryCandidates[0]
  if (entryAngle === undefined) {
    contactWindowCache.set(key, null)
    return null
  }

  const maximumLoadAngle = tineLoadAngle(pin.noteIndex, 1, direction, config)
  const releaseCandidates = findContactAngles(pin.noteIndex, maximumLoadAngle, config)
    .map((releaseAngle) => ({
      releaseAngle,
      travelAngle: directedAngularDistance(entryAngle, releaseAngle, direction),
    }))
    .filter((candidate) => candidate.travelAngle > GEOMETRY_EPSILON && candidate.travelAngle < Math.PI)
    .sort((a, b) => a.travelAngle - b.travelAngle)
  const release = releaseCandidates[0]
  if (!release) {
    contactWindowCache.set(key, null)
    return null
  }

  const window = {
    entryAngle,
    releaseAngle: release.releaseAngle,
    travelAngle: release.travelAngle,
  }
  contactWindowCache.set(key, window)
  return window
}

function solveLoadAngleAtContact(
  pin: Pin,
  phase: number,
  motionDirection: number,
  config: MusicBoxConfig,
  fallbackProgress: number,
) {
  const direction = Math.sign(motionDirection) || -1
  const maximumLoadAngle = tineLoadAngle(pin.noteIndex, 1, direction, config)
  const gapAt = (progress: number) => pinTineSurfaceGap(pin, phase, maximumLoadAngle * progress, config)
  let previousProgress = 0
  let previousGap = gapAt(0)
  if (Math.abs(previousGap) <= GEOMETRY_EPSILON) return 0

  for (let index = 1; index <= LOAD_ROOT_SCAN_STEPS; index += 1) {
    const progress = index / LOAD_ROOT_SCAN_STEPS
    const gap = gapAt(progress)
    if (Math.abs(gap) <= GEOMETRY_EPSILON) return maximumLoadAngle * progress
    if (previousGap * gap < 0) {
      let low = previousProgress
      let high = progress
      let lowGap = previousGap
      for (let iteration = 0; iteration < CONTACT_ROOT_BISECTIONS; iteration += 1) {
        const middle = (low + high) / 2
        const middleGap = gapAt(middle)
        if (Math.abs(middleGap) <= GEOMETRY_EPSILON) return maximumLoadAngle * middle
        if (lowGap * middleGap <= 0) {
          high = middle
        } else {
          low = middle
          lowGap = middleGap
        }
      }
      return maximumLoadAngle * ((low + high) / 2)
    }
    previousProgress = progress
    previousGap = gap
  }

  return tineLoadAngle(pin.noteIndex, fallbackProgress, direction, config)
}

/**
 * Resolve contact against the same spherical pin tip and rectangular tine box that Three.js renders.
 * The pin loads the rooted tine while the two rendered surfaces touch. At configured elastic travel
 * the pin slips off; that engagement exit is the release/pluck event consumed by vibration and audio.
 */
export function pinTineEngagement(
  pin: Pin,
  phase: number,
  config: MusicBoxConfig,
  motionDirection = -1,
): PinTineEngagement {
  const direction = Math.sign(motionDirection) || -1
  const window = pinContactWindow(pin, direction, config)
  const restingDistance = pointToTineBoxDistance(pinTipWorldPosition(pin, phase, config), pin.noteIndex, 0, config)
  if (!window) return { engaged: false, distance: restingDistance, deflection: 0, loadAngle: 0 }

  const currentAngle = normalizePositiveAngle(pin.angle + phase)
  const travel = directedAngularDistance(window.entryAngle, currentAngle, direction)
  if (travel > window.travelAngle + GEOMETRY_EPSILON) {
    return { engaged: false, distance: restingDistance, deflection: 0, loadAngle: 0 }
  }

  const fallbackProgress = Math.max(0, Math.min(1, travel / Math.max(window.travelAngle, GEOMETRY_EPSILON)))
  const loadAngle = solveLoadAngleAtContact(pin, phase, direction, config, fallbackProgress)
  const maximumAngle = tineMaximumLoadAngle(pin.noteIndex, config)
  const deflection = maximumAngle > GEOMETRY_EPSILON
    ? Math.max(0, Math.min(1, Math.abs(loadAngle) / maximumAngle))
    : 0
  const distance = pointToTineBoxDistance(pinTipWorldPosition(pin, phase, config), pin.noteIndex, loadAngle, config)

  return { engaged: true, distance, deflection, loadAngle }
}

export function pinTouchesTine(pin: Pin, phase: number, config: MusicBoxConfig, motionDirection = -1) {
  return pinTineEngagement(pin, phase, config, motionDirection).engaged
}

/**
 * Rendering can advance by a large phase delta at low FPS or during a fast manual drag.
 * Contact/release detection samples that mechanical path rather than checking only the final frame.
 */
export function sampleCylinderPhaseSegment(fromPhase: number, toPhase: number, maxStep = MAX_CONTACT_PHASE_STEP) {
  if (!Number.isFinite(fromPhase) || !Number.isFinite(toPhase)) throw new Error('phase must be finite')
  if (!Number.isFinite(maxStep) || maxStep <= 0) throw new Error('maxStep must be positive')
  const delta = toPhase - fromPhase
  const steps = Math.max(1, Math.ceil(Math.abs(delta) / maxStep))
  return Array.from({ length: steps }, (_, index) => fromPhase + delta * ((index + 1) / steps))
}
