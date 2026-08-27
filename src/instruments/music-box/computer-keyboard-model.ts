export const COMPUTER_KEYBOARD_KEYS = [
  { code: 'KeyA', keyLabel: 'A', pitch: 60, pitchLabel: 'C4' },
  { code: 'KeyS', keyLabel: 'S', pitch: 62, pitchLabel: 'D4' },
  { code: 'KeyD', keyLabel: 'D', pitch: 64, pitchLabel: 'E4' },
  { code: 'KeyF', keyLabel: 'F', pitch: 65, pitchLabel: 'F4' },
  { code: 'KeyG', keyLabel: 'G', pitch: 67, pitchLabel: 'G4' },
  { code: 'KeyH', keyLabel: 'H', pitch: 69, pitchLabel: 'A4' },
  { code: 'KeyJ', keyLabel: 'J', pitch: 71, pitchLabel: 'B4' },
  { code: 'KeyK', keyLabel: 'K', pitch: 72, pitchLabel: 'C5' },
] as const

const PITCH_BY_CODE = new Map(COMPUTER_KEYBOARD_KEYS.map((key) => [key.code, key.pitch]))

export function computerKeyboardPitch(code: string): number | null {
  return PITCH_BY_CODE.get(code) ?? null
}

export function shouldIgnoreComputerKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
}
