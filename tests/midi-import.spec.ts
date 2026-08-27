import { expect, test } from '@playwright/test'

function midiFixture(): Buffer {
  const track = [
    0x00,0xff,0x51,0x03,0x07,0xa1,0x20,
    0x00,0x90,60,100,
    0x60,0x80,60,0,
    0x00,0xff,0x2f,0x00,
  ]
  return Buffer.from([
    0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,0,96,
    0x4d,0x54,0x72,0x6b,0,0,0,track.length,
    ...track,
  ])
}

test('imports MIDI into the editable tune path', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const importer = page.getByRole('region', { name: 'Import MIDI' })
  await expect(importer).toBeVisible()
  const fileInput = importer.locator('input[type="file"]')
  await fileInput.setInputFiles({ name: 'fixture.mid', mimeType: 'audio/midi', buffer: midiFixture() })
  await expect(importer.getByRole('status')).toContainText('MIDI imported')
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()
  await expect(page.locator('.piano-roll-note')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Play' })).toBeEnabled()
})

test('MIDI import localizes in Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()
  await expect(page.getByRole('region', { name: 'MIDIを読み込む' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'MIDIファイルを選ぶ' })).toBeVisible()
})
