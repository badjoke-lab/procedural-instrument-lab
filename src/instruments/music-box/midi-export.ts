import { assertTuneDocument, type TuneDocument } from './tune-document'

export const MIDI_EXPORT_PPQ = 480

type MidiEvent = {
  tick: number
  order: number
  bytes: number[]
}

export function exportMidi(document: TuneDocument, ppq = MIDI_EXPORT_PPQ): Uint8Array {
  assertTuneDocument(document)
  if (!Number.isInteger(ppq) || ppq <= 0 || ppq > 0x7fff) throw new Error('MIDI PPQ must be an integer from 1 to 32767')

  const events: MidiEvent[] = []
  const microsecondsPerQuarter = Math.max(1, Math.min(0xffffff, Math.round(60_000_000 / document.tempoBpm)))
  events.push({
    tick: 0,
    order: 0,
    bytes: [0xff, 0x51, 0x03, (microsecondsPerQuarter >> 16) & 0xff, (microsecondsPerQuarter >> 8) & 0xff, microsecondsPerQuarter & 0xff],
  })

  for (const note of document.notes) {
    const startTick = Math.max(0, Math.round(note.startBeat * ppq))
    const nominalEnd = Math.round((note.startBeat + note.durationBeats) * ppq)
    const endTick = Math.max(startTick + 1, nominalEnd)
    events.push({ tick: startTick, order: 2, bytes: [0x90, note.pitch, 96] })
    events.push({ tick: endTick, order: 1, bytes: [0x80, note.pitch, 0] })
  }

  events.sort((a, b) => a.tick - b.tick || a.order - b.order || a.bytes[1] - b.bytes[1])

  const track: number[] = []
  let previousTick = 0
  for (const event of events) {
    track.push(...encodeVariableLength(event.tick - previousTick), ...event.bytes)
    previousTick = event.tick
  }
  track.push(0x00, 0xff, 0x2f, 0x00)

  const header = [
    ...ascii('MThd'),
    ...uint32(6),
    ...uint16(0),
    ...uint16(1),
    ...uint16(ppq),
  ]
  const trackChunk = [...ascii('MTrk'), ...uint32(track.length), ...track]
  return new Uint8Array([...header, ...trackChunk])
}

export function midiExportFilename(title: string): string {
  const base = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 80)
  return `${base || 'music-box-tune'}.mid`
}

function encodeVariableLength(value: number): number[] {
  if (!Number.isInteger(value) || value < 0 || value > 0x0fffffff) throw new Error('MIDI delta time is out of range')
  let buffer = value & 0x7f
  const bytes: number[] = []
  while ((value >>= 7) > 0) {
    buffer <<= 8
    buffer |= (value & 0x7f) | 0x80
  }
  while (true) {
    bytes.push(buffer & 0xff)
    if (buffer & 0x80) buffer >>= 8
    else break
  }
  return bytes
}

function ascii(value: string): number[] {
  return [...value].map((character) => character.charCodeAt(0))
}

function uint16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff]
}

function uint32(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]
}
