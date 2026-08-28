import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const state = { requests: 0, stopped: false }
    Object.defineProperty(window, '__micTestState', { value: state, configurable: true })
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          state.requests += 1
          return { getTracks: () => [{ stop: () => { state.stopped = true } }] }
        },
      },
    })

    class FakeMediaRecorder {
      static isTypeSupported() { return true }
      state: 'inactive' | 'recording' = 'inactive'
      mimeType = 'audio/webm'
      ondataavailable: ((event: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      constructor(_stream: unknown, _options?: unknown) {}
      start() { this.state = 'recording' }
      stop() {
        this.state = 'inactive'
        this.ondataavailable?.({ data: new Blob(['recorded'], { type: this.mimeType }) })
        this.onstop?.()
      }
    }
    Object.defineProperty(window, 'MediaRecorder', { value: FakeMediaRecorder, configurable: true })

    class FakeAudioContext {
      async decodeAudioData(_data: ArrayBuffer) {
        const sampleRate = 48_000
        const length = Math.round(sampleRate * 0.5)
        const channel = new Float32Array(length)
        for (let i = 0; i < length; i += 1) channel[i] = Math.sin(2 * Math.PI * 440 * (i / sampleRate)) * 0.7
        return {
          sampleRate,
          length,
          numberOfChannels: 1,
          getChannelData: () => channel,
        }
      }
      async close() {}
    }
    Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true })
  })
})

test('microphone permission is explicit and the local clip can be previewed, analyzed, re-recorded and discarded', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()

  const recorder = page.getByRole('region', { name: 'Record microphone' })
  await expect(recorder).toBeVisible()
  expect(await page.evaluate(() => (window as any).__micTestState.requests)).toBe(0)

  await recorder.getByRole('button', { name: 'Start recording' }).click()
  await expect(recorder.getByRole('status')).toHaveText('Recording…')
  expect(await page.evaluate(() => (window as any).__micTestState.requests)).toBe(1)

  await recorder.getByRole('button', { name: 'Stop recording' }).click()
  await expect(recorder.getByRole('status')).toContainText('Recording ready')
  await expect(recorder.locator('audio')).toBeVisible()
  expect(await page.evaluate(() => (window as any).__micTestState.stopped)).toBe(true)

  await page.getByRole('button', { name: 'Extract melody' }).click()
  await expect(page.getByText('Melody candidates were converted to editable tune data.')).toBeVisible()
  await expect(page.locator('.piano-roll-note[title^="A4"]')).toHaveCount(1)

  await recorder.getByRole('button', { name: 'Start recording' }).click()
  await expect(recorder.getByRole('status')).toHaveText('Recording…')
  await expect(recorder.locator('audio')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Extract melody' })).toHaveCount(0)
  expect(await page.evaluate(() => (window as any).__micTestState.requests)).toBe(2)
  await recorder.getByRole('button', { name: 'Stop recording' }).click()
  await expect(recorder.locator('audio')).toBeVisible()

  await page.screenshot({ path: testInfo.outputPath('runtime-microphone-melody.png'), fullPage: true })

  await recorder.getByRole('button', { name: 'Discard recording' }).click()
  await expect(recorder.locator('audio')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Extract melody' })).toHaveCount(0)
})

test('failed microphone analysis leaves the editable tune unchanged', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const before = await page.locator('.piano-roll-note').count()
  const recorder = page.getByRole('region', { name: 'Record microphone' })
  await recorder.getByRole('button', { name: 'Start recording' }).click()
  await recorder.getByRole('button', { name: 'Stop recording' }).click()

  await page.evaluate(() => {
    class SilentAudioContext {
      async decodeAudioData(_data: ArrayBuffer) {
        const sampleRate = 48_000
        const channel = new Float32Array(Math.round(sampleRate * 0.5))
        return { sampleRate, length: channel.length, numberOfChannels: 1, getChannelData: () => channel }
      }
      async close() {}
    }
    Object.defineProperty(window, 'AudioContext', { value: SilentAudioContext, configurable: true })
  })

  await page.getByRole('button', { name: 'Extract melody' }).click()
  await expect(page.getByText('Could not extract a stable monophonic melody. Try recording again with a clearer single-note source.')).toBeVisible()
  await expect(page.locator('.piano-roll-note')).toHaveCount(before)
})

test('microphone recording and melody extraction copy localizes to Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()
  const recorder = page.getByRole('region', { name: 'マイクで録音' })
  await expect(recorder).toBeVisible()
  await recorder.getByRole('button', { name: '録音を開始' }).click()
  await recorder.getByRole('button', { name: '録音を停止' }).click()
  await expect(page.getByRole('button', { name: 'メロディーを抽出' })).toBeVisible()
})
