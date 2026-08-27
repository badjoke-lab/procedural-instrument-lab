import { expect, test } from '@playwright/test'

test('on-screen keyboard previews and records into the editable tune', async ({ page }) => {
  test.setTimeout(120_000)
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))

  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()

  const keyboard = page.getByRole('region', { name: 'On-screen keyboard' })
  await expect(keyboard).toBeVisible()
  const notes = page.locator('.piano-roll-note')
  const before = await notes.count()

  const record = keyboard.getByRole('button', { name: 'Record' })
  await record.click()
  await expect(keyboard.getByRole('status')).toContainText('Recording')

  await keyboard.getByRole('button', { name: 'C4' }).click()
  await expect(notes).toHaveCount(before + 1)
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()

  await keyboard.getByRole('button', { name: 'Stop recording' }).click()
  await expect(keyboard.getByRole('status')).toHaveCount(0)

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)
  expect(runtimeErrors).toEqual([])
})

test('computer keyboard previews and records through the same editable tune path', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await page.getByRole('link', { name: 'Compose', exact: true }).click()

  const keyboard = page.getByRole('region', { name: 'On-screen keyboard' })
  await expect(keyboard.getByText(/A S D F G H J K/)).toBeVisible()
  const c4 = keyboard.getByRole('button', { name: 'C4' })

  await page.keyboard.down('a')
  await expect(c4).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.up('a')
  await expect(c4).toHaveAttribute('aria-pressed', 'false')

  const notes = page.locator('.piano-roll-note')
  const before = await notes.count()
  await keyboard.getByRole('button', { name: 'Record' }).click()
  await page.keyboard.down('s')
  await page.waitForTimeout(80)
  await page.keyboard.up('s')
  await expect(notes).toHaveCount(before + 1)
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()

  const startBeat = page.getByLabel('Start beat')
  await startBeat.focus()
  const afterRecording = await notes.count()
  await page.keyboard.down('d')
  await page.keyboard.up('d')
  await expect(notes).toHaveCount(afterRecording)
})

test('on-screen keyboard localizes in Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()
  const keyboard = page.getByRole('region', { name: '画面鍵盤' })
  await expect(keyboard).toBeVisible()
  await expect(keyboard.getByRole('button', { name: '録音', exact: true })).toBeVisible()
  await expect(keyboard.getByText(/A S D F G H J K/)).toContainText('演奏・録音')
})
