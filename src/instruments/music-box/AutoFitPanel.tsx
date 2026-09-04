import { useState } from 'react'
import type { Locale } from '../../i18n/messages'
import { musicBoxAutoFitCopy } from '../../i18n/music-box-auto-fit'
import { analyzeMusicBoxCompatibility } from './compatibility'
import { autoFitMusicBoxTune, type AutoFitResult } from './auto-fit'
import type { MusicBoxConfig } from './mechanism'
import type { TuneDocument } from './tune-document'
import './auto-fit.css'

export function AutoFitPanel({
  document,
  locale,
  config,
  proposal,
  onProposal,
  onAcceptProposal,
}: {
  document: TuneDocument
  locale: Locale
  config: MusicBoxConfig
  proposal: AutoFitResult | null
  onProposal: (proposal: AutoFitResult | null) => void
  onAcceptProposal: () => void
}) {
  const copy = musicBoxAutoFitCopy[locale]
  const [octaveMoves, setOctaveMoves] = useState(false)
  const [nearestNoteMapping, setNearestNoteMapping] = useState(false)
  const [quantizeStep, setQuantizeStep] = useState<number | null>(null)
  const [simplifyDenseRepeats, setSimplifyDenseRepeats] = useState(false)
  const enabled = octaveMoves || nearestNoteMapping || quantizeStep !== null || simplifyDenseRepeats
  const before = analyzeMusicBoxCompatibility(document, config)
  const beforeBlocking = before.issues.filter((issue) => issue.severity === 'blocking').length

  const changeOption = (update: () => void) => {
    update()
    onProposal(null)
  }

  const generate = () => {
    onProposal(autoFitMusicBoxTune(document, {
      octaveMoves,
      nearestNoteMapping,
      quantizeStep,
      simplifyDenseRepeats,
    }, config))
  }

  const counts = proposal ? {
    octave: proposal.changes.filter((change) => change.kind === 'octave').length,
    nearest: proposal.changes.filter((change) => change.kind === 'nearest').length,
    quantize: proposal.changes.filter((change) => change.kind === 'quantize').length,
    remove: proposal.changes.filter((change) => change.kind === 'remove').length,
  } : null
  const afterBlocking = proposal
    ? proposal.compatibility.issues.filter((issue) => issue.severity === 'blocking').length
    : null

  return (
    <section className="screen-keyboard auto-fit-panel" role="region" aria-label={copy.title}>
      <div className="screen-keyboard-heading">
        <div>
          <strong>{copy.title}</strong>
          <span>{copy.intro}</span>
        </div>
      </div>

      <div className="auto-fit-options">
        <label className="auto-fit-option">
          <input
            type="checkbox"
            checked={octaveMoves}
            onChange={(event) => changeOption(() => setOctaveMoves(event.target.checked))}
          />
          <span><strong>{copy.octaveMoves}</strong><small>{copy.octaveHelp}</small></span>
        </label>
        <label className="auto-fit-option">
          <input
            type="checkbox"
            checked={nearestNoteMapping}
            onChange={(event) => changeOption(() => setNearestNoteMapping(event.target.checked))}
          />
          <span><strong>{copy.nearestNote}</strong><small>{copy.nearestHelp}</small></span>
        </label>
        <label className="auto-fit-quantize">
          <span>{copy.quantize}</span>
          <select
            aria-label={copy.quantize}
            value={quantizeStep ?? 'off'}
            onChange={(event) => changeOption(() => setQuantizeStep(event.target.value === 'off' ? null : Number(event.target.value)))}
          >
            <option value="off">{copy.quantizeOff}</option>
            <option value="0.25">{copy.quarterBeat}</option>
            <option value="0.5">{copy.halfBeat}</option>
          </select>
        </label>
        <label className="auto-fit-option">
          <input
            type="checkbox"
            checked={simplifyDenseRepeats}
            onChange={(event) => changeOption(() => setSimplifyDenseRepeats(event.target.checked))}
          />
          <span><strong>{copy.simplify}</strong><small>{copy.simplifyHelp}</small></span>
        </label>
      </div>

      <button type="button" disabled={!enabled} onClick={generate}>{copy.generate}</button>

      {proposal && counts && afterBlocking !== null && (
        <div className="auto-fit-result" role="status">
          <strong>{copy.proposalReady}</strong>
          <span>{copy.sourceNotes}: {document.notes.length} · {copy.fittedNotes}: {proposal.document.notes.length}</span>
          <span>{copy.changes}: {proposal.changes.length}</span>
          <span>{copy.blocking}: {beforeBlocking} → {afterBlocking}</span>
          <small>{copy.octaveCount}: {counts.octave} · {copy.nearestCount}: {counts.nearest} · {copy.quantizeCount}: {counts.quantize} · {copy.removedCount}: {counts.remove}</small>
          <small>{copy.manualCorrection}</small>
          <div className="piano-roll-actions">
            <button type="button" onClick={onAcceptProposal}>{copy.acceptProposal}</button>
            <button type="button" onClick={() => onProposal(null)}>{copy.discardProposal}</button>
          </div>
        </div>
      )}
    </section>
  )
}
