import { useRef, useState } from 'react'
import './midi-import.css'
import { importMidi } from './midi-import'
import type { TuneDocument } from './tune-document'

const CURRENT_COMB = new Set([60, 62, 64, 65, 67, 69, 71, 72])

export type MidiImportCopy = {
  title: string
  intro: string
  choose: string
  imported: string
  failed: string
  outOfRange: string
}

export function MidiImport({ onImport, copy }: { onImport: (document: TuneDocument) => void; copy: MidiImportCopy }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')

  const chooseFile = () => inputRef.current?.click()
  const load = async (file?: File) => {
    if (!file) return
    try {
      const result = importMidi(new Uint8Array(await file.arrayBuffer()), file.name.replace(/\.midi?$/i, ''))
      const outOfRangeCount = result.document.notes.filter((note) => !CURRENT_COMB.has(note.pitch)).length
      onImport(result.document)
      const messages = [copy.imported, ...result.warnings]
      if (outOfRangeCount > 0) messages.push(`${copy.outOfRange} (${outOfRangeCount})`)
      setStatus(messages.join(' '))
    } catch (error) {
      setStatus(`${copy.failed} ${error instanceof Error ? error.message : ''}`.trim())
    }
  }

  return (
    <section className="midi-import" role="region" aria-label={copy.title}>
      <div><strong>{copy.title}</strong><span>{copy.intro}</span></div>
      <input ref={inputRef} type="file" accept=".mid,.midi,audio/midi,audio/x-midi" hidden onChange={(event) => void load(event.target.files?.[0])} />
      <button type="button" onClick={chooseFile}>{copy.choose}</button>
      {status && <p role="status">{status}</p>}
    </section>
  )
}
