import { analyzeMusicBoxCompatibility } from './compatibility'
import type { TuneDocument } from './tune-document'

export function CompatibilityPanel({ document, japanese }: { document: TuneDocument; japanese: boolean }) {
  const report = analyzeMusicBoxCompatibility(document)
  const blocking = report.issues.filter((issue) => issue.severity === 'blocking')
  const review = report.issues.filter((issue) => issue.severity === 'review')

  return (
    <section className="compatibility-panel" aria-label={japanese ? '互換性チェック' : 'Compatibility check'}>
      <strong>{japanese ? 'オルゴール互換性' : 'Music box compatibility'}</strong>
      <p>{report.playable
        ? (japanese ? `現在の櫛歯で ${report.supportedNotes}/${report.totalNotes} 音を配置できます。` : `${report.supportedNotes}/${report.totalNotes} notes fit the current comb without blocking conflicts.`)
        : (japanese ? `${blocking.length} 件の機構上の問題があります。Auto Fitの前に内容を確認してください。` : `${blocking.length} blocking mechanism conflict(s). Review them before Auto Fit.`)}
      </p>
      {report.issues.length > 0 && <ul>
        {report.issues.map((issue, index) => <li key={`${issue.kind}-${index}`} data-kind={issue.kind} data-severity={issue.severity}>
          <b>{label(issue.kind, japanese)}</b>: {localDetail(issue.kind, issue.detail, issue.noteIds.length, japanese)}
        </li>)}
      </ul>}
      {review.length > 0 && <p>{japanese ? '同時発音は現在のモデルでは配置できますが、複数櫛歯の同時負荷として確認対象に残します。' : 'Simultaneous starts can be represented by the current model, but remain flagged for chord-loading review.'}</p>}
    </section>
  )
}

function label(kind: string, japanese: boolean) {
  const en: Record<string, string> = { range: 'Range', simultaneous: 'Simultaneous notes', density: 'Density', 'pin-spacing': 'Pin spacing' }
  const ja: Record<string, string> = { range: '音域', simultaneous: '同時発音', density: '密度', 'pin-spacing': 'ピン間隔' }
  return (japanese ? ja : en)[kind] ?? kind
}

function localDetail(kind: string, fallback: string, count: number, japanese: boolean) {
  if (!japanese) return fallback
  if (kind === 'range') return '現在のC4〜C5櫛歯にない音程です。'
  if (kind === 'simultaneous') return `${count}音が同時に開始します。`
  if (kind === 'density') return '同じ櫛歯のピン密度が現在の推奨間隔を超えています。'
  if (kind === 'pin-spacing') return '同じ櫛歯のピン同士が現在のピン径では近すぎます。'
  return fallback
}
