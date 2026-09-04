import type { Locale } from '../../i18n/messages'
import { musicBoxCompatibilityCopy } from '../../i18n/music-box-compatibility'
import { analyzeMusicBoxCompatibility, type CompatibilityIssueKind } from './compatibility'
import type { MusicBoxConfig } from './mechanism'
import type { TuneDocument } from './tune-document'
import './compatibility.css'

const KIND_ORDER: CompatibilityIssueKind[] = ['range', 'simultaneous', 'density', 'pin-spacing']

function uniquePitches(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b)
}

export function CompatibilityPanel({ document, locale, config }: { document: TuneDocument; locale: Locale; config: MusicBoxConfig }) {
  const copy = musicBoxCompatibilityCopy[locale]
  const report = analyzeMusicBoxCompatibility(document, config)
  const blocking = report.issues.filter((issue) => issue.severity === 'blocking').length
  const review = report.issues.filter((issue) => issue.severity === 'review').length

  const labels: Record<CompatibilityIssueKind, string> = {
    range: copy.range,
    simultaneous: copy.simultaneous,
    density: copy.density,
    'pin-spacing': copy.pinSpacing,
  }

  return (
    <section className="screen-keyboard compatibility-panel" role="region" aria-label={copy.title}>
      <div className="screen-keyboard-heading">
        <div>
          <strong>{copy.title}</strong>
          <span>{copy.intro}</span>
        </div>
        <span className="screen-keyboard-recording" role="status">
          {report.playable ? copy.fits : copy.needsFit}
        </span>
      </div>
      <div className="compatibility-summary">
        <span>{copy.supported}: <strong>{report.supportedNotes}/{report.totalNotes}</strong></span>
        <span>{copy.blocking}: <strong>{blocking}</strong></span>
        <span>{copy.review}: <strong>{review}</strong></span>
      </div>
      {report.issues.length > 0 && (
        <ul className="compatibility-issues">
          {KIND_ORDER.map((kind) => {
            const issues = report.issues.filter((issue) => issue.kind === kind)
            if (issues.length === 0) return null
            const pitches = uniquePitches(issues.flatMap((issue) => issue.pitches))
            return (
              <li key={kind} data-kind={kind}>
                <span>{labels[kind]}</span>
                <strong>{issues.length}</strong>
                {pitches.length > 0 && <small>MIDI {pitches.join(', ')}</small>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
