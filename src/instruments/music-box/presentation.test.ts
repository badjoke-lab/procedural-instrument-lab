import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  pinTineEngagement,
  pinTineSurfaceGap,
} from './mechanism'
import { choosePresentedCylinderPhase } from './presentation'

const config = DEFAULT_MUSIC_BOX_CONFIG

function findSkippedContactStep() {
  const [pin] = compileTune([{ note: 60, start: 0 }], config)
  for (let from = 0; from > -Math.PI * 2; from -= 0.01) {
    const to = from - 0.09
    const start = pinTineEngagement(pin, from, config, -1)
    const end = pinTineEngagement(pin, to, config, -1)
    const presented = choosePresentedCylinderPhase(from, to, [pin], config, -1)
    if (!start.engaged && !end.engaged && presented.heldForVisibleContact) {
      return { pin, from, to, presented }
    }
  }
  throw new Error('Expected to find a coarse phase step that crosses a complete contact window')
}

describe('music box presented mechanical phase', () => {
  it('holds a real engaged phase when a coarse frame would skip the whole contact', () => {
    const { pin, to, presented } = findSkippedContactStep()
    expect(presented.phase).not.toBe(to)

    const visible = pinTineEngagement(pin, presented.phase, config, -1)
    expect(visible.engaged).toBe(true)
    expect(visible.deflection).toBeGreaterThan(0)
    expect(Math.abs(pinTineSurfaceGap(pin, presented.phase, visible.loadAngle, config))).toBeLessThan(1e-5)
  })

  it('reaches the requested post-release phase only after the contact was presented', () => {
    const { pin, to, presented } = findSkippedContactStep()
    const next = choosePresentedCylinderPhase(presented.phase, to, [pin], config, -1)
    expect(next.heldForVisibleContact).toBe(false)
    expect(next.phase).toBe(to)
    expect(pinTineEngagement(pin, next.phase, config, -1).engaged).toBe(false)
  })

  it('applies the same contact-preservation rule in reverse motion', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    let found = false
    for (let from = 0; from < Math.PI * 2 && !found; from += 0.01) {
      const to = from + 0.09
      const start = pinTineEngagement(pin, from, config, 1)
      const end = pinTineEngagement(pin, to, config, 1)
      const presented = choosePresentedCylinderPhase(from, to, [pin], config, 1)
      if (!start.engaged && !end.engaged && presented.heldForVisibleContact) {
        const visible = pinTineEngagement(pin, presented.phase, config, 1)
        expect(visible.engaged).toBe(true)
        expect(visible.deflection).toBeGreaterThan(0)
        found = true
      }
    }
    expect(found).toBe(true)
  })
})
