export type Partial = {
  ratio: number
  gain: number
  decay: number
  detune?: number
}

export const MUSIC_BOX_PARTIALS: Partial[] = [
  { ratio: 1, gain: 0.12, decay: 1.9 },
  { ratio: 2.01, gain: 0.052, decay: 1.25, detune: 2 },
  { ratio: 3.93, gain: 0.024, decay: 0.82, detune: -3 },
  { ratio: 5.42, gain: 0.012, decay: 0.48, detune: 4 },
]

export function midiToHz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

export class MusicBoxAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private resonator: BiquadFilterNode | null = null

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.72
      this.resonator = this.ctx.createBiquadFilter()
      this.resonator.type = 'peaking'
      this.resonator.frequency.value = 1450
      this.resonator.Q.value = 0.8
      this.resonator.gain.value = 3.2
      this.resonator.connect(this.master).connect(this.ctx.destination)
    }
    return this.ctx
  }

  /**
   * Call from the Play/manual-crank user gesture so a later mechanical release
   * never has to wait for a suspended AudioContext before it can sound.
   */
  async unlock() {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()
    return ctx.state === 'running'
  }

  async pluck(note: number) {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()
    if (ctx.state !== 'running' || !this.resonator) return

    const now = ctx.currentTime
    const frequency = midiToHz(note)

    for (const partial of MUSIC_BOX_PARTIALS) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency * partial.ratio
      oscillator.detune.value = partial.detune ?? 0

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(partial.gain, now + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay)

      oscillator.connect(gain).connect(this.resonator)
      oscillator.start(now)
      oscillator.stop(now + partial.decay + 0.04)
    }

    this.contactClick(now)
  }

  private contactClick(now: number) {
    const ctx = this.ctx
    if (!ctx || !this.resonator) return

    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const highpass = ctx.createBiquadFilter()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(2600, now)
    oscillator.frequency.exponentialRampToValueAtTime(1050, now + 0.028)
    highpass.type = 'highpass'
    highpass.frequency.value = 850

    gain.gain.setValueAtTime(0.022, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032)

    oscillator.connect(highpass).connect(gain).connect(this.resonator)
    oscillator.start(now)
    oscillator.stop(now + 0.04)
  }
}
