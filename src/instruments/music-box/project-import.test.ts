import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMusicBoxProjectExport } from './project-export'
import { createMusicBoxProject } from './project-format'
import { parseMusicBoxProjectJson } from './project-import'
import { createSequenceTuneDocument } from './tune-document'

function projectJson() {
  const project = createMusicBoxProject({
    tune: createSequenceTuneDocument({ id: 'import-test', title: 'Import Test', pitches: [60, 64, 67] }),
    config: DEFAULT_MUSIC_BOX_CONFIG,
  })
  return createMusicBoxProjectExport(project).json
}

describe('Music Box Project import', () => {
  it('restores a validated native project from exported JSON', () => {
    const imported = parseMusicBoxProjectJson(projectJson())
    expect(imported.metadata.title).toBe('Import Test')
    expect(imported.tune.notes.map((note) => note.pitch)).toEqual([60, 64, 67])
    expect(imported.config).toEqual(DEFAULT_MUSIC_BOX_CONFIG)
  })

  it('rejects malformed JSON', () => {
    expect(() => parseMusicBoxProjectJson('{nope')).toThrow('Invalid Music Box Project JSON')
  })

  it('rejects structurally incomplete project data before typed validation', () => {
    expect(() => parseMusicBoxProjectJson(JSON.stringify({ format: 'procedural-instrument-lab.music-box-project' }))).toThrow(
      'Invalid Music Box Project structure',
    )
  })

  it('rejects unsupported format and version through the native project boundary', () => {
    const wrongFormat = JSON.parse(projectJson())
    wrongFormat.format = 'other-format'
    expect(() => parseMusicBoxProjectJson(JSON.stringify(wrongFormat))).toThrow('unsupported project format')

    const wrongVersion = JSON.parse(projectJson())
    wrongVersion.version = 999
    expect(() => parseMusicBoxProjectJson(JSON.stringify(wrongVersion))).toThrow('unsupported project version')
  })

  it('returns an independent restored snapshot', () => {
    const imported = parseMusicBoxProjectJson(projectJson())
    const second = parseMusicBoxProjectJson(projectJson())
    imported.tune.notes[0].pitch = 72
    expect(second.tune.notes[0].pitch).toBe(60)
  })
})
