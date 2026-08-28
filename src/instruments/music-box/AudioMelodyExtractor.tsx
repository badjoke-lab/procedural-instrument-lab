import { useState } from 'react'
import { extractMelodyFromBlob } from './melody-extraction'
import type { TuneDocument } from './tune-document'

export type AudioMelodyExtractorCopy = {
  analyze: string
  analyzing: string
  ready: string
  failed: string
}

export function AudioMelodyExtractor({
  file,
  tempoBpm,
  copy,
  onExtract,
}: {
  file: File | null
  tempoBpm: number
  copy: AudioMelodyExtractorCopy
  onExtract: (document: TuneDocument) => void
}) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  if (!file) return null

  const analyze = async () => {
    setBusy(true)
    setStatus(copy.analyzing)
    try {
      const document = await extractMelodyFromBlob(file, tempoBpm)
      onExtract({ ...document, id: 'audio-file-melody', title: file.name })
      setStatus(copy.ready)
    } catch {
      setStatus(copy.failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="microphone-recorder-analysis audio-file-analysis">
      <button type="button" disabled={busy} onClick={() => void analyze()}>{busy ? copy.analyzing : copy.analyze}</button>
      {status && <p className="microphone-recorder-status" role="status">{status}</p>}
    </div>
  )
}
