import { expect, test, type Page } from '@playwright/test'

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

async function importConflictMidi(page: Page) {
  const importer = page.getByRole('region', { name: 'Import MIDI' })
  await importer.locator('input[type="file"]').setInputFiles({
    name: 'auto-fit-conflict.mid',
    mimeType: 'audio/midi',
    buffer: conflictMidiFixture(),
  })
  await expect(importer.getByRole('status')).toContainText('MIDI imported')
}

test('generates a fit proposal without changing the editable melody', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  await importConflictMidi(page)

  const compatibility = page.getByRole('region', { name: 'Music box compatibility' })
  await expect(compatibility.getByRole('status')).toHaveText('Needs fitting before reliable mechanical playback')
  await expect(compatibility.locator('[data-kind="range"]')).toContainText('MIDI 59')

  const autoFit = page.getByRole('region', { name: 'Auto Fit to Music Box' })
  await expect(autoFit).toBeVisible()
  const generate = autoFit.getByRole('button', { name: 'Generate fit proposal' })
  await expect(generate).toBeDisabled()

  await autoFit.getByLabel('Move pitches by octaves where possible').check()
  await expect(generate).toBeEnabled()
  await generate.click()

  const result = autoFit.getByRole('status')
  await expect(result).toContainText('Fit proposal ready')
  await expect(result).toContainText('Blocking conflicts: 1 → 0')
  await expect(result).toContainText('Octave moves: 1')

  await expect(compatibility.getByRole('status')).toHaveText('Needs fitting before reliable mechanical playback')
  await expect(compatibility.locator('[data-kind="range"]')).toContainText('MIDI 59')
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()
})

test('changing the editable source invalidates a stale fit proposal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  await importConflictMidi(page)

  const autoFit = page.getByRole('region', { name: 'Auto Fit to Music Box' })
  await autoFit.getByLabel('Move pitches by octaves where possible').check()
  await autoFit.getByRole('button', { name: 'Generate fit proposal' }).click()
  await expect(autoFit.getByRole('status')).toContainText('Fit proposal ready')

  await page.getByRole('button', { name: 'Add note' }).click()
  await expect(autoFit.getByRole('status')).toHaveCount(0)
})

test('Auto Fit controls localize to Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()

  const autoFit = page.getByRole('region', { name: 'オルゴールにAuto Fit' })
  await expect(autoFit).toBeVisible()
  await expect(autoFit.getByText('可能な音はオクターブ移動する')).toBeVisible()
  await expect(autoFit.getByLabel('タイミングの量子化')).toHaveValue('off')
  await expect(autoFit.getByRole('button', { name: 'フィット候補を生成' })).toBeDisabled()
})
