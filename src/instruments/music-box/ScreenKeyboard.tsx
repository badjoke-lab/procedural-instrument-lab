import { useEffect, useRef, useState } from 'react'
import { recordScreenKeyboardNote } from './screen-keyboard-model'
import type { PianoRollDraft } from './piano-roll-model'

const KEYS = [
  { pitch: 60, label: 'C4' },
  { pitch: 62, label: 'D4' },
  { pitch: 64, label: 'E4' },
  { pitch: 65, label: 'F4' },
  { pitch: 67, label: 'G4' },
  { pitch: 69, label: 'A4' },
  { pitch: 71, label: 'B4' },
  { pitch: 72, label: 'C5' },
]

export type ScreenKeyboardCopy = {
  title: string
  intro: string
  record: string
  stopRecording: string
  recording: string
}

export function ScreenKeyboard({
  document,
  onChange,
  onPreview,
  copy,
}: {
  document: PianoRollDraft
  onChange: (next: PianoRollDraft) => void
  onPreview: (pitch: number) => void
  copy: ScreenKeyboardCopy
}) {
  const [recording, setRecording] = useState(false)
  const [activePitches, setActivePitches] = useState<number[]>([])
  const sessionStartedAt = useRef<number | null>(null)
  const activePresses = useRef(new Map<number, { pitch: number; startedAt: number }>())
  const latestDocument = useRef(document)

  useEffect(() => {
    latestDocument.current = document
  }, [document])

  const toggleRecording = () => {
    if (recording) {
      setRecording(false)
      sessionStartedAt.current = null
      activePresses.current.clear()
      setActivePitches([])
      return
    }
    sessionStartedAt.current = performance.now() / 1000
    activePresses.current.clear()
    latestDocument.current = document
    setRecording(true)
  }

  const pressKey = (pitch: number, pointerId: number, target: HTMLElement) => {
    const now = performance.now() / 1000
    target.setPointerCapture?.(pointerId)
    activePresses.current.set(pointerId, { pitch, startedAt: now })
    setActivePitches((current) => current.includes(pitch) ? current : [...current, pitch])
    onPreview(pitch)
  }

  const releaseKey = (pointerId: number, target: HTMLElement) => {
    const pressed = activePresses.current.get(pointerId)
    if (!pressed) return
    activePresses.current.delete(pointerId)
    target.releasePointerCapture?.(pointerId)
    setActivePitches((current) => current.filter((pitch) => pitch !== pressed.pitch))

    if (!recording || sessionStartedAt.current === null) return
    const endedAt = performance.now() / 1000
    const next = recordScreenKeyboardNote(latestDocument.current, {
      pitch: pressed.pitch,
      sessionStartedAtSeconds: sessionStartedAt.current,
      keyStartedAtSeconds: pressed.startedAt,
      keyEndedAtSeconds: endedAt,
    })
    latestDocument.current = next
    onChange(next)
  }

  return (
    <section className="screen-keyboard" aria-label={copy.title} style={{ marginBottom: 16, padding: 12, border: '1px solid #303036', borderRadius: 8, background: '#151519' }}>
      <div className="screen-keyboard-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: 13 }}>{copy.title}</strong>
          <span style={{ display: 'block', marginTop: 4, color: '#9999a2', fontSize: 11, lineHeight: 1.4 }}>{copy.intro}</span>
        </div>
        <button type="button" aria-pressed={recording} onClick={toggleRecording} style={{ flex: '0 0 auto' }}>
          {recording ? copy.stopRecording : copy.record}
        </button>
      </div>
      {recording && <div className="screen-keyboard-recording" role="status" style={{ marginBottom: 8, fontSize: 11, color: '#f0d58a' }}>● {copy.recording}</div>}
      <div className="screen-keyboard-keys" role="group" aria-label={copy.title} style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, touchAction: 'pan-x' }}>
        {KEYS.map(({ pitch, label }) => {
          const active = activePitches.includes(pitch)
          return (
            <button
              type="button"
              key={pitch}
              className="screen-key"
              aria-label={label}
              aria-pressed={active}
              onPointerDown={(event) => pressKey(pitch, event.pointerId, event.currentTarget)}
              onPointerUp={(event) => releaseKey(event.pointerId, event.currentTarget)}
              onPointerCancel={(event) => releaseKey(event.pointerId, event.currentTarget)}
              style={{ flex: '1 0 48px', minWidth: 48, minHeight: 72, padding: '8px 4px', background: active ? '#d6bb72' : '#ececf0', color: '#171719', borderColor: active ? '#f0d58a' : '#8f8f96', touchAction: 'none' }}
            >
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
