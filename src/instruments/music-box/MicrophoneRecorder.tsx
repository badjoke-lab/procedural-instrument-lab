import { useEffect, useRef, useState } from 'react'
import './microphone-recorder.css'

export type MicrophoneRecorderCopy = {
  title: string
  intro: string
  start: string
  stop: string
  discard: string
  recording: string
  ready: string
  unsupported: string
  denied: string
  preview: string
}

export function preferredRecordingMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return undefined
  for (const type of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return undefined
}

export function MicrophoneRecorder({ copy, onClipChange }: { copy: MicrophoneRecorderCopy; onClipChange?: (clip: Blob | null) => void }) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const clipUrlRef = useRef('')
  const [recording, setRecording] = useState(false)
  const [clipUrl, setClipUrl] = useState('')
  const [status, setStatus] = useState('')

  const replaceClip = (url = '') => {
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current)
    clipUrlRef.current = url
    setClipUrl(url)
  }

  const closeStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus(copy.unsupported)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      replaceClip()
      onClipChange?.(null)
      const mimeType = preferredRecordingMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        replaceClip(URL.createObjectURL(blob))
        onClipChange?.(blob)
        setStatus(copy.ready)
        closeStream()
        recorderRef.current = null
      }
      recorder.start()
      setRecording(true)
      setStatus(copy.recording)
    } catch {
      closeStream()
      recorderRef.current = null
      setRecording(false)
      setStatus(copy.denied)
    }
  }

  const stop = () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recorder.stop()
    setRecording(false)
  }

  const discard = () => {
    replaceClip()
    onClipChange?.(null)
    setStatus('')
  }

  useEffect(() => () => {
    const recorder = recorderRef.current
    recorderRef.current = null
    if (recorder) {
      recorder.ondataavailable = null
      recorder.onstop = null
      if (recorder.state !== 'inactive') recorder.stop()
    }
    closeStream()
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current)
    clipUrlRef.current = ''
  }, [])

  return (
    <section className="microphone-recorder" role="region" aria-label={copy.title}>
      <div className="microphone-recorder-copy">
        <strong>{copy.title}</strong>
        <span>{copy.intro}</span>
      </div>
      <div className="microphone-recorder-actions">
        {recording ? (
          <button type="button" onClick={stop}>{copy.stop}</button>
        ) : (
          <button type="button" onClick={() => void start()}>{copy.start}</button>
        )}
        {clipUrl && <button type="button" onClick={discard}>{copy.discard}</button>}
      </div>
      {status && <p className="microphone-recorder-status" role="status">{status}</p>}
      {clipUrl && <audio aria-label={copy.preview} controls src={clipUrl} />}
    </section>
  )
}
