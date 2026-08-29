import { expect, test } from '@playwright/test'

function conflictMidiFixture(): Buffer {
  const track = [
    0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
    0x00, 0x90, 59, 100,
    0x00, 0x90, 60, 100,
    0x60, 0x80, 59, 0,
    0x00, 0x80, 60, 0,
    0x00, 0xff, 0x2f, 0x00,
  ]
  return Buffer.from([
    0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96,
    0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, track.length,
    ...track,
  ])
}

test('reports current mechanism compatibility without changing the tune', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()

  const panel = page.getByRole('region', { name: 'Music box compatibility' })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('status')).toHaveText('Fits current mechanism')

  const importer = page.getByRole('region', { name: 'Import MIDI' })
  await importer.locator('input[type="file"]').setInputFiles({
    name: 'compatibility-conflicts.mid',
    mimeType: 'audio/midi',
    buffer: conflictMidiFixture(),
  })
  await expect(importer.getByRole('status')).toContainText('MIDI imported')

  await expect(panel.getByRole('status')).toHaveText('Needs fitting before reliable mechanical playback')
  await expect(panel.locator('[data-kind="range"]')).toContainText('Out of range')
  await expect(panel.locator('[data-kind="range"]')).toContainText('MIDI 59')
  await expect(panel.locator('[data-kind="simultaneous"]')).toContainText('Simultaneous starts')
  await expect(panel.getByText('Blocking conflicts:')).toBeVisible()
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()
  await panel.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('runtime-compatibility.png'), fullPage: true })
})

test('compatibility report localizes to Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()
  const panel = page.getByRole('region', { name: 'オルゴール適合チェック' })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('status')).toHaveText('現在の機構で再生可能')
  await expect(panel.getByText('現在の櫛歯で鳴らせる音:')).toBeVisible()
})
