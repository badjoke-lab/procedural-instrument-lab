import { describe, expect, it } from 'vitest'
import { selectMusicBoxWebmMimeType } from './video-export'

describe('Music Box WebM export', () => {
  it('prefers VP9+Opus when supported', () => {
    expect(selectMusicBoxWebmMimeType((mimeType) => mimeType !== 'video/webm')).toBe('video/webm;codecs=vp9,opus')
  })

  it('falls back through browser-practical WebM variants', () => {
    expect(selectMusicBoxWebmMimeType((mimeType) => mimeType === 'video/webm;codecs=vp8,opus')).toBe(
      'video/webm;codecs=vp8,opus',
    )
    expect(selectMusicBoxWebmMimeType((mimeType) => mimeType === 'video/webm')).toBe('video/webm')
  })

  it('fails closed instead of pretending unsupported WebM export works', () => {
    expect(() => selectMusicBoxWebmMimeType(() => false)).toThrow(/WebM recording is not supported/)
  })
})
