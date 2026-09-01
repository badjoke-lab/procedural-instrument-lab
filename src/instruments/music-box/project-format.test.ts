import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import {
  MUSIC_BOX_PROJECT_FORMAT,
  MUSIC_BOX_PROJECT_VERSION,
  assertMusicBoxProject,
  createMusicBoxProject,
  validateMusicBoxProject,
} from './project-format'
import { createSequenceTuneDocument } from './tune-document'

describe('Music Box Project format', () => {
  const tune = createSequenceTuneDocument({ id: 'project-format-test', title: 'Project Format Test', pitches: [60, 64, 67] })

  it('creates a versioned native project carrying tune and mechanism configuration', () => {
    const project = createMusicBoxProject({ tune, config: DEFAULT_MUSIC_BOX_CONFIG })
    expect(project.format).toBe(MUSIC_BOX_PROJECT_FORMAT)
    expect(project.version).toBe(MUSIC_BOX_PROJECT_VERSION)
    expect(project.instrument).toBe('music-box')
    expect(project.metadata.title).toBe(tune.title)
    expect(project.tune).toEqual(tune)
    expect(project.config).toEqual(DEFAULT_MUSIC_BOX_CONFIG)
    expect(validateMusicBoxProject(project)).toEqual([])
  })

  it('takes an independent snapshot instead of retaining mutable source references', () => {
    const config = structuredClone(DEFAULT_MUSIC_BOX_CONFIG)
    const sourceTune = structuredClone(tune)
    const project = createMusicBoxProject({ tune: sourceTune, config })

    sourceTune.notes[0].pitch = 72
    config.notes[0] = 72

    expect(project.tune.notes[0].pitch).toBe(60)
    expect(project.config.notes[0]).toBe(60)
  })

  it('rejects invalid tune and mechanism configuration through the project boundary', () => {
    const project = createMusicBoxProject({ tune, config: DEFAULT_MUSIC_BOX_CONFIG })
    const invalid = structuredClone(project)
    invalid.tune.tempoBpm = 0
    invalid.config.cylinderRadius = 0

    expect(validateMusicBoxProject(invalid)).toEqual(
      expect.arrayContaining(['tune: tempoBpm must be positive', 'config: cylinderRadius must be positive']),
    )
    expect(() => assertMusicBoxProject(invalid)).toThrow('Invalid Music Box Project')
  })

  it('keeps source audio outside the native project schema', () => {
    const project = createMusicBoxProject({ tune, config: DEFAULT_MUSIC_BOX_CONFIG })
    expect(project).not.toHaveProperty('audio')
    expect(project).not.toHaveProperty('sourceAudio')
  })
})
