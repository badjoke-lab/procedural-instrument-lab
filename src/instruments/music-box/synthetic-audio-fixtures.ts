export type SyntheticAudioNote = {
  pitch: number
  startSeconds: number
  durationSeconds: number
  amplitude?: number
}

export type SyntheticAudioFixture = {
  id: string
  sampleRate: number
  tempoBpm: number
  noiseAmplitude: number
  notes: SyntheticAudioNote[]
}

export const SYNTHETIC_AUDIO_FIXTURES: SyntheticAudioFixture[] = [
  { id: 'single-a4-clean', sampleRate: 16000, tempoBpm: 120, noiseAmplitude: 0, notes: [{ pitch: 69, startSeconds: 0, durationSeconds: 0.8 }] },
  { id: 'single-c4-clean', sampleRate: 16000, tempoBpm: 90, noiseAmplitude: 0, notes: [{ pitch: 60, startSeconds: 0.2, durationSeconds: 0.9 }] },
  { id: 'two-note-step-clean', sampleRate: 16000, tempoBpm: 120, noiseAmplitude: 0, notes: [{ pitch: 60, startSeconds: 0, durationSeconds: 0.6 }, { pitch: 64, startSeconds: 0.8, durationSeconds: 0.6 }] },
  { id: 'three-note-tempo-60', sampleRate: 16000, tempoBpm: 60, noiseAmplitude: 0, notes: [{ pitch: 60, startSeconds: 0, durationSeconds: 0.5 }, { pitch: 62, startSeconds: 1, durationSeconds: 0.5 }, { pitch: 64, startSeconds: 2, durationSeconds: 0.5 }] },
  { id: 'three-note-tempo-180', sampleRate: 16000, tempoBpm: 180, noiseAmplitude: 0, notes: [{ pitch: 60, startSeconds: 0, durationSeconds: 0.3 }, { pitch: 62, startSeconds: 0.4, durationSeconds: 0.3 }, { pitch: 64, startSeconds: 0.8, durationSeconds: 0.3 }] },
  { id: 'a4-light-noise', sampleRate: 16000, tempoBpm: 120, noiseAmplitude: 0.01, notes: [{ pitch: 69, startSeconds: 0.1, durationSeconds: 0.9 }] },
  { id: 'c5-medium-noise', sampleRate: 16000, tempoBpm: 120, noiseAmplitude: 0.02, notes: [{ pitch: 72, startSeconds: 0.1, durationSeconds: 0.9 }] },
]

function midiToFrequency(pitch: number): number {
  return 440 * 2 ** ((pitch - 69) / 12)
}

function seededNoise(index: number): number {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

export function renderSyntheticAudio(fixture: SyntheticAudioFixture): Float32Array {
  const endSeconds = fixture.notes.reduce((end, note) => Math.max(end, note.startSeconds + note.durationSeconds), 0) + 0.15
  const samples = new Float32Array(Math.ceil(endSeconds * fixture.sampleRate))

  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = seededNoise(index) * fixture.noiseAmplitude
  }

  for (const note of fixture.notes) {
    const frequency = midiToFrequency(note.pitch)
    const amplitude = note.amplitude ?? 0.45
    const start = Math.floor(note.startSeconds * fixture.sampleRate)
    const end = Math.min(samples.length, Math.floor((note.startSeconds + note.durationSeconds) * fixture.sampleRate))
    for (let index = start; index < end; index += 1) {
      const localTime = (index - start) / fixture.sampleRate
      const attack = Math.min(1, localTime / 0.02)
      const remaining = (end - index) / fixture.sampleRate
      const release = Math.min(1, remaining / 0.02)
      samples[index] += Math.sin(2 * Math.PI * frequency * localTime) * amplitude * attack * release
    }
  }

  return samples
}
