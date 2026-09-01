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

async function generateOctaveFit(page: Page) {
  const autoFit = page.getByRole('region', { name: 'Auto Fit to Music Box' })
  await autoFit.getByLabel('Move pitches by octaves where possible').check()
  await autoFit.getByRole('button', { name: 'Generate fit proposal' }).click()
  await expect(autoFit.getByRole('status')).toContainText('Fit proposal ready')
  return autoFit
}

test('previews a fit proposal without accepting it', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  await importConflictMidi(page)

  const compatibility = page.getByRole('region', { name: 'Music box compatibility' })
  await expect(compatibility.getByRole('status')).toHaveText('Needs fitting before reliable mechanical playback')
  const autoFit = await generateOctaveFit(page)

  const result = autoFit.getByRole('status')
  await expect(result).toContainText('Blocking conflicts: 1 → 0')
  await expect(result).toContainText('Octave moves: 1')
  await expect(result).toContainText('Source notes: 2 · Fitted notes: 2')
  await expect(compatibility.getByRole('status')).toHaveText('Fits the current music box')
  await expect(page.locator('.piano-roll-note[title^="B4"]')).toHaveCount(1)
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()
})

test('manually corrects the fitted proposal before acceptance', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  await importConflictMidi(page)
  const autoFit = await generateOctaveFit(page)

  const inspector = page.locator('.piano-roll-inspector')
  await page.locator('.piano-roll-note[title^="B4"]').click()
  await inspector.locator('select').selectOption('67')
  await expect(page.locator('.piano-roll-note[title^="G4"]')).toHaveCount(1)
  await expect(autoFit.getByRole('status')).toContainText('Fit proposal ready')

  await autoFit.getByRole('button', { name: 'Use fitted result' }).click()
  await expect(autoFit.getByRole('status')).toHaveCount(0)
  await expect(page.locator('.piano-roll-note[title^="G4"]')).toHaveCount(1)
})

test('discarding the fit proposal restores the unchanged source', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  await importConflictMidi(page)
  const autoFit = await generateOctaveFit(page)

  await expect(page.locator('.piano-roll-note[title^="B4"]')).toHaveCount(1)
  await autoFit.getByRole('button', { name: 'Discard fit proposal' }).click()
  await expect(page.locator('.piano-roll-note[title^="B4"]')).toHaveCount(0)
  const compatibility = page.getByRole('region', { name: 'Music box compatibility' })
  await expect(compatibility.locator('[data-kind="range"]')).toContainText('MIDI 59')
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
