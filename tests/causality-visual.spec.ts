import { expect, test } from '@playwright/test'

test('retain close pin tine loading and release evidence', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  const speed = page.locator('#speed-control')
  await speed.focus()
  await page.keyboard.press('Home')
  await expect(speed).toHaveValue('0.25')

  // Zoom toward the mechanism so the retained frames are useful for reviewing the pin/tine interface.
  await canvas.hover()
  await page.mouse.wheel(0, -2200)
  await page.waitForTimeout(120)

  const transport = page.locator('header .controls > button').first()
  await transport.click()
  await expect(transport).toHaveText('Stop')

  // At minimum speed the first default-tune pin/tine pass unfolds slowly enough to retain
  // multiple frames through loading and the immediately following release/vibration state.
  await page.waitForTimeout(110)
  await canvas.screenshot({ path: testInfo.outputPath('causality-loading-a.png') })
  await page.waitForTimeout(65)
  await canvas.screenshot({ path: testInfo.outputPath('causality-loading-b.png') })
  await page.waitForTimeout(65)
  await canvas.screenshot({ path: testInfo.outputPath('causality-release.png') })

  await transport.click()
  await expect(transport).toHaveText('Play')
})
