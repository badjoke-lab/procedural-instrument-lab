import {
  MUSIC_BOX_PROJECT_FORMAT,
  MUSIC_BOX_PROJECT_VERSION,
  type MusicBoxProject,
} from './project-format'
import { parseMusicBoxProjectJson } from './project-import'

const SHARE_HASH_PREFIX = '#mbp='
export const MAX_MUSIC_BOX_SHARE_URL_LENGTH = 8_000

type CompactMusicBoxShareState = {
  v: typeof MUSIC_BOX_PROJECT_VERSION
  m: MusicBoxProject['metadata']
  t: MusicBoxProject['tune']
  c: MusicBoxProject['config']
}

function compactState(project: MusicBoxProject): CompactMusicBoxShareState {
  return {
    v: project.version,
    m: structuredClone(project.metadata),
    t: structuredClone(project.tune),
    c: structuredClone(project.config),
  }
}

export function createMusicBoxShareUrl(project: MusicBoxProject, baseUrl: string): string {
  const url = new URL(baseUrl)
  url.hash = `${SHARE_HASH_PREFIX.slice(1)}${encodeURIComponent(JSON.stringify(compactState(project)))}`
  const value = url.toString()
  if (value.length > MAX_MUSIC_BOX_SHARE_URL_LENGTH) {
    throw new Error('Music Box share URL is too large; share the native project file instead')
  }
  return value
}

export function parseMusicBoxShareUrl(urlValue: string): MusicBoxProject {
  const url = new URL(urlValue)
  if (!url.hash.startsWith(SHARE_HASH_PREFIX)) throw new Error('Music Box share URL is missing project data')

  let compact: unknown
  try {
    compact = JSON.parse(decodeURIComponent(url.hash.slice(SHARE_HASH_PREFIX.length)))
  } catch {
    throw new Error('Invalid Music Box share URL data')
  }

  if (typeof compact !== 'object' || compact === null || Array.isArray(compact)) {
    throw new Error('Invalid Music Box share URL data')
  }
  const record = compact as Record<string, unknown>
  const project = {
    format: MUSIC_BOX_PROJECT_FORMAT,
    version: record.v,
    instrument: 'music-box',
    metadata: record.m,
    tune: record.t,
    config: record.c,
  }

  return parseMusicBoxProjectJson(JSON.stringify(project))
}
