import type { MusicBoxVideoCapture } from './video-capture'

const WEBM_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
] as const

export type MusicBoxVideoRecorder = {
  mimeType: string
  stop: () => Promise<Blob>
}

export function selectMusicBoxWebmMimeType(isTypeSupported: (mimeType: string) => boolean) {
  const mimeType = WEBM_MIME_CANDIDATES.find((candidate) => isTypeSupported(candidate))
  if (!mimeType) throw new Error('WebM recording is not supported in this browser')
  return mimeType
}

export function startMusicBoxWebmRecording(capture: MusicBoxVideoCapture): MusicBoxVideoRecorder {
  if (typeof MediaRecorder === 'undefined') throw new Error('MediaRecorder is not supported in this browser')
  const mimeType = selectMusicBoxWebmMimeType((candidate) => MediaRecorder.isTypeSupported(candidate))
  const recorder = new MediaRecorder(capture.stream, { mimeType })
  const chunks: BlobPart[] = []

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  })

  recorder.start()

  let stopPromise: Promise<Blob> | null = null
  return {
    mimeType,
    stop: () => {
      if (stopPromise) return stopPromise
      stopPromise = new Promise<Blob>((resolve, reject) => {
        recorder.addEventListener('error', () => reject(new Error('WebM recording failed')), { once: true })
        recorder.addEventListener(
          'stop',
          () => {
            capture.stop()
            resolve(new Blob(chunks, { type: mimeType }))
          },
          { once: true },
        )
        if (recorder.state === 'inactive') {
          capture.stop()
          resolve(new Blob(chunks, { type: mimeType }))
          return
        }
        recorder.stop()
      })
      return stopPromise
    },
  }
}

export function downloadMusicBoxWebm(blob: Blob, filename = 'music-box.webm') {
  if (typeof document === 'undefined') throw new Error('WebM download requires a browser document')
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.webm') ? filename : `${filename}.webm`
  anchor.hidden = true
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
