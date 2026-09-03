import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMusicBoxProject } from './project-format'
import { createMusicBoxShareUrl, MAX_MUSIC_BOX_SHARE_URL_LENGTH, parseMusicBoxShareUrl } from './share-url'
import { createSequenceTuneDocument } from './tune-document'

function project() {
  return createMusicBoxProject({
    tune: createSequenceTuneDocument({ id: 'share-url-test', title: 'Share URL Test', pitches: [60, 64, 67] }),
    config: DEFAULT_MUSIC_BOX_CONFIG,
    metadata: { description: 'Compact URL round trip' },
  })
}

describe('Music Box share URL', () => {
  it('round-trips the safe editable project state through the URL fragment', () => {
    const source = project()
    const url = createMusicBoxShareUrl(source, 'https://example.test/music-box?lang=en#old')
    const restored = parseMusicBoxShareUrl(url)

    expect(url).toContain('#mbp=')
    expect(restored).toEqual(source)
    expect(restored).not.toHaveProperty('audio')
    expect(restored).not.toHaveProperty('sourceAudio')
  })

  it('rejects URLs without Music Box project data', () => {
    expect(() => parseMusicBoxShareUrl('https://example.test/music-box#other=1')).toThrow(/missing project data/)
  })

  it('rejects invalid encoded project data', () => {
    expect(() => parseMusicBoxShareUrl('https://example.test/music-box#mbp=%7Bnope')).toThrow(/Invalid Music Box share URL data/)
  })

  it('fails closed when a share URL exceeds the supported size budget', () => {
    const source = project()
    source.metadata.description = 'x'.repeat(MAX_MUSIC_BOX_SHARE_URL_LENGTH)
    expect(() => createMusicBoxShareUrl(source, 'https://example.test/music-box')).toThrow(/native project file/)
  })
})
