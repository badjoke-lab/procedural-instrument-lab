import { expect, test, type Locator, type Page } from '@playwright/test'
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

async function runForAndFreeze(page: Page, transport: Locator, durationMs: number) {
  const activationStartedAt = Date.now()
  await transport.click()
  await expect(transport).toHaveText('Stop')
  const activationDelay = Date.now() - activationStartedAt

  await page.waitForTimeout(Math.max(0, durationMs - activationDelay))
  await transport.click()
  await expect(transport).toHaveText('Play')
  await page.waitForTimeout(34)
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

async function reduceTuneToOneC4AtBeatZero(page: Page) {
  await page.getByRole('link', { name: 'Compose', exact: true }).click()
  const notes = page.locator('.piano-roll-note')
  const remove = page.getByRole('button', { name: 'Remove note' })
  const initialCount = await notes.count()
  expect(initialCount).toBeGreaterThan(1)

  for (let count = initialCount; count > 1; count -= 1) {
    await remove.click()
    await expect(notes).toHaveCount(count - 1)
  }

  const inspector = page.locator('.piano-roll-inspector')
  await inspector.locator('select').selectOption('60')
  await inspector.locator('input[type="number"]').first().fill('0')
  await expect(notes).toHaveCount(1)
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()

  // Close Compose again so the retained canvas evidence has the normal mechanism framing.
  await page.locator('#compose > summary').click()
  await expect(page.locator('#compose')).not.toHaveAttribute('open', '')
}

test('retain frozen single-pin loading and release evidence from the real contact window', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await reduceTuneToOneC4AtBeatZero(page)

  const speed = page.locator('#speed-control')
  await speed.focus()
  await page.keyboard.press('Home')
  await expect(speed).toHaveValue(String(EVIDENCE_SPEED))

  const transport = page.locator('header .controls > button').first()
  const loadingAAt = millisecondsFromRunStart(0.2)
  const loadingBAt = millisecondsFromRunStart(0.82)
  const releaseAt = millisecondsFromRunStart(1.03)

  await runForAndFreeze(page, transport, loadingAAt)
  await saveContactCrop(page, testInfo.outputPath('causality-contact-loading-a.png'))

  await runForAndFreeze(page, transport, loadingBAt - loadingAAt)
  await saveContactCrop(page, testInfo.outputPath('causality-contact-loading-b.png'))

  await runForAndFreeze(page, transport, releaseAt - loadingBAt)
  await saveContactCrop(page, testInfo.outputPath('causality-contact-release.png'))

  await expect(transport).toHaveText('Play')
})
