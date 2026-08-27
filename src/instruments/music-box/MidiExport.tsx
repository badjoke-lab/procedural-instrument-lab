import './midi-export.css'
import { exportMidi, midiExportFilename } from './midi-export'
import type { TuneDocument } from './tune-document'

export type MidiExportCopy = {
  title: string
  intro: string
  download: string
}

export function MidiExport({ document, copy }: { document: TuneDocument; copy: MidiExportCopy }) {
  const download = () => {
    const bytes = exportMidi(document)
    const buffer = new ArrayBuffer(bytes.byteLength)
    new Uint8Array(buffer).set(bytes)
    const blob = new Blob([buffer], { type: 'audio/midi' })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = midiExportFilename(document.title)
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <section className="midi-export" role="region" aria-label={copy.title}>
      <div><strong>{copy.title}</strong><span>{copy.intro}</span></div>
      <button type="button" onClick={download}>{copy.download}</button>
    </section>
  )
}
