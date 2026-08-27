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
  })
})

test('microphone permission is explicit and the local clip can be previewed, re-recorded and discarded', async ({ page }, testInfo) => {
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

  await recorder.getByRole('button', { name: 'Start recording' }).click()
  await expect(recorder.getByRole('status')).toHaveText('Recording…')
  await expect(recorder.locator('audio')).toHaveCount(0)
  expect(await page.evaluate(() => (window as any).__micTestState.requests)).toBe(2)
  await recorder.getByRole('button', { name: 'Stop recording' }).click()
  await expect(recorder.locator('audio')).toBeVisible()

  await page.screenshot({ path: testInfo.outputPath('runtime-microphone-recording.png'), fullPage: true })

  await recorder.getByRole('button', { name: 'Discard recording' }).click()
  await expect(recorder.locator('audio')).toHaveCount(0)
})

test('microphone recording copy localizes to Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()
  await expect(page.getByRole('region', { name: 'マイクで録音' })).toBeVisible()
  await expect(page.getByRole('button', { name: '録音を開始' })).toBeVisible()
})
