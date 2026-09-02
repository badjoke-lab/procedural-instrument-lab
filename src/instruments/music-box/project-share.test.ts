import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMusicBoxProject } from './project-format'
import { createMusicBoxProjectShareFile, shareMusicBoxProjectFile } from './project-share'
import { createSequenceTuneDocument } from './tune-document'

function project() {
  return createMusicBoxProject({
    tune: createSequenceTuneDocument({ id: 'share-test', title: 'Share Test', pitches: [60, 64, 67] }),
    config: DEFAULT_MUSIC_BOX_CONFIG,
  })
}

describe('Music Box Project file sharing', () => {
  it('creates the native project as a local shareable file', async () => {
    const file = createMusicBoxProjectShareFile(project())
    expect(file.name).toBe('Share Test.musicbox.json')
    expect(file.type).toBe('application/json')
    expect(JSON.parse(await file.text()).metadata.title).toBe('Share Test')
  })

  it('uses Web Share only when the browser confirms file sharing support', async () => {
    const share = vi.fn(async () => undefined)
    const canShare = vi.fn(() => true)
    const result = await shareMusicBoxProjectFile(project(), { share, canShare } as never)

    expect(result).toBe('shared')
    expect(canShare).toHaveBeenCalledOnce()
    expect(share).toHaveBeenCalledOnce()
    const payload = share.mock.calls[0][0]
    expect(payload.files).toHaveLength(1)
    expect(payload.files?.[0].name).toBe('Share Test.musicbox.json')
  })
})
