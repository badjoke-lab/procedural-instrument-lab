import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMusicBoxProject } from './project-format'
import { inspectMusicBoxProjectVersion, migrateMusicBoxProject } from './project-version'
import { createSequenceTuneDocument } from './tune-document'

function project() {
  return createMusicBoxProject({
    tune: createSequenceTuneDocument({ id: 'version-test', title: 'Version Test', pitches: [60, 64, 67] }),
    config: DEFAULT_MUSIC_BOX_CONFIG,
  })
}

describe('Music Box Project version compatibility', () => {
  it('recognizes the current native project version', () => {
    expect(inspectMusicBoxProjectVersion(project())).toEqual({ status: 'current', version: 1 })
  })

  it('rejects unsupported older versions instead of silently coercing them', () => {
    const value = { ...project(), version: 0 }
    expect(inspectMusicBoxProjectVersion(value)).toEqual({ status: 'unsupported-older', version: 0 })
  })

  it('rejects unsupported future versions', () => {
    const value = { ...project(), version: 2 }
    expect(inspectMusicBoxProjectVersion(value)).toEqual({ status: 'unsupported-future', version: 2 })
  })

  it('treats unrelated data as invalid rather than as a project version', () => {
    expect(inspectMusicBoxProjectVersion({ version: 1 })).toEqual({ status: 'invalid', version: null })
  })

  it('returns an independent current-version snapshot through the migration boundary', () => {
    const source = project()
    const migrated = migrateMusicBoxProject(source)
    source.tune.notes[0].pitch = 72
    expect(migrated.tune.notes[0].pitch).toBe(60)
  })
})
