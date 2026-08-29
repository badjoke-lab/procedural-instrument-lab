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
  distance: number
  deflection: number
  loadAngle: number
}

export type PinContactWindow = {
  entryAngle: number
  releaseAngle: number
  travelAngle: number
}

export const TINE_REST_Y = 0.23
export const TINE_ANCHOR_X_OFFSET = 2.23
export const TINE_ANCHOR_X_STEP = 0.042
export const TINE_THICKNESS = 0.055
export const PIN_TIP_RADIUS_SCALE = 1.04
export const MAX_CONTACT_PHASE_STEP = 0.005

const TWO_PI = Math.PI * 2
const GEOMETRY_EPSILON = 1e-7

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
  if (requiredAxialSpan > config.cylinderLength) {
    issues.push('note lanes do not fit within cylinderLength')
  }

  if (config.tineSpacing < config.pinRadius * 2.5) {
    issues.push('tineSpacing is too small for the configured pinRadius')
  }

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

/** Center of the visible spherical pin tip. */
export function pinTipWorldPosition(pin: Pin, phase: number, config: MusicBoxConfig): Point3 {
  const radius = config.cylinderRadius + config.pinLength
  const theta = pin.angle + phase
  const [cx, cy, cz] = config.cylinderCenter

  return {
    x: cx + Math.cos(theta) * radius,
    y: cy + Math.sin(theta) * radius,
    z: cz + pin.axialPosition,
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

/** Root used by the rendered tine. */
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

export function tineLoadAngle(
  noteIndex: number,
  contactProgress: number,
  motionDirection: number,
  config: MusicBoxConfig,
) {
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

/** Visible sphere-to-tine centerline clearance at surface contact. */
export function pinTineSurfaceContactRadius(config: MusicBoxConfig) {
  return visiblePinTipRadius(config) + TINE_THICKNESS / 2
}

export function distance3(a: Point3, b: Point3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

function normalizePositiveAngle(angle: number) {
  const normalized = angle % TWO_PI
  return normalized < 0 ? normalized + TWO_PI : normalized
}

function normalizeSignedAngle(angle: number) {
  let normalized = normalizePositiveAngle(angle)
  if (normalized > Math.PI) normalized -= TWO_PI
  return normalized
}

function directedAngularDistance(from: number, to: number, direction: number) {
  return direction < 0
    ? normalizePositiveAngle(from - to)
    : normalizePositiveAngle(to - from)
}

function circlePathAnglesThroughPoint(point: Point3, contactRadius: number, config: MusicBoxConfig) {
  const [cx, cy] = config.cylinderCenter
  const pathRadius = config.cylinderRadius + config.pinLength
  const dx = point.x - cx
  const dy = point.y - cy
  const centerDistance = Math.hypot(dx, dy)
  const denominator = 2 * pathRadius * centerDistance
  if (denominator <= GEOMETRY_EPSILON) return []

  const cosine = (pathRadius ** 2 + centerDistance ** 2 - contactRadius ** 2) / denominator
  if (cosine < -1 - GEOMETRY_EPSILON || cosine > 1 + GEOMETRY_EPSILON) return []

  const centerAngle = Math.atan2(dy, dx)
  const offset = Math.acos(Math.max(-1, Math.min(1, cosine)))
  return [normalizePositiveAngle(centerAngle + offset), normalizePositiveAngle(centerAngle - offset)]
}

function circleIntersections(
  centerA: Point3,
  radiusA: number,
  centerB: Point3,
  radiusB: number,
): Point3[] {
  const dx = centerB.x - centerA.x
  const dy = centerB.y - centerA.y
  const distance = Math.hypot(dx, dy)
  if (distance <= GEOMETRY_EPSILON) return []
  if (distance > radiusA + radiusB + GEOMETRY_EPSILON) return []
  if (distance < Math.abs(radiusA - radiusB) - GEOMETRY_EPSILON) return []

  const along = (radiusA ** 2 - radiusB ** 2 + distance ** 2) / (2 * distance)
  const heightSquared = radiusA ** 2 - along ** 2
  if (heightSquared < -GEOMETRY_EPSILON) return []
  const height = Math.sqrt(Math.max(0, heightSquared))

  const baseX = centerA.x + along * dx / distance
  const baseY = centerA.y + along * dy / distance
  const offsetX = -dy * height / distance
  const offsetY = dx * height / distance
  const z = centerA.z

  return [
    { x: baseX + offsetX, y: baseY + offsetY, z },
    { x: baseX - offsetX, y: baseY - offsetY, z },
  ]
}

export function pinContactWindow(
  pin: Pin,
  motionDirection: number,
  config: MusicBoxConfig,
): PinContactWindow | null {
  const direction = Math.sign(motionDirection) || -1
  const contactRadius = pinTineSurfaceContactRadius(config)
  const restTip = tineContactPoint(pin.noteIndex, config)
  const entryCandidates = circlePathAnglesThroughPoint(restTip, contactRadius, config)
  if (entryCandidates.length !== 2) return null

  const entryAngle = direction < 0
    ? Math.max(...entryCandidates)
    : Math.min(...entryCandidates)
  const releaseLoadAngle = tineLoadAngle(pin.noteIndex, 1, direction, config)
  const releaseTip = tineTipPosition(pin.noteIndex, releaseLoadAngle, config)
  const releaseCandidates = circlePathAnglesThroughPoint(releaseTip, contactRadius, config)
  if (releaseCandidates.length !== 2) return null

  const releaseOptions = releaseCandidates
    .map((releaseAngle) => ({
      releaseAngle,
      travelAngle: directedAngularDistance(entryAngle, releaseAngle, direction),
    }))
    .filter((candidate) => candidate.travelAngle > GEOMETRY_EPSILON)
    .sort((a, b) => a.travelAngle - b.travelAngle)
  const release = releaseOptions[0]
  if (!release || release.travelAngle >= Math.PI) return null

  return {
    entryAngle,
    releaseAngle: release.releaseAngle,
    travelAngle: release.travelAngle,
  }
}

function loadAngleAtContact(
  pin: Pin,
  phase: number,
  motionDirection: number,
  config: MusicBoxConfig,
  fallbackProgress: number,
) {
  const direction = Math.sign(motionDirection) || -1
  const expectedSign = -direction
  const pinTip = pinTipWorldPosition(pin, phase, config)
  const anchor = tineAnchorPoint(pin.noteIndex, config)
  const length = tineLength(pin.noteIndex, config)
  const contactRadius = pinTineSurfaceContactRadius(config)
  const maximumAngle = tineMaximumLoadAngle(pin.noteIndex, config)
  const candidates = circleIntersections(anchor, length, pinTip, contactRadius)
    .map((tip) => normalizeSignedAngle(Math.atan2(-(tip.y - anchor.y), -(tip.x - anchor.x))))
    .filter((angle) => angle * expectedSign >= -GEOMETRY_EPSILON)
    .filter((angle) => Math.abs(angle) <= maximumAngle + GEOMETRY_EPSILON)
    .sort((a, b) => Math.abs(b) - Math.abs(a))

  return candidates[0] ?? tineLoadAngle(pin.noteIndex, fallbackProgress, direction, config)
}

/**
 * Resolve contact from the same visible pin sphere and rotated tine geometry that is rendered.
 * Contact starts when the sphere first touches the resting tine surface. It ends at the configured
 * elastic tip travel, where the pin slips off and the release/pluck event is emitted.
 */
export function pinTineEngagement(
  pin: Pin,
  phase: number,
  config: MusicBoxConfig,
  motionDirection = -1,
): PinTineEngagement {
  const direction = Math.sign(motionDirection) || -1
  const pinTip = pinTipWorldPosition(pin, phase, config)
  const restTip = tineContactPoint(pin.noteIndex, config)
  const distance = distance3(pinTip, restTip)
  const window = pinContactWindow(pin, direction, config)
  if (!window) return { engaged: false, distance, deflection: 0, loadAngle: 0 }

  const currentAngle = normalizePositiveAngle(pin.angle + phase)
  const travel = directedAngularDistance(window.entryAngle, currentAngle, direction)
  if (travel > window.travelAngle + GEOMETRY_EPSILON) {
    return { engaged: false, distance, deflection: 0, loadAngle: 0 }
  }

  const fallbackProgress = Math.max(0, Math.min(1, travel / Math.max(window.travelAngle, GEOMETRY_EPSILON)))
  const loadAngle = loadAngleAtContact(pin, phase, direction, config, fallbackProgress)
  const maximumAngle = tineMaximumLoadAngle(pin.noteIndex, config)
  const deflection = maximumAngle > GEOMETRY_EPSILON
    ? Math.max(0, Math.min(1, Math.abs(loadAngle) / maximumAngle))
    : 0

  return { engaged: true, distance, deflection, loadAngle }
}

export function pinTouchesTine(
  pin: Pin,
  phase: number,
  config: MusicBoxConfig,
  motionDirection = -1,
) {
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
