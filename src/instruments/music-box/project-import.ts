import { assertMusicBoxProject, type MusicBoxProject } from './project-format'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasProjectShape(value: unknown): value is MusicBoxProject {
  if (!isRecord(value)) return false
  if (typeof value.format !== 'string' || typeof value.version !== 'number' || typeof value.instrument !== 'string') return false
  if (!isRecord(value.metadata) || typeof value.metadata.title !== 'string') return false

  if (!isRecord(value.tune)) return false
  if (
    typeof value.tune.version !== 'number' ||
    typeof value.tune.id !== 'string' ||
    typeof value.tune.title !== 'string' ||
    typeof value.tune.tempoBpm !== 'number' ||
    typeof value.tune.lengthBeats !== 'number' ||
    !Array.isArray(value.tune.notes)
  ) return false
  if (
    !value.tune.notes.every(
      (note) =>
        isRecord(note) &&
        typeof note.id === 'string' &&
        typeof note.pitch === 'number' &&
        typeof note.startBeat === 'number' &&
        typeof note.durationBeats === 'number',
    )
  ) return false

  if (!isRecord(value.config) || !Array.isArray(value.config.notes) || !Array.isArray(value.config.cylinderCenter)) return false
  if (!value.config.notes.every((note) => typeof note === 'number')) return false
  if (value.config.cylinderCenter.length !== 3 || !value.config.cylinderCenter.every((entry) => typeof entry === 'number')) return false

  for (const key of [
    'cylinderRadius',
    'cylinderLength',
    'pinLength',
    'pinRadius',
    'tineSpacing',
    'contactTolerance',
    'driverGearTeeth',
    'cylinderGearTeeth',
    'driverGearRadius',
  ] as const) {
    if (typeof value.config[key] !== 'number') return false
  }

  return true
}

export function parseMusicBoxProjectJson(json: string): MusicBoxProject {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    throw new Error('Invalid Music Box Project JSON')
  }

  if (!hasProjectShape(value)) throw new Error('Invalid Music Box Project structure')
  assertMusicBoxProject(value)
  return structuredClone(value)
}

export async function readMusicBoxProjectFile(file: File): Promise<MusicBoxProject> {
  return parseMusicBoxProjectJson(await file.text())
}
