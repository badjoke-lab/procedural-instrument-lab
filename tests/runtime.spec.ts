import { expect, test, type Page } from '@playwright/test'

function collectRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  return errors
}

async function changeControl(page: Page, selector: string, value: string) {
  await page.evaluate(({ selector, value }) => {
    const control = document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)
    if (!control) throw new Error(`Missing control: ${selector}`)
    control.value = value
    control.dispatchEvent(new Event('change', { bubbles: true }))
  }, { selector, value })
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

  await changeControl(page, '#speed-control', '1.5')
  await expect(page.locator('#speed-control')).toHaveValue('1.5')
  await expect(transport).toHaveText('Stop')
  await expect(transport).toHaveAttribute('aria-pressed', 'true')
  await page.waitForTimeout(700)

  await transport.click()
  await expect(transport).toHaveText('Play')
  await expect(transport).toHaveAttribute('aria-pressed', 'false')

  await changeControl(page, '#cylinder-length', '3.8')
  await expect(page.locator('#cylinder-length')).toHaveValue('3.8')
  await changeControl(page, '#tine-spacing', '0.38')
  await expect(page.locator('#tine-spacing')).toHaveValue('0.38')
  await changeControl(page, '#driver-teeth', '50')
  await expect(page.locator('#driver-teeth')).toHaveValue('50')
  await changeControl(page, '#cylinder-teeth', '25')
  await expect(page.locator('#cylinder-teeth')).toHaveValue('25')
  await expect(page.locator('.builder-error')).toHaveCount(0)

  const layout = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>('.scene')
    const builder = document.querySelector<HTMLElement>('.builder-panel')
    if (!scene || !builder) throw new Error('Missing scene or builder')
    const sceneRect = scene.getBoundingClientRect()
    const builderRect = builder.getBoundingClientRect()
    return {
      scene: { x: sceneRect.x, y: sceneRect.y, width: sceneRect.width, height: sceneRect.height },
      builder: { x: builderRect.x, y: builderRect.y, width: builderRect.width, height: builderRect.height },
    }
  })

  expect(layout.scene.width).toBeGreaterThan(0)
  expect(layout.scene.height).toBeGreaterThan(0)
  expect(layout.builder.width).toBeGreaterThan(0)
  expect(layout.builder.height).toBeGreaterThan(0)

  if (testInfo.project.name === 'mobile-chromium') {
    expect(layout.scene.y).toBeLessThan(layout.builder.y)
  } else {
    expect(layout.builder.x).toBeLessThan(layout.scene.x)
  }

  await page.screenshot({ path: testInfo.outputPath('runtime.png'), fullPage: true })
  expect(errors).toEqual([])
})

test('invalid builder configuration keeps last valid mechanism and exposes an alert', async ({ page }) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await changeControl(page, '#cylinder-length', '2.8')
  await expect(page.locator('#cylinder-length')).toHaveValue('2.8')
  await expect(page.locator('.builder-error')).toHaveCount(0)

  await changeControl(page, '#tine-spacing', '0.46')

  await expect(page.locator('#tine-spacing')).toHaveValue('0.34')
  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('configuration')
  await expect(page.locator('canvas')).toBeVisible()
  expect(errors).toEqual([])
})

test('builder controls retain label associations and keyboard focusability', async ({ page }) => {
  await page.goto('/')

  for (const id of ['speed-control', 'cylinder-length', 'tine-spacing', 'driver-teeth', 'cylinder-teeth']) {
    await expect(page.locator(`label[for="${id}"]`)).toBeVisible()
    await expect(page.locator(`#${id}`)).toBeVisible()
  }

  const controls = page.locator('button, input, select')
  const count = await controls.count()
  expect(count).toBeGreaterThan(0)

  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})

test('EN JA switching updates document language and visible UI', async ({ page }, testInfo) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByText('Builder', { exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('localization-en.png'), fullPage: true })

  await page.getByRole('button', { name: 'JA' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.getByText('ビルダー', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '視点をリセット' })).toBeVisible()

  const noHorizontalOverflowJa = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflowJa).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('localization-ja.png'), fullPage: true })

  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByText('Builder', { exact: true })).toBeVisible()

  expect(errors).toEqual([])
})
