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
}

export const TINE_REST_Y = 0.23
export const TINE_ANCHOR_X_OFFSET = 2.23
export const TINE_ANCHOR_X_STEP = 0.042
export const TINE_THICKNESS = 0.055
export const MAX_CONTACT_PHASE_STEP = 0.02

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
        angle: event.start * Math.PI * 2,
        axialPosition: (noteIndex - (config.notes.length - 1) / 2) * config.tineSpacing,
      }
    })
    .filter((pin) => pin.noteIndex >= 0)
}

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

/** Rest position of the visible free tine tip. Contact is resolved against this same point. */
export function tineContactPoint(noteIndex: number, config: MusicBoxConfig): Point3 {
  const [cx, cy, cz] = config.cylinderCenter
  return {
    x: cx + config.cylinderRadius + config.pinLength,
    y: cy + TINE_REST_Y,
    z: cz + (noteIndex - (config.notes.length - 1) / 2) * config.tineSpacing,
  }
}

/** Root used by the rendered tine. Keeping it here prevents render/contact geometry from diverging. */
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

export function tineLoadAngle(
  noteIndex: number,
  deflection: number,
  motionDirection: number,
  config: MusicBoxConfig,
) {
  const length = tineLength(noteIndex, config)
  const maximumAngle = Math.asin(Math.min(0.95, config.contactTolerance / length))
  const direction = Math.sign(motionDirection) || -1
  return -direction * Math.max(0, Math.min(1, deflection)) * maximumAngle
}

export function distance3(a: Point3, b: Point3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

export function pinTineEngagement(pin: Pin, phase: number, config: MusicBoxConfig): PinTineEngagement {
  const pinTip = pinTipWorldPosition(pin, phase, config)
  const contact = tineContactPoint(pin.noteIndex, config)
  const distance = distance3(pinTip, contact)
  const engaged = distance <= config.contactTolerance
  const deflection = engaged
    ? Math.max(0, Math.min(1, 1 - distance / config.contactTolerance))
    : 0

  return { engaged, distance, deflection }
}

export function pinTouchesTine(pin: Pin, phase: number, config: MusicBoxConfig) {
  return pinTineEngagement(pin, phase, config).engaged
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
