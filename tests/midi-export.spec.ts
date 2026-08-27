import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('Compose exports the editable TuneDocument as a MIDI file', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()

  const exportRegion = page.getByRole('region', { name: 'Export MIDI' })
  await expect(exportRegion).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await exportRegion.getByRole('button', { name: 'Download MIDI' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.mid$/)

  const path = await download.path()
  expect(path).not.toBeNull()
  const bytes = await readFile(path!)
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('MThd')
  expect(bytes.length).toBeGreaterThan(20)

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('runtime-midi-export.png'), fullPage: true })
})
