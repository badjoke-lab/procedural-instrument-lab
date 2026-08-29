import { expect, test } from '@playwright/test'

test('autoplay does not move the mechanism until Web Audio startup settles', async ({ page }) => {
  await page.addInitScript(() => {
    let resolveResume: (() => void) | null = null

    class FakeAudioParam {
      value = 0
      setValueAtTime(value: number) { this.value = value; return this }
      exponentialRampToValueAtTime(value: number) { this.value = value; return this }
    }

    class FakeNode {
      connect<T>(target: T) { return target }
    }

    class FakeGainNode extends FakeNode {
      gain = new FakeAudioParam()
    }

    class FakeBiquadFilterNode extends FakeNode {
      type = 'peaking'
      frequency = new FakeAudioParam()
      Q = new FakeAudioParam()
      gain = new FakeAudioParam()
    }

    class FakeOscillatorNode extends FakeNode {
      type = 'sine'
      frequency = new FakeAudioParam()
      detune = new FakeAudioParam()
      start() {}
      stop() {}
    }

    class FakeAudioContext {
      state: AudioContextState = 'suspended'
      currentTime = 0
      destination = new FakeNode()

      createGain() { return new FakeGainNode() }
      createBiquadFilter() { return new FakeBiquadFilterNode() }
      createOscillator() { return new FakeOscillatorNode() }
      resume() {
        return new Promise<void>((resolve) => {
          resolveResume = () => {
            this.state = 'running'
            resolve()
          }
        })
      }
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: FakeAudioContext,
    })

    ;(window as Window & { __resolveMusicBoxAudioResume?: () => void }).__resolveMusicBoxAudioResume = () => {
      resolveResume?.()
    }
  })

  await page.goto('/')
  const transport = page.locator('header .controls > button').first()
  await expect(transport).toHaveText('Play')
  await expect(transport).toHaveAttribute('aria-pressed', 'false')

  await transport.click()
  await page.waitForTimeout(150)

  // A suspended AudioContext must not allow the cylinder to start and create a later audio offset.
  await expect(transport).toHaveText('Play')
  await expect(transport).toHaveAttribute('aria-pressed', 'false')

  await page.evaluate(() => {
    ;(window as Window & { __resolveMusicBoxAudioResume?: () => void }).__resolveMusicBoxAudioResume?.()
  })

  await expect(transport).toHaveText('Stop')
  await expect(transport).toHaveAttribute('aria-pressed', 'true')

  await transport.click()
  await expect(transport).toHaveText('Play')
})
