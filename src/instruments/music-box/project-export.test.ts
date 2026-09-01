import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMusicBoxProjectExport } from './project-export'
import { createMusicBoxProject } from './project-format'
import { createSequenceTuneDocument } from './tune-document'

function project(title = 'Export Test') {
  return createMusicBoxProject({
    tune: createSequenceTuneDocument({ id: 'export-test', title, pitches: [60, 64, 67] }),
    config: DEFAULT_MUSIC_BOX_CONFIG,
  })
}

describe('Music Box Project export', () => {
  it('serializes a validated native project without changing its data', () => {
    const source = project()
    const exported = createMusicBoxProjectExport(source)
    expect(JSON.parse(exported.json)).toEqual(source)
    expect(exported.json.endsWith('\n')).toBe(true)
  })

  it('uses a stable native-project filename suffix', () => {
    expect(createMusicBoxProjectExport(project('My Tune')).filename).toBe('My Tune.musicbox.json')
  })

  it('removes filesystem-hostile characters from the download filename', () => {
    expect(createMusicBoxProjectExport(project('A/B:C*D?')).filename).toBe('A-B-C-D-.musicbox.json')
  })

  it('rejects an invalid empty project title before export', () => {
    const source = project('Original')
    source.metadata.title = '   '
    expect(() => createMusicBoxProjectExport(source)).toThrow(/metadata.title/)
  })
})
