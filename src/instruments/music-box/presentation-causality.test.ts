import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  gearRatio,
  pinContactWindow,
  type MusicBoxConfig,
} from './mechanism'

const MAX_EXPOSED_DRIVE_SPEED = 2
const MIN_PRESENTATION_FPS = 30

function worstExposedGearRatioConfig(): MusicBoxConfig {
  return {
    ...DEFAULT_MUSIC_BOX_CONFIG,
    notes: [...DEFAULT_MUSIC_BOX_CONFIG.notes],
    driverGearTeeth: 50,
    cylinderGearTeeth: 20,
  }
}

describe('music box presentation causality', () => {
  it('keeps one physical pin/tine contact window wider than a worst-case 30fps render step', () => {
    const config = worstExposedGearRatioConfig()
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const maximumCylinderPhasePerFrame = gearRatio(config) * MAX_EXPOSED_DRIVE_SPEED / MIN_PRESENTATION_FPS

    for (const direction of [-1, 1] as const) {
      const window = pinContactWindow(pin, direction, config)
      expect(window).not.toBeNull()
      expect(window?.travelAngle).toBeGreaterThan(maximumCylinderPhasePerFrame)
    }
  })
})
