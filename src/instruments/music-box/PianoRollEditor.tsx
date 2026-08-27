import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { MusicBoxAudio } from './audio'
import { MidiImport } from './MidiImport'
import { ScreenKeyboard } from './ScreenKeyboard'
import {
  addPianoRollNote,
  deletePianoRollNote,
  updatePianoRollNote,
  type PianoRollDraft,
} from './piano-roll-model'

const PITCHES = [72, 71, 69, 67, 65, 64, 62, 60]
const PITCH_NAMES: Record<number, string> = {
  60: 'C4', 62: 'D4', 64: 'E4', 65: 'F4', 67: 'G4', 69: 'A4', 71: 'B4', 72: 'C5',
}
const keyboardPreviewAudio = new MusicBoxAudio()

export type PianoRollCopy = {
  title: string
  intro: string
  addNote: string
  removeNote: string
  pitch: string
  start: string
  duration: string
  empty: string
}

export function PianoRollEditor({
  document,
  onChange,
  copy,
}: {
  document: PianoRollDraft
  onChange: (next: PianoRollDraft) => void
  copy: PianoRollCopy
}) {
  const [selectedNoteId, setSelectedNoteId] = useState(document.notes[0]?.id ?? '')
  const selected = document.notes.find((note) => note.id === selectedNoteId) ?? document.notes[0]
  const columns = Math.max(1, Math.ceil(document.lengthBeats))
  const gridStyle = useMemo(() => ({ '--piano-roll-columns': columns } as CSSProperties), [columns])
  const japanese = copy.title === '作曲'

  useEffect(() => {
    const revealFromHash = () => {
      if (window.location.hash !== '#compose') return
      const drawer = documentRef('compose')
      if (drawer) drawer.open = true
    }
    revealFromHash()
    window.addEventListener('hashchange', revealFromHash)
    return () => window.removeEventListener('hashchange', revealFromHash)
  }, [])

  const addNote = () => {
    const durationBeats = Math.min(0.5, document.lengthBeats)
    const maxStart = Math.max(0, document.lengthBeats - durationBeats)
    const nextStart = Math.min(maxStart, selected ? selected.startBeat + 1 : 0)
    const next = addPianoRollNote(document, { pitch: selected?.pitch ?? 60, startBeat: nextStart, durationBeats })
    const existing = new Set(document.notes.map((note) => note.id))
    const added = next.notes.find((note) => !existing.has(note.id))
    onChange(next)
    if (added) setSelectedNoteId(added.id)
  }

  const removeSelected = () => {
    if (!selected) return
    const next = deletePianoRollNote(document, selected.id)
    onChange(next)
    setSelectedNoteId(next.notes[0]?.id ?? '')
  }

  const updateSelected = (patch: Parameters<typeof updatePianoRollNote>[2]) => {
    if (!selected) return
    try {
      onChange(updatePianoRollNote(document, selected.id, patch))
    } catch {
      // Keep the last valid document while a number input is temporarily incomplete.
    }
  }

  return (
    <section className="piano-roll-editor" aria-label={copy.title}>
      <div className="piano-roll-heading">
        <div><strong>{copy.title}</strong><span>{copy.intro}</span></div>
        <div className="piano-roll-actions">
          <button type="button" onClick={addNote}>{copy.addNote}</button>
          <button type="button" disabled={!selected} onClick={removeSelected}>{copy.removeNote}</button>
        </div>
      </div>

      <MidiImport
        onImport={(next) => {
          setSelectedNoteId(next.notes[0]?.id ?? '')
          onChange(next)
        }}
        copy={japanese ? {
          title: 'MIDIを読み込む',
          intro: '.mid / .midi を編集可能な曲データとして読み込みます。音域外の音はここでは勝手に変換しません。',
          choose: 'MIDIファイルを選ぶ',
          imported: 'MIDIを読み込みました。',
          failed: 'MIDIを読み込めませんでした。',
          outOfRange: '現在のC4〜C5機構ではまだ鳴らせない音を保持しています。',
        } : {
          title: 'Import MIDI',
          intro: 'Load .mid / .midi as editable tune data. Out-of-range notes are preserved for later fitting.',
          choose: 'Choose MIDI file',
          imported: 'MIDI imported.',
          failed: 'Could not import MIDI.',
          outOfRange: 'Notes outside the current C4-C5 mechanism were preserved but are not previewed yet.',
        }}
      />

      <ScreenKeyboard
        document={document}
        onChange={onChange}
        onPreview={(pitch) => { void keyboardPreviewAudio.pluck(pitch) }}
        copy={japanese ? {
          title: '画面鍵盤',
          intro: '鍵盤を弾けます。録音すると演奏が下の編集データに追加されます。',
          record: '録音',
          stopRecording: '録音停止',
          recording: '録音中',
          computerKeyboardHint: 'PCでは A S D F G H J K キーでも C4〜C5 を演奏・録音できます。',
        } : {
          title: 'On-screen keyboard',
          intro: 'Play the keys. Record adds the performance to the editable notes below.',
          record: 'Record',
          stopRecording: 'Stop recording',
          recording: 'Recording',
          computerKeyboardHint: 'On a computer, A S D F G H J K also play and record C4-C5.',
        }}
      />

      <div className="piano-roll-scroll">
        <div className="piano-roll-grid" style={gridStyle}>
          {PITCHES.map((pitch) => (
            <div className="piano-roll-row" key={pitch}>
              <span className="piano-roll-key">{PITCH_NAMES[pitch]}</span>
              <div className="piano-roll-lane">
                {document.notes.filter((note) => note.pitch === pitch).map((note) => (
                  <button
                    type="button"
                    key={note.id}
                    className="piano-roll-note"
                    aria-pressed={selected?.id === note.id}
                    title={`${PITCH_NAMES[pitch]} · ${note.startBeat}`}
                    onClick={() => setSelectedNoteId(note.id)}
                    style={{
                      left: `${(note.startBeat / document.lengthBeats) * 100}%`,
                      width: `${Math.max(1.5, (note.durationBeats / document.lengthBeats) * 100)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="piano-roll-inspector">
          <label>{copy.pitch}
            <select value={selected.pitch} onChange={(event) => updateSelected({ pitch: Number(event.target.value) })}>
              {[...PITCHES].reverse().map((pitch) => <option key={pitch} value={pitch}>{PITCH_NAMES[pitch]}</option>)}
            </select>
          </label>
          <label>{copy.start}
            <input type="number" min="0" max={document.lengthBeats - 0.25} step="0.25" value={selected.startBeat} onChange={(event) => updateSelected({ startBeat: Number(event.target.value) })} />
          </label>
          <label>{copy.duration}
            <input type="number" min="0.25" max={document.lengthBeats - selected.startBeat} step="0.25" value={selected.durationBeats} onChange={(event) => updateSelected({ durationBeats: Number(event.target.value) })} />
          </label>
        </div>
      ) : <p className="piano-roll-empty">{copy.empty}</p>}
    </section>
  )
}

function documentRef(id: string): HTMLDetailsElement | null {
  const element = window.document.getElementById(id)
  return element instanceof HTMLDetailsElement ? element : null
}
