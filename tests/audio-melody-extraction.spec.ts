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

test('local audio file can be analyzed into editable tune data', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const importer = page.getByRole('region', { name: 'Import audio file' })

  await importer.locator('input[type="file"]').setInputFiles({
    name: 'a4-melody.wav',
    mimeType: 'audio/wav',
    buffer: Buffer.from('RIFF-local-test-audio'),
  })

  await page.getByRole('button', { name: 'Extract melody from audio' }).click()
  await expect(page.getByText('Audio melody candidates were converted to editable tune data.')).toBeVisible()
  await expect(page.locator('.piano-roll-note[title^="A4"]')).toHaveCount(1)
  await page.screenshot({ path: testInfo.outputPath('runtime-audio-melody.png'), fullPage: true })

  await importer.getByRole('button', { name: 'Discard file' }).click()
  await expect(page.getByRole('button', { name: 'Extract melody from audio' })).toHaveCount(0)
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
