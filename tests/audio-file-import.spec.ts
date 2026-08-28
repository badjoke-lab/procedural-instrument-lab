import { expect, test } from '@playwright/test'

test('audio file import stays local, preserves the tune and can be discarded', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()

  const importer = page.getByRole('region', { name: 'Import audio file' })
  await expect(importer).toBeVisible()
  const before = await page.locator('.piano-roll-note').count()

  await importer.locator('input[type="file"]').setInputFiles({
    name: 'local-melody.wav',
    mimeType: 'audio/wav',
    buffer: Buffer.from('RIFF-local-test-audio'),
  })

  await expect(importer.getByRole('status')).toHaveText('Audio file loaded. You can preview it here.')
  await expect(importer.getByText('local-melody.wav')).toBeVisible()
  await expect(importer.locator('audio')).toBeVisible()
  await expect(page.locator('.piano-roll-note')).toHaveCount(before)

  await page.screenshot({ path: testInfo.outputPath('runtime-audio-file-import.png'), fullPage: true })

  await importer.getByRole('button', { name: 'Discard file' }).click()
  await expect(importer.locator('audio')).toHaveCount(0)
  await expect(importer.getByText('local-melody.wav')).toHaveCount(0)
})

test('audio file import rejects an unsupported file and localizes to Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()

  const importer = page.getByRole('region', { name: '音声ファイルを読み込む' })
  await expect(importer).toBeVisible()
  await importer.locator('input[type="file"]').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not audio'),
  })

  await expect(importer.getByRole('status')).toHaveText('対応する音声ファイルを選んでください。')
  await expect(importer.locator('audio')).toHaveCount(0)
})
