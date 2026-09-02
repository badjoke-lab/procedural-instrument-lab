import type { MusicBoxAudio } from './audio'

export type MusicBoxVideoCapture = {
  stream: MediaStream
  stop: () => void
}

export function validateVideoCaptureFps(fps: number) {
  if (!Number.isInteger(fps) || fps < 1 || fps > 60) throw new Error('capture fps must be an integer between 1 and 60')
}

export function createMusicBoxVideoCapture(canvas: HTMLCanvasElement, audio: MusicBoxAudio, fps = 30): MusicBoxVideoCapture {
  validateVideoCaptureFps(fps)
  if (typeof canvas.captureStream !== 'function') throw new Error('Canvas captureStream is not supported')
  const videoStream = canvas.captureStream(fps)
  const audioStream = audio.captureStream()
  const stream = new MediaStream()
  const videoTracks = videoStream.getVideoTracks()
  const audioTracks = audioStream.getAudioTracks()
  if (videoTracks.length === 0) {
    audio.stopCapture()
    throw new Error('Canvas capture produced no video track')
  }
  if (audioTracks.length === 0) {
    videoTracks.forEach((track) => track.stop())
    audio.stopCapture()
    throw new Error('Music Box capture produced no audio track')
  }
  videoTracks.forEach((track) => stream.addTrack(track))
  audioTracks.forEach((track) => stream.addTrack(track))
  let stopped = false
  return {
    stream,
    stop: () => {
      if (stopped) return
      stopped = true
      videoTracks.forEach((track) => track.stop())
      audio.stopCapture()
    },
  }
}
