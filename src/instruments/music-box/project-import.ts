import { assertMusicBoxProject, type MusicBoxProject } from './project-format'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasProjectShape(value: unknown): value is MusicBoxProject {
  if (!isRecord(value)) return false
  if (!isRecord(value.metadata) || typeof value.metadata.title !== 'string') return false
  if (!isRecord(value.tune) || !Array.isArray(value.tune.notes)) return false
  if (!isRecord(value.config) || !Array.isArray(value.config.notes) || !Array.isArray(value.config.cylinderCenter)) return false
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
