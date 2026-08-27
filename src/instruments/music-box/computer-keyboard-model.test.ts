import { describe, expect, it } from 'vitest'
import { COMPUTER_KEYBOARD_KEYS, computerKeyboardPitch } from './computer-keyboard-model'

describe('computer keyboard mapping', () => {
  it('maps A through K to the current C4-C5 diatonic range', () => {
    expect(COMPUTER_KEYBOARD_KEYS.map(({ code, pitch }) => [code, pitch])).toEqual([
      ['KeyA', 60],
      ['KeyS', 62],
      ['KeyD', 64],
      ['KeyF', 65],
      ['KeyG', 67],
      ['KeyH', 69],
      ['KeyJ', 71],
      ['KeyK', 72],
    ])
  })

  it('returns null for keys that are not music-box performance keys', () => {
    expect(computerKeyboardPitch('KeyA')).toBe(60)
    expect(computerKeyboardPitch('KeyK')).toBe(72)
    expect(computerKeyboardPitch('KeyQ')).toBeNull()
    expect(computerKeyboardPitch('Space')).toBeNull()
  })
})
