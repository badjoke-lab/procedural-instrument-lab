import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  pinRenderGeometry,
  pinTipWorldPosition,
} from './mechanism'

describe('music box pin render geometry', () => {
  it('uses the same tip center for rendering and contact at zero cylinder phase', () => {
    const config = DEFAULT_MUSIC_BOX_CONFIG
    const [pin] = compileTune([{ note: config.notes[0], start: 0.125 }], config)
    const rendered = pinRenderGeometry(pin, config)
    const contactTip = pinTipWorldPosition(pin, 0, config)

    expect(config.cylinderCenter[0] + rendered.tipCenter.x).toBeCloseTo(contactTip.x, 10)
    expect(config.cylinderCenter[1] + rendered.tipCenter.y).toBeCloseTo(contactTip.y, 10)
    expect(config.cylinderCenter[2] + rendered.tipCenter.z).toBeCloseTo(contactTip.z, 10)
  })

  it('derives the stem, spherical tip and rotation from one pin angle', () => {
    const config = DEFAULT_MUSIC_BOX_CONFIG
    const [pin] = compileTune([{ note: config.notes[2], start: 0.37 }], config)
    const rendered = pinRenderGeometry(pin, config)

    const stemRadius = Math.hypot(rendered.stemCenter.x, rendered.stemCenter.y)
    const tipRadius = Math.hypot(rendered.tipCenter.x, rendered.tipCenter.y)

    expect(stemRadius).toBeCloseTo(config.cylinderRadius + config.pinLength / 2, 10)
    expect(tipRadius).toBeCloseTo(config.cylinderRadius + config.pinLength, 10)
    expect(rendered.stemCenter.z).toBe(pin.axialPosition)
    expect(rendered.tipCenter.z).toBe(pin.axialPosition)
    expect(rendered.rotationZ).toBeCloseTo(pin.angle - Math.PI / 2, 10)
  })
})
