import { assertTuneDocument, TUNE_DOCUMENT_VERSION, type TuneDocument, type TuneDocumentNote } from './tune-document'

export type MidiImportResult = {
  document: TuneDocument
  warnings: string[]
}

type ParsedNote = { pitch: number; startTick: number; endTick: number; channel: number }
type TempoEvent = { tick: number; microsecondsPerQuarter: number }

export function importMidi(bytes: Uint8Array, title = 'Imported MIDI'): MidiImportResult {
  const reader = new MidiReader(bytes)
  reader.expectAscii('MThd')
  const headerLength = reader.readUint32()
  if (headerLength < 6) throw new Error('Invalid MIDI header length')
  const format = reader.readUint16()
  const trackCount = reader.readUint16()
  const division = reader.readUint16()
  if (format !== 0 && format !== 1) throw new Error(`Unsupported MIDI format: ${format}`)
  if (trackCount < 1) throw new Error('MIDI contains no tracks')
  if ((division & 0x8000) !== 0) throw new Error('SMPTE MIDI time division is not supported')
  if (division === 0) throw new Error('MIDI PPQ division must be positive')
  if (headerLength > 6) reader.skip(headerLength - 6)

  const notes: ParsedNote[] = []
  const tempos: TempoEvent[] = []
  for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
    reader.expectAscii('MTrk')
    const trackLength = reader.readUint32()
    const end = reader.offset + trackLength
    if (end > bytes.length) throw new Error('Truncated MIDI track')
    parseTrack(reader, end, notes, tempos)
    reader.offset = end
  }

  if (notes.length === 0) throw new Error('MIDI contains no completed note events')
  notes.sort((a, b) => a.startTick - b.startTick || a.pitch - b.pitch || a.channel - b.channel)

  const defaultTempo = 500_000
  const sortedTempos = tempos.sort((a, b) => a.tick - b.tick)
  const firstTempo = sortedTempos[0]?.microsecondsPerQuarter ?? defaultTempo
  const distinctTempos = new Set(sortedTempos.map((event) => event.microsecondsPerQuarter))
  const warnings: string[] = []
  if (distinctTempos.size > 1) warnings.push('Tempo changes were flattened to the first tempo; note positions remain beat-accurate.')

  const importedNotes: TuneDocumentNote[] = notes.map((note, index) => ({
    id: `midi-note-${index + 1}`,
    pitch: note.pitch,
    startBeat: note.startTick / division,
    durationBeats: Math.max(1 / division, (note.endTick - note.startTick) / division),
  }))
  const lastEnd = Math.max(...importedNotes.map((note) => note.startBeat + note.durationBeats))
  const document: TuneDocument = {
    version: TUNE_DOCUMENT_VERSION,
    id: `midi-${Date.now().toString(36)}`,
    title: title.trim() || 'Imported MIDI',
    tempoBpm: 60_000_000 / firstTempo,
    lengthBeats: Math.max(1, lastEnd),
    notes: importedNotes,
  }
  assertTuneDocument(document)
  return { document, warnings }
}

function parseTrack(reader: MidiReader, end: number, notes: ParsedNote[], tempos: TempoEvent[]) {
  let tick = 0
  let runningStatus: number | null = null
  const active = new Map<string, { startTick: number; pitch: number; channel: number }>()

  while (reader.offset < end) {
    tick += reader.readVarLen(end)
    let status = reader.peekUint8(end)
    if (status >= 0x80) {
      status = reader.readUint8(end)
      if (status < 0xf0) runningStatus = status
      else runningStatus = null
    } else if (runningStatus !== null) {
      status = runningStatus
    } else {
      throw new Error('Invalid MIDI running status')
    }

    if (status === 0xff) {
      const type = reader.readUint8(end)
      const length = reader.readVarLen(end)
      const metaEnd = reader.offset + length
      if (metaEnd > end) throw new Error('Truncated MIDI meta event')
      if (type === 0x51 && length === 3) {
        const value = (reader.readUint8(end) << 16) | (reader.readUint8(end) << 8) | reader.readUint8(end)
        if (value > 0) tempos.push({ tick, microsecondsPerQuarter: value })
      }
      reader.offset = metaEnd
      if (type === 0x2f) break
      continue
    }

    if (status === 0xf0 || status === 0xf7) {
      const length = reader.readVarLen(end)
      reader.skipWithin(length, end)
      continue
    }

    const kind = status & 0xf0
    const channel = status & 0x0f
    const data1 = reader.readUint8(end)
    const data2 = kind === 0xc0 || kind === 0xd0 ? null : reader.readUint8(end)

    if (kind === 0x90 && data2 !== null && data2 > 0) {
      const key = `${channel}:${data1}`
      const previous = active.get(key)
      if (previous) notes.push({ ...previous, endTick: tick })
      active.set(key, { startTick: tick, pitch: data1, channel })
    } else if (kind === 0x80 || (kind === 0x90 && data2 === 0)) {
      const key = `${channel}:${data1}`
      const started = active.get(key)
      if (started) {
        notes.push({ ...started, endTick: Math.max(tick, started.startTick + 1) })
        active.delete(key)
      }
    }
  }
}

class MidiReader {
  offset = 0
  constructor(private readonly bytes: Uint8Array) {}

  expectAscii(expected: string) {
    let actual = ''
    for (let index = 0; index < expected.length; index += 1) actual += String.fromCharCode(this.readUint8())
    if (actual !== expected) throw new Error(`Expected ${expected}, found ${actual}`)
  }

  readUint8(limit = this.bytes.length): number {
    if (this.offset >= limit || this.offset >= this.bytes.length) throw new Error('Unexpected end of MIDI data')
    return this.bytes[this.offset++]
  }
  peekUint8(limit = this.bytes.length): number {
    if (this.offset >= limit || this.offset >= this.bytes.length) throw new Error('Unexpected end of MIDI data')
    return this.bytes[this.offset]
  }
  readUint16(): number { return (this.readUint8() << 8) | this.readUint8() }
  readUint32(): number { return ((this.readUint8() * 0x1000000) + (this.readUint8() << 16) + (this.readUint8() << 8) + this.readUint8()) >>> 0 }
  readVarLen(limit: number): number {
    let value = 0
    for (let index = 0; index < 4; index += 1) {
      const byte = this.readUint8(limit)
      value = (value << 7) | (byte & 0x7f)
      if ((byte & 0x80) === 0) return value
    }
    throw new Error('Invalid MIDI variable-length value')
  }
  skip(count: number) {
    if (count < 0 || this.offset + count > this.bytes.length) throw new Error('Unexpected end of MIDI data')
    this.offset += count
  }
  skipWithin(count: number, limit: number) {
    if (count < 0 || this.offset + count > limit) throw new Error('Truncated MIDI event')
    this.offset += count
  }
}
