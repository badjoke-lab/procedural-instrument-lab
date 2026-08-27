import { expect, test, type Page } from '@playwright/test'

function collectRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  return errors
}

test('music box renders and core controls work', async ({ page }, testInfo) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
  await expect(page.getByText('Builder', { exact: true })).toBeVisible()

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)

  const transport = page.locator('header .controls > button').first()
  await expect(transport).toHaveText('Play')
  await expect(transport).toHaveAttribute('aria-pressed', 'false')
  await transport.click()
  await expect(transport).toHaveText('Stop')
  await expect(transport).toHaveAttribute('aria-pressed', 'true')
  await page.waitForTimeout(700)
  await transport.click()
  await expect(transport).toHaveText('Play')
  await expect(transport).toHaveAttribute('aria-pressed', 'false')

  await page.locator('#driver-teeth').selectOption('50')
  await page.locator('#cylinder-teeth').selectOption('25')
  await expect(page.locator('.builder-error')).toHaveCount(0)

  const scene = await page.locator('.scene').boundingBox()
  const builder = await page.locator('.builder-panel').boundingBox()
  expect(scene).not.toBeNull()
  expect(builder).not.toBeNull()

  if (testInfo.project.name === 'mobile-chromium') {
    expect(scene!.y).toBeLessThan(builder!.y)
  } else {
    expect(builder!.x).toBeLessThan(scene!.x)
  }

  await page.screenshot({ path: testInfo.outputPath('runtime.png'), fullPage: true })
  expect(errors).toEqual([])
})

test('EN JA switching updates document language and visible UI', async ({ page }, testInfo) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('button', { name: 'JA' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.getByText('ビルダー', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '視点をリセット' })).toBeVisible()

  const noHorizontalOverflowJa = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflowJa).toBe(true)

  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByText('Builder', { exact: true })).toBeVisible()

  await page.screenshot({ path: testInfo.outputPath('localization.png'), fullPage: true })
  expect(errors).toEqual([])
})
