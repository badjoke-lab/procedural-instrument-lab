import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeAudioContext {
      async decodeAudioData(_data: ArrayBuffer) {
        const sampleRate = 48_000
        const length = Math.round(sampleRate * 0.5)
        const channel = new Float32Array(length)
        for (let i = 0; i < length; i += 1) channel[i] = Math.sin(2 * Math.PI * 440 * (i / sampleRate)) * 0.7
        return { sampleRate, length, numberOfChannels: 1, getChannelData: () => channel }
      }
      async close() {}
    }
    Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true })
  })
})

test('recognized audio stays a correctable candidate until explicitly accepted', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const importer = page.getByRole('region', { name: 'Import audio file' })
  await importer.locator('input[type="file"]').setInputFiles({ name: 'a4-melody.wav', mimeType: 'audio/wav', buffer: Buffer.from('RIFF-local-test-audio') })

  await page.getByRole('button', { name: 'Extract melody from audio' }).click()
  await expect(page.getByText('Audio melody candidates are shown in the piano roll below. Review or correct them before accepting.')).toBeVisible()
  const review = page.getByRole('region', { name: 'Review recognized melody' })
  await expect(review).toBeVisible()
  await expect(page.locator('.piano-roll-note[title^="A4"]')).toHaveCount(1)
  await expect(page.getByText('Edited tune')).toHaveCount(0)

  const inspector = page.locator('.piano-roll-inspector')
  await inspector.locator('select').selectOption('67')
  await expect(page.locator('.piano-roll-note[title^="G4"]')).toHaveCount(1)
  await expect(page.getByText('Edited tune')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('runtime-recognition-review.png'), fullPage: true })

  await review.getByRole('button', { name: 'Accept recognized melody' }).click()
  await expect(review).toHaveCount(0)
  await expect(page.getByText('Edited tune')).toBeVisible()
  await expect(page.locator('.piano-roll-note[title^="G4"]')).toHaveCount(1)
})

test('recognition candidate can be discarded without changing accepted tune', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const before = await page.locator('.piano-roll-note').count()
  const importer = page.getByRole('region', { name: 'Import audio file' })
  await importer.locator('input[type="file"]').setInputFiles({ name: 'a4-melody.wav', mimeType: 'audio/wav', buffer: Buffer.from('RIFF-local-test-audio') })
  await page.getByRole('button', { name: 'Extract melody from audio' }).click()
  const review = page.getByRole('region', { name: 'Review recognized melody' })
  await review.getByRole('button', { name: 'Discard candidate' }).click()
  await expect(review).toHaveCount(0)
  await expect(page.locator('.piano-roll-note')).toHaveCount(before)
  await expect(page.getByText('Edited tune')).toHaveCount(0)
})

test('failed audio analysis leaves the editable tune unchanged and localizes to Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const before = await page.locator('.piano-roll-note').count()
  const importer = page.getByRole('region', { name: 'Import audio file' })
  await importer.locator('input[type="file"]').setInputFiles({ name: 'silent.wav', mimeType: 'audio/wav', buffer: Buffer.from('RIFF-silent') })

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

  await page.getByRole('button', { name: 'Extract melody from audio' }).click()
  await expect(page.getByText('Could not extract a stable monophonic melody. Try a clearer single-note audio file.')).toBeVisible()
  await expect(page.locator('.piano-roll-note')).toHaveCount(before)

  await page.getByRole('button', { name: 'JA' }).click()
  await expect(page.getByRole('button', { name: '音声からメロディーを抽出' })).toBeVisible()
})