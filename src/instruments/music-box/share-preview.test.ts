import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMusicBoxProject } from './project-format'
import { createMusicBoxSharePreview } from './share-preview'
import { createSequenceTuneDocument } from './tune-document'

describe('Music Box share preview', () => {
  it('derives compact preview metadata without source audio', () => {
    const project = createMusicBoxProject({
      tune: createSequenceTuneDocument({ id: 'preview', title: 'Preview Tune', pitches: [60, 64, 67], tempoBpm: 120 }),
      config: DEFAULT_MUSIC_BOX_CONFIG,
      metadata: { title: 'Shared Preview' },
    })
    const preview = createMusicBoxSharePreview(project)
    expect(preview.title).toBe('Shared Preview')
    expect(preview.noteCount).toBe(3)
    expect(preview.tempoBpm).toBe(120)
    expect(preview.durationSeconds).toBeCloseTo(1.5)
    expect(preview.lowestPitch).toBe(60)
    expect(preview.highestPitch).toBe(67)
    expect(preview.description).toContain('3 notes')
  })

  it('prefers explicit project description', () => {
    const project = createMusicBoxProject({
      tune: createSequenceTuneDocument({ id: 'preview-description', title: 'Tune', pitches: [60] }),
      config: DEFAULT_MUSIC_BOX_CONFIG,
      metadata: { title: 'Shared', description: 'Custom preview copy' },
    })
    expect(createMusicBoxSharePreview(project).description).toBe('Custom preview copy')
  })
})
