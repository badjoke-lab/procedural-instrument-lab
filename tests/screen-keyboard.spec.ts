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

test('on-screen keyboard localizes in Japanese', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JA' }).click()
  await page.getByRole('link', { name: '作曲', exact: true }).click()
  await expect(page.getByRole('region', { name: '画面鍵盤' })).toBeVisible()
  await expect(page.getByRole('button', { name: '録音' })).toBeVisible()
})
