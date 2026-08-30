import { expect, test, type Page } from '@playwright/test'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  gearRatio,
  pinContactWindow,
} from '../src/instruments/music-box/mechanism'

const INITIAL_DRIVE_ANGLE = 0.08
const EVIDENCE_SPEED = 0.25

function nextUnwrappedEntryPhase(entryAngle: number, initialPhase: number) {
  let entry = entryAngle
  while (entry > initialPhase) entry -= Math.PI * 2
  while (entry <= initialPhase - Math.PI * 2) entry += Math.PI * 2
  return entry
}

function millisecondsFromRunStart(progress: number) {
  const config = DEFAULT_MUSIC_BOX_CONFIG
  const ratio = gearRatio(config)
  const [pin] = compileTune([{ note: config.notes[0], start: 0 }], config)
  const window = pinContactWindow(pin, -1, config)
  if (!window) throw new Error('Expected a forward contact window for the first default pin')

  const initialPhase = -INITIAL_DRIVE_ANGLE * ratio
  const entryPhase = nextUnwrappedEntryPhase(window.entryAngle, initialPhase)
  const targetPhase = entryPhase - window.travelAngle * progress
  const targetDriveAngle = -targetPhase / ratio
  return ((targetDriveAngle - INITIAL_DRIVE_ANGLE) / EVIDENCE_SPEED) * 1000
}

async function saveContactCrop(page: Page, path: string) {
  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Canvas has no bounding box')
  await page.screenshot({
    path,
    clip: {
      x: box.x + box.width * 0.15,
      y: box.y + box.height * 0.24,
      width: box.width * 0.56,
      height: box.height * 0.5,
    },
  })
}

test('retain close pin tine loading and release evidence from the real contact window', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  const speed = page.locator('#speed-control')
  await speed.focus()
  await page.keyboard.press('Home')
  await expect(speed).toHaveValue(String(EVIDENCE_SPEED))

  const transport = page.locator('header .controls > button').first()
  const clickStartedAt = Date.now()
  await transport.click()
  await expect(transport).toHaveText('Stop')
  const activationDelay = Date.now() - clickStartedAt

  const loadingAAt = millisecondsFromRunStart(0.2)
  const loadingBAt = millisecondsFromRunStart(0.82)
  const releaseAt = millisecondsFromRunStart(1.08)

  await page.waitForTimeout(Math.max(0, loadingAAt - activationDelay))
  await saveContactCrop(page, testInfo.outputPath('causality-contact-loading-a.png'))

  await page.waitForTimeout(Math.max(0, loadingBAt - loadingAAt))
  await saveContactCrop(page, testInfo.outputPath('causality-contact-loading-b.png'))

  await page.waitForTimeout(Math.max(0, releaseAt - loadingBAt))
  await saveContactCrop(page, testInfo.outputPath('causality-contact-release.png'))

  await transport.click()
  await expect(transport).toHaveText('Play')
})
