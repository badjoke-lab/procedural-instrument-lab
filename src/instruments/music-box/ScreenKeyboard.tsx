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
    <section className="screen-keyboard" role="region" aria-label={copy.title}>
      <div className="screen-keyboard-heading">
        <div><strong>{copy.title}</strong><span>{copy.intro}</span></div>
        <button type="button" aria-pressed={recording} onClick={toggleRecording}>
          {recording ? copy.stopRecording : copy.record}
        </button>
      </div>
      {recording && <div className="screen-keyboard-recording" role="status">● {copy.recording}</div>}
      <div className="screen-keyboard-keys" role="group" aria-label={copy.title}>
        {KEYS.map(({ pitch, label }) => (
          <button
            type="button"
            key={pitch}
            className="screen-key"
            aria-label={label}
            aria-pressed={activePitches.includes(pitch)}
            onPointerDown={(event) => pressKey(pitch, event.pointerId, event.currentTarget)}
            onPointerUp={(event) => releaseKey(event.pointerId, event.currentTarget)}
            onPointerCancel={(event) => releaseKey(event.pointerId, event.currentTarget)}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
