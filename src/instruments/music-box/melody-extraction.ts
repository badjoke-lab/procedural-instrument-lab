import { TUNE_DOCUMENT_VERSION, assertTuneDocument, type TuneDocument } from './tune-document'

export type ExtractedNote = {
  pitch: number
  startSeconds: number
  durationSeconds: number
}

export type MelodyExtractionOptions = {
  frameSize?: number
  hopSize?: number
  rmsThreshold?: number
  minFrequency?: number
  maxFrequency?: number
  minNoteSeconds?: number
}

const DEFAULT_OPTIONS: Required<MelodyExtractionOptions> = {
  frameSize: 2048,
  hopSize: 512,
  rmsThreshold: 0.015,
  minFrequency: 80,
  maxFrequency: 1200,
  minNoteSeconds: 0.08,
}

export function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440))
}

export function estimateFundamentalFrequency(
  frame: Float32Array,
  sampleRate: number,
  options: Pick<Required<MelodyExtractionOptions>, 'rmsThreshold' | 'minFrequency' | 'maxFrequency'> = DEFAULT_OPTIONS,
): number | null {
  let energy = 0
  for (let i = 0; i < frame.length; i += 1) energy += frame[i] * frame[i]
  const rms = Math.sqrt(energy / frame.length)
  if (rms < options.rmsThreshold) return null

  const minLag = Math.max(1, Math.floor(sampleRate / options.maxFrequency))
  const maxLag = Math.min(frame.length - 2, Math.ceil(sampleRate / options.minFrequency))
  const correlations: number[] = []
  let bestCorrelation = 0

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0
    let normA = 0
    let normB = 0
    const limit = frame.length - lag
    for (let i = 0; i < limit; i += 1) {
      const a = frame[i]
      const b = frame[i + lag]
      correlation += a * b
      normA += a * a
      normB += b * b
    }
    const normalized = normA > 0 && normB > 0 ? correlation / Math.sqrt(normA * normB) : 0
    correlations.push(normalized)
    if (normalized > bestCorrelation) bestCorrelation = normalized
  }

  if (bestCorrelation < 0.65) return null

  // Pure and near-periodic sources can produce equally strong peaks at integer
  // multiples of the real period. Choosing the global maximum can therefore
  // report a subharmonic several octaves too low. Prefer the first local peak
  // that is essentially as strong as the best observed correlation.
  const strongPeakThreshold = Math.max(0.65, bestCorrelation * 0.98)
  for (let index = 1; index < correlations.length - 1; index += 1) {
    const current = correlations[index]
    if (
      current >= strongPeakThreshold
      && current >= correlations[index - 1]
      && current >= correlations[index + 1]
    ) {
      return sampleRate / (minLag + index)
    }
  }

  const bestIndex = correlations.reduce(
    (best, value, index) => value > correlations[best] ? index : best,
    0,
  )
  return sampleRate / (minLag + bestIndex)
}

export function extractMonophonicNotes(
  samples: Float32Array,
  sampleRate: number,
  options: MelodyExtractionOptions = {},
): ExtractedNote[] {
  const settings = { ...DEFAULT_OPTIONS, ...options }
  const frames: Array<{ pitch: number; time: number }> = []

  for (let offset = 0; offset + settings.frameSize <= samples.length; offset += settings.hopSize) {
    const frame = samples.subarray(offset, offset + settings.frameSize)
    const frequency = estimateFundamentalFrequency(frame, sampleRate, settings)
    if (frequency === null) continue
    const pitch = frequencyToMidi(frequency)
    if (pitch < 0 || pitch > 127) continue
    frames.push({ pitch, time: offset / sampleRate })
  }

  if (frames.length === 0) return []

  const hopSeconds = settings.hopSize / sampleRate
  const notes: ExtractedNote[] = []
  let start = frames[0].time
  let end = frames[0].time + hopSeconds
  let pitch = frames[0].pitch

  const flush = () => {
    const durationSeconds = end - start
    if (durationSeconds >= settings.minNoteSeconds) notes.push({ pitch, startSeconds: start, durationSeconds })
  }

  for (let i = 1; i < frames.length; i += 1) {
    const current = frames[i]
    const contiguous = current.time - end <= hopSeconds * 1.5
    if (contiguous && current.pitch === pitch) {
      end = current.time + hopSeconds
      continue
    }
    flush()
    start = current.time
    end = current.time + hopSeconds
    pitch = current.pitch
  }
  flush()

  return notes
}

export function extractedNotesToTuneDocument(
  notes: ExtractedNote[],
  tempoBpm: number,
  id = 'microphone-melody',
  title = 'Microphone melody',
): TuneDocument {
  const secondsPerBeat = 60 / tempoBpm
  const quantize = (beats: number) => Math.max(0, Math.round(beats * 4) / 4)
  const converted = notes.map((note, index) => {
    const startBeat = quantize(note.startSeconds / secondsPerBeat)
    const durationBeats = Math.max(0.25, quantize(note.durationSeconds / secondsPerBeat))
    return {
      id: `${id}-note-${index + 1}`,
      pitch: note.pitch,
      startBeat,
      durationBeats,
    }
  })
  const maxEnd = converted.reduce((value, note) => Math.max(value, note.startBeat + note.durationBeats), 1)
  const document: TuneDocument = {
    version: TUNE_DOCUMENT_VERSION,
    id,
    title,
    tempoBpm,
    lengthBeats: Math.max(1, Math.ceil(maxEnd)),
    notes: converted.map((note) => ({
      ...note,
      durationBeats: Math.min(note.durationBeats, Math.max(0.25, Math.ceil(maxEnd) - note.startBeat)),
    })),
  }
  assertTuneDocument(document)
  return document
}

export async function extractMelodyFromBlob(blob: Blob, tempoBpm: number): Promise<TuneDocument> {
  const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextConstructor) throw new Error('audio decoding is not supported')
  const context = new AudioContextConstructor()
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer())
    const mono = new Float32Array(buffer.length)
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < data.length; i += 1) mono[i] += data[i] / buffer.numberOfChannels
    }
    const notes = extractMonophonicNotes(mono, buffer.sampleRate)
    if (notes.length === 0) throw new Error('no stable monophonic notes detected')
    return extractedNotesToTuneDocument(notes, tempoBpm)
  } finally {
    await context.close()
  }
}
