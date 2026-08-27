import { useRef, useState } from 'react'
import { importMidi } from './midi-import'
import type { TuneDocument } from './tune-document'

export type MidiImportCopy = {
  title: string
  intro: string
  choose: string
  imported: string
  failed: string
}

export function MidiImport({ onImport, copy }: { onImport: (document: TuneDocument) => void; copy: MidiImportCopy }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')

  const chooseFile = () => inputRef.current?.click()
  const load = async (file?: File) => {
    if (!file) return
    try {
      const result = importMidi(new Uint8Array(await file.arrayBuffer()), file.name.replace(/\.midi?$/i, ''))
      onImport(result.document)
      setStatus(result.warnings.length > 0 ? `${copy.imported} ${result.warnings.join(' ')}` : copy.imported)
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
