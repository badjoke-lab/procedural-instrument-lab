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

export function gearRatio(config: MusicBoxConfig) {
  return config.driverGearTeeth / config.cylinderGearTeeth
}

export function cylinderGearRadius(config: MusicBoxConfig) {
  return config.driverGearRadius / gearRatio(config)
}

export function driveKinematics(crankAngle: number, config: MusicBoxConfig): DriveKinematics {
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
  const theta = pin.angle - phase
  const [cx, cy, cz] = config.cylinderCenter

  return {
    x: cx + Math.cos(theta) * radius,
    y: cy + Math.sin(theta) * radius,
    z: cz + pin.axialPosition,
  }
}

export function tineContactPoint(noteIndex: number, config: MusicBoxConfig): Point3 {
  const [cx, cy, cz] = config.cylinderCenter
  return {
    x: cx + config.cylinderRadius + config.pinLength,
    y: cy,
    z: cz + (noteIndex - (config.notes.length - 1) / 2) * config.tineSpacing,
  }
}

export function distance3(a: Point3, b: Point3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

export function pinTouchesTine(pin: Pin, phase: number, config: MusicBoxConfig) {
  const pinTip = pinTipWorldPosition(pin, phase, config)
  const contact = tineContactPoint(pin.noteIndex, config)
  return distance3(pinTip, contact) <= config.contactTolerance
}
