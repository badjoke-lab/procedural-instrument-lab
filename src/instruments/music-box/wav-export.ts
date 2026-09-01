import type { MusicBoxConfig } from './mechanism'
import { renderMusicBoxOfflineAudio } from './offline-audio'
import type { TuneDocument } from './tune-document'

export type MusicBoxWavExport = {
  filename: string
  bytes: Uint8Array
  sampleRate: number
  durationSeconds: number
}

function safeStem(title: string) {
  const normalized = title
    .normalize('NFKC')
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
  return normalized || 'music-box-audio'
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index))
}

export function encodeMonoPcm16Wav(samples: Float32Array, sampleRate: number): Uint8Array {
  if (!Number.isInteger(sampleRate) || sampleRate <= 0) throw new Error('sampleRate must be a positive integer')

  const channels = 1
  const bitsPerSample = 16
  const bytesPerSample = bitsPerSample / 8
  const dataSize = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * bytesPerSample, true)
  view.setUint16(32, channels * bytesPerSample, true)
  view.setUint16(34, bitsPerSample, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]))
    const value = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff)
    view.setInt16(44 + index * 2, value, true)
  }

  return new Uint8Array(buffer)
}

export function createMusicBoxWavExport(
  document: TuneDocument,
  config: MusicBoxConfig,
  sampleRate = 44_100,
): MusicBoxWavExport {
  const rendered = renderMusicBoxOfflineAudio(document, config, sampleRate)
  return {
    filename: `${safeStem(document.title)}.wav`,
    bytes: encodeMonoPcm16Wav(rendered.samples, rendered.sampleRate),
    sampleRate: rendered.sampleRate,
    durationSeconds: rendered.durationSeconds,
  }
}

export function downloadMusicBoxWav(document: TuneDocument, config: MusicBoxConfig, sampleRate = 44_100): void {
  const exported = createMusicBoxWavExport(document, config, sampleRate)
  const blob = new Blob([exported.bytes], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  const anchor = documentElement('a')
  anchor.href = url
  anchor.download = exported.filename
  anchor.hidden = true
  globalThis.document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function documentElement(tag: 'a') {
  if (typeof globalThis.document === 'undefined') throw new Error('WAV download requires a browser document')
  return globalThis.document.createElement(tag)
}
