import { useState } from 'react'
import { extractMelodyFromBlob } from './melody-extraction'
import type { TuneDocument } from './tune-document'

export type MicMelodyExtractorCopy = {
  analyze: string
  analyzing: string
  ready: string
  failed: string
}

export function MicMelodyExtractor({
  clip,
  tempoBpm,
  copy,
  onExtract,
}: {
  clip: Blob | null
  tempoBpm: number
  copy: MicMelodyExtractorCopy
  onExtract: (document: TuneDocument) => void
}) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  if (!clip) return null

  const analyze = async () => {
    setBusy(true)
    setStatus(copy.analyzing)
    try {
      const document = await extractMelodyFromBlob(clip, tempoBpm)
      onExtract(document)
      setStatus(copy.ready)
    } catch {
      setStatus(copy.failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="microphone-recorder-analysis">
      <button type="button" disabled={busy} onClick={() => void analyze()}>{busy ? copy.analyzing : copy.analyze}</button>
      {status && <p className="microphone-recorder-status" role="status">{status}</p>}
    </div>
  )
}
