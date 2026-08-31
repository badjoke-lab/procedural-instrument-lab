import { expect, test, type Page } from '@playwright/test'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  gearRatio,
  pinContactWindow,
} from '../src/instruments/music-box/mechanism'

const INITIAL_DRIVE_ANGLE = 0.08
const EVIDENCE_SPEED = 0.25
const PRE_ENTRY_LEAD_MS = 180
const EVIDENCE_FRAME_COUNT = 12

function midiFixture(): Buffer {
  const track = [
    0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
    0x00, 0x90, 60, 100,
    0x60, 0x80, 60, 0,
    0x00, 0xff, 0x2f, 0x00,
  ]
  return Buffer.from([
    0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96,
    0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, track.length,
    ...track,
  ])
}

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
      x: box.x + box.width * 0.28,
      y: box.y + box.height * 0.3,
      width: box.width * 0.36,
      height: box.height * 0.32,
    },
  })
}

async function importSinglePinTune(page: Page) {
  const compose = page.locator('#compose')
  await compose.locator('summary').click()
  await expect(compose).toHaveAttribute('open', '')

  const importer = compose.getByRole('region', { name: 'Import MIDI' })
  await expect(importer).toBeVisible()
  await importer.locator('input[type="file"]').setInputFiles({
    name: 'single-c4.mid',
    mimeType: 'audio/midi',
    buffer: midiFixture(),
  })
  await expect(importer.getByRole('status')).toContainText('MIDI imported')
  await expect(page.locator('.piano-roll-note')).toHaveCount(1)
  await expect(page.getByText('Edited tune', { exact: true })).toBeVisible()

  const inspector = page.locator('.piano-roll-inspector')
  await expect(inspector.locator('select')).toHaveValue('60')
  await expect(inspector.locator('input[type="number"]').first()).toHaveValue('0')

  // Close Compose again so the retained canvas evidence has the normal mechanism framing.
  await compose.locator('summary').click()
  await expect(compose).not.toHaveAttribute('open', '')
}

test('retain a continuous single-pin frame sequence across the real contact and release window', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await importSinglePinTune(page)

  const speed = page.locator('#speed-control')
  await speed.focus()
  await page.keyboard.press('Home')
  await expect(speed).toHaveValue(String(EVIDENCE_SPEED))

  const transport = page.locator('header .controls > button').first()
  const entryAt = millisecondsFromRunStart(0)
  const activationStartedAt = Date.now()
  await transport.click()
  await expect(transport).toHaveText('Stop')
  const activationDelay = Date.now() - activationStartedAt

  // Do not stop/restart inside the contact window. A stop at a presentation-held phase leaves
  // requested-drive debt that is intentionally consumed on resume and would corrupt visual evidence.
  // Instead capture a continuous burst beginning shortly before the geometry-derived entry time.
  await page.waitForTimeout(Math.max(0, entryAt - PRE_ENTRY_LEAD_MS - activationDelay))
  for (let index = 0; index < EVIDENCE_FRAME_COUNT; index += 1) {
    await saveContactCrop(page, testInfo.outputPath(`causality-contact-sequence-${String(index).padStart(2, '0')}.png`))
    await page.waitForTimeout(16)
  }

  await transport.click()
  await expect(transport).toHaveText('Play')
})
