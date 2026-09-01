import {
  MUSIC_BOX_PROJECT_FORMAT,
  MUSIC_BOX_PROJECT_VERSION,
  assertMusicBoxProject,
  type MusicBoxProject,
} from './project-format'

export type MusicBoxProjectCompatibility =
  | { status: 'current'; version: typeof MUSIC_BOX_PROJECT_VERSION }
  | { status: 'unsupported-older'; version: number }
  | { status: 'unsupported-future'; version: number }
  | { status: 'invalid'; version: null }

export function inspectMusicBoxProjectVersion(value: unknown): MusicBoxProjectCompatibility {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { status: 'invalid', version: null }
  const record = value as Record<string, unknown>
  if (record.format !== MUSIC_BOX_PROJECT_FORMAT || !Number.isInteger(record.version)) {
    return { status: 'invalid', version: null }
  }

  const version = record.version as number
  if (version === MUSIC_BOX_PROJECT_VERSION) return { status: 'current', version: MUSIC_BOX_PROJECT_VERSION }
  if (version < MUSIC_BOX_PROJECT_VERSION) return { status: 'unsupported-older', version }
  return { status: 'unsupported-future', version }
}

/**
 * Central compatibility boundary for native projects.
 *
 * There are no released pre-v1 project schemas, so v1 is currently the only
 * supported version. Future migrations must be added here explicitly rather
 * than silently coercing unknown project data.
 */
export function migrateMusicBoxProject(project: MusicBoxProject): MusicBoxProject {
  const compatibility = inspectMusicBoxProjectVersion(project)
  if (compatibility.status !== 'current') {
    throw new Error(`Unsupported Music Box Project version: ${compatibility.version ?? 'unknown'}`)
  }
  assertMusicBoxProject(project)
  return structuredClone(project)
}
