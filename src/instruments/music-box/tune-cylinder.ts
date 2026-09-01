import { analyzeMusicBoxCompatibility, type CompatibilityReport } from './compatibility'
import { compileTune, DEFAULT_MUSIC_BOX_CONFIG, type MusicBoxConfig, type Pin } from './mechanism'
import { tuneDocumentToNoteEvents, type TuneDocument } from './tune-document'

export type TuneCylinderCompilation = {
  documentId: string
  compatibility: CompatibilityReport
  pins: Pin[]
}

export function compileTuneDocumentToCylinder(
  document: TuneDocument,
  config: MusicBoxConfig = DEFAULT_MUSIC_BOX_CONFIG,
): TuneCylinderCompilation {
  const compatibility = analyzeMusicBoxCompatibility(document, config)
  const blocking = compatibility.issues.filter((issue) => issue.severity === 'blocking')
  if (blocking.length > 0) {
    const kinds = [...new Set(blocking.map((issue) => issue.kind))].join(', ')
    throw new Error(`TuneDocument cannot be compiled to the current cylinder: ${kinds}`)
  }

  const pins = compileTune(tuneDocumentToNoteEvents(document), config)
  if (pins.length !== document.notes.length) {
    throw new Error('TuneDocument cylinder compilation dropped one or more accepted notes')
  }

  return {
    documentId: document.id,
    compatibility,
    pins,
  }
}
