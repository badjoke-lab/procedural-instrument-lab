import { useEffect, useRef, useState } from 'react'
import './audio-file-import.css'

export type AudioFileImportCopy = {
  title: string
  intro: string
  choose: string
  ready: string
  discard: string
  unsupported: string
  preview: string
}

export function isSupportedAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true
  return /\.(wav|mp3|m4a|aac|ogg|webm)$/i.test(file.name)
}

export function AudioFileImport({ copy, onFileChange }: { copy: AudioFileImportCopy; onFileChange?: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const urlRef = useRef('')
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState('')

  const replacePreview = (url = '') => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = url
    setPreviewUrl(url)
  }

  const choose = (file: File | undefined) => {
    if (!file) return
    if (!isSupportedAudioFile(file)) {
      replacePreview()
      setFileName('')
      setStatus(copy.unsupported)
      onFileChange?.(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    replacePreview(URL.createObjectURL(file))
    setFileName(file.name)
    setStatus(copy.ready)
    onFileChange?.(file)
  }

  const discard = () => {
    replacePreview()
    setFileName('')
    setStatus('')
    onFileChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = ''
  }, [])

  return (
    <section className="audio-file-import" role="region" aria-label={copy.title}>
      <div className="audio-file-import-copy">
        <strong>{copy.title}</strong>
        <span>{copy.intro}</span>
      </div>
      <div className="audio-file-import-actions">
        <label className="audio-file-import-picker">
          {copy.choose}
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.webm"
            onChange={(event) => choose(event.target.files?.[0])}
          />
        </label>
        {previewUrl && <button type="button" onClick={discard}>{copy.discard}</button>}
      </div>
      {fileName && <p className="audio-file-import-name">{fileName}</p>}
      {status && <p className="audio-file-import-status" role="status">{status}</p>}
      {previewUrl && <audio aria-label={copy.preview} controls src={previewUrl} />}
    </section>
  )
}
