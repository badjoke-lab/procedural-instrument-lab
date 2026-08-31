import {
  pinTineEngagement,
  sampleCylinderPhaseSegment,
  type MusicBoxConfig,
  type Pin,
} from './mechanism'

export type PresentedCylinderPhase = {
  phase: number
  heldForVisibleContact: boolean
}

/**
 * Keep the mechanism itself on one mechanically valid engagement state when a requested render step
 * would otherwise enter and leave a pin/tine contact entirely between two presented frames.
 *
 * This does not invent a tine-only animation. The returned phase is sampled from the same contact
 * solver used by release/audio. The next frame continues from that presented mechanical phase toward
 * the still-requested target, so release cannot precede an actually presented engaged state.
 */
export function choosePresentedCylinderPhase(
  fromPhase: number,
  requestedPhase: number,
  pins: Pin[],
  config: MusicBoxConfig,
  previousMotionDirection = -1,
): PresentedCylinderPhase {
  const delta = requestedPhase - fromPhase
  if (Math.abs(delta) <= 1e-9 || pins.length === 0) {
    return { phase: requestedPhase, heldForVisibleContact: false }
  }

  const direction = Math.sign(delta) || Math.sign(previousMotionDirection) || -1
  const wasEngaged = pins.map((pin) => pinTineEngagement(pin, fromPhase, config, direction).engaged)
  let candidateIndex: number | null = null
  let bestPhase = requestedPhase
  let bestDeflection = -1

  for (const sampledPhase of sampleCylinderPhaseSegment(fromPhase, requestedPhase)) {
    const states = pins.map((pin) => pinTineEngagement(pin, sampledPhase, config, direction))

    if (candidateIndex === null) {
      const newlyEngagedIndex = states.findIndex((state, index) => !wasEngaged[index] && state.engaged)
      if (newlyEngagedIndex >= 0) {
        candidateIndex = newlyEngagedIndex
        bestPhase = sampledPhase
        bestDeflection = states[newlyEngagedIndex].deflection
      }
    } else {
      const candidate = states[candidateIndex]
      if (candidate.engaged) {
        if (candidate.deflection > bestDeflection) {
          bestDeflection = candidate.deflection
          bestPhase = sampledPhase
        }
      } else {
        return { phase: bestPhase, heldForVisibleContact: true }
      }
    }

    states.forEach((state, index) => {
      wasEngaged[index] = state.engaged
    })
  }

  return { phase: requestedPhase, heldForVisibleContact: false }
}
