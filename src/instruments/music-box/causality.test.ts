import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../../main.tsx', import.meta.url), 'utf8')

function count(haystack: string, needle: string) {
  return haystack.split(needle).length - 1
}

describe('music box runtime causality architecture', () => {
  it('keeps autoplay and manual crank on the same drive-angle state', () => {
    expect(source).toContain('if (running) driveAngle.current += dt * speed')
    expect(source).toContain('driveAngle.current += deltaX * 0.018')
    expect(source).toContain('const drive = driveKinematics(driveAngle.current, config)')
  })

  it('has one contact-to-pluck path instead of input-specific audio scheduling', () => {
    expect(count(source, 'pinTouchesTine(')).toBe(1)
    expect(count(source, 'audio.pluck(')).toBe(1)
    expect(source).toContain('if (inContact && !touching.current.has(index))')
    expect(source).toContain('void audio.pluck(config.notes[pin.noteIndex])')
  })

  it('disables orbit while the crank owns the pointer and restores it on release', () => {
    expect(source).toContain('target.setPointerCapture?.(event.pointerId)')
    expect(source).toContain('target.releasePointerCapture?.(event.pointerId)')
    expect(source).toContain('onManualStart={() => { setRunning(false); setOrbitEnabled(false);')
    expect(source).toContain('onManualEnd={() => { setOrbitEnabled(true);')
    expect(source).toContain('<OrbitControls makeDefault enabled={orbitEnabled}')
  })
})
