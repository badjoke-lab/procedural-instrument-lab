import { expect, test, type Page } from '@playwright/test'

function collectRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  return errors
}

async function setRangeBoundary(page: Page, selector: string, key: 'Home' | 'End') {
  const control = page.locator(selector)
  await control.focus()
  await page.keyboard.press(key)
}

test('music box renders and core controls work', async ({ page }, testInfo) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect(page.getByText('Mechanical Music Box', { exact: true })).toBeVisible()
  await expect(page.getByText('Play and customize a music box.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Customize', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'How to use' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
  await expect(page.getByText('Customize', { exact: true }).last()).toBeVisible()

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflow).toBe(true)

  const transport = page.locator('header .controls > button').first()
  await expect(transport).toHaveText('Play')
  await expect(transport).toHaveAttribute('aria-pressed', 'false')
  await transport.click()
  await expect(transport).toHaveText('Stop')
  await expect(transport).toHaveAttribute('aria-pressed', 'true')

  await setRangeBoundary(page, '#speed-control', 'End')
  await expect(page.locator('#speed-control')).toHaveValue('2')
  await expect(transport).toHaveText('Stop')
  await page.waitForTimeout(700)
  await expect(canvas).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('runtime-playing.png'), fullPage: true })

  await transport.click()
  await expect(transport).toHaveText('Play')

  const reset = page.getByRole('button', { name: 'Reset view' })
  await reset.click()
  await expect(canvas).toBeVisible()

  await setRangeBoundary(page, '#cylinder-length', 'End')
  await expect(page.locator('#cylinder-length')).toHaveValue('4.4')
  await setRangeBoundary(page, '#tine-spacing', 'Home')
  await expect(page.locator('#tine-spacing')).toHaveValue('0.26')
  await page.locator('#driver-teeth').selectOption('50')
  await expect(page.locator('#driver-teeth')).toHaveValue('50')
  await page.locator('#cylinder-teeth').selectOption('25')
  await expect(page.locator('#cylinder-teeth')).toHaveValue('25')
  await expect(page.locator('.builder-error')).toHaveCount(0)

  const layout = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>('.scene')
    const builder = document.querySelector<HTMLElement>('.builder-panel')
    if (!scene || !builder) throw new Error('Missing scene or customize section')
    const sceneRect = scene.getBoundingClientRect()
    const builderRect = builder.getBoundingClientRect()
    const builderStyle = getComputedStyle(builder)
    return {
      scene: { x: sceneRect.x, y: sceneRect.y, width: sceneRect.width, height: sceneRect.height },
      builder: { x: builderRect.x, y: builderRect.y, width: builderRect.width, height: builderRect.height },
      builderOverflowY: builderStyle.overflowY,
      builderMaxHeight: builderStyle.maxHeight,
    }
  })

  expect(layout.scene.width).toBeGreaterThan(0)
  expect(layout.scene.height).toBeGreaterThan(0)
  expect(layout.builder.width).toBeGreaterThan(0)
  expect(layout.builder.height).toBeGreaterThan(0)

  if (testInfo.project.name === 'mobile-chromium') {
    expect(layout.scene.y).toBeLessThan(layout.builder.y)
    expect(['auto', 'scroll']).not.toContain(layout.builderOverflowY)
    expect(layout.builderMaxHeight).toBe('none')
  } else {
    expect(layout.builder.x).toBeLessThan(layout.scene.x)
  }

  await page.screenshot({ path: testInfo.outputPath('runtime.png'), fullPage: true })
  expect(errors).toEqual([])
})

test('invalid customization keeps last valid mechanism and exposes an alert', async ({ page }) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await setRangeBoundary(page, '#cylinder-length', 'Home')
  await expect(page.locator('#cylinder-length')).toHaveValue('2.8')
  await expect(page.locator('.builder-error')).toHaveCount(0)

  await setRangeBoundary(page, '#tine-spacing', 'End')

  await expect(page.locator('label[for="tine-spacing"] output')).toHaveText('0.34')
  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('combination')
  await expect(page.locator('canvas')).toBeVisible()
  expect(errors).toEqual([])
})

test('customization controls retain label associations and keyboard focusability', async ({ page }) => {
  await page.goto('/')

  for (const id of ['speed-control', 'cylinder-length', 'tine-spacing', 'driver-teeth', 'cylinder-teeth']) {
    await expect(page.locator(`label[for="${id}"]`)).toBeVisible()
    await expect(page.locator(`#${id}`)).toBeVisible()
  }

  const controls = page.locator('button, input, select, a')
  const count = await controls.count()
  expect(count).toBeGreaterThan(0)

  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})

test('How to use and About pages are reachable from the primary page', async ({ page }) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await page.getByRole('link', { name: 'How to use' }).click()
  await expect(page).toHaveURL(/\?page=how-to-use$/)
  await expect(page.getByRole('heading', { name: 'How to use', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'How the music box works' })).toBeVisible()

  await page.getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL(/\?page=about$/)
  await expect(page.getByRole('heading', { name: 'About', level: 1 })).toBeVisible()
  const inspiration = page.getByRole('link', { name: 'View the X post' })
  await expect(inspiration).toHaveAttribute('href', 'https://x.com/McGreenBeats/status/2092243021777580466')

  await page.getByRole('link', { name: 'Back to music box' }).click()
  await expect(page.locator('canvas')).toBeVisible()
  expect(errors).toEqual([])
})

test('EN JA switching updates document language and visible UI', async ({ page }, testInfo) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByText('Customize', { exact: true }).last()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('localization-en.png'), fullPage: true })

  await page.getByRole('button', { name: 'JA' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.getByText('カスタマイズ', { exact: true }).last()).toBeVisible()
  await expect(page.getByRole('button', { name: '視点をリセット' })).toBeVisible()
  await expect(page.getByRole('link', { name: '使い方' })).toBeVisible()

  const noHorizontalOverflowJa = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  expect(noHorizontalOverflowJa).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('localization-ja.png'), fullPage: true })

  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByText('Customize', { exact: true }).last()).toBeVisible()

  expect(errors).toEqual([])
})
