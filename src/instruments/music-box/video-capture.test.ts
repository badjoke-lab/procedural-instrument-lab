import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMusicBoxVideoCapture, validateVideoCaptureFps } from './video-capture'

class FakeMediaStream {
  tracks: unknown[] = []
  addTrack(track: unknown) {
    this.tracks.push(track)
  }
}

const originalMediaStream = globalThis.MediaStream

afterEach(() => {
  Object.defineProperty(globalThis, 'MediaStream', { value: originalMediaStream, configurable: true, writable: true })
})

describe('Music Box video capture', () => {
  it('validates practical capture frame rates', () => {
    expect(() => validateVideoCaptureFps(30)).not.toThrow()
    expect(() => validateVideoCaptureFps(0)).toThrow(/fps/)
    expect(() => validateVideoCaptureFps(60.5)).toThrow(/fps/)
    expect(() => validateVideoCaptureFps(61)).toThrow(/fps/)
  })

  it('combines canvas video and the existing live mechanical audio stream', () => {
    Object.defineProperty(globalThis, 'MediaStream', { value: FakeMediaStream, configurable: true, writable: true })
    const videoTrack = { stop: vi.fn() }
    const audioTrack = { stop: vi.fn() }
    const canvas = { captureStream: vi.fn(() => ({ getVideoTracks: () => [videoTrack] })) } as unknown as HTMLCanvasElement
    const audio = { captureStream: vi.fn(() => ({ getAudioTracks: () => [audioTrack] })), stopCapture: vi.fn() }
    const capture = createMusicBoxVideoCapture(canvas, audio as never, 30)
    expect(canvas.captureStream).toHaveBeenCalledWith(30)
    expect((capture.stream as unknown as FakeMediaStream).tracks).toEqual([videoTrack, audioTrack])
    capture.stop()
    capture.stop()
    expect(videoTrack.stop).toHaveBeenCalledOnce()
    expect(audio.stopCapture).toHaveBeenCalledOnce()
  })

  it('fails closed when canvas capture produces no video track', () => {
    Object.defineProperty(globalThis, 'MediaStream', { value: FakeMediaStream, configurable: true, writable: true })
    const canvas = { captureStream: vi.fn(() => ({ getVideoTracks: () => [] })) } as unknown as HTMLCanvasElement
    const audio = { captureStream: vi.fn(() => ({ getAudioTracks: () => [{ stop: vi.fn() }] })), stopCapture: vi.fn() }
    expect(() => createMusicBoxVideoCapture(canvas, audio as never)).toThrow(/no video track/)
    expect(audio.stopCapture).toHaveBeenCalledOnce()
  })
})
