export const messages = {
  en: {
    appSubtitle: 'music box / procedural builder',
    play: 'Play',
    stop: 'Stop',
    speed: 'Speed',
    resetView: 'Reset view',
    builder: 'Builder',
    cylinderLength: 'Cylinder length',
    tineSpacing: 'Tine spacing',
    driverTeeth: 'Driver teeth',
    cylinderTeeth: 'Cylinder teeth',
    crankHint: 'Drag the crank handle to rotate the mechanism.',
    invalidConfig: 'That configuration is not physically valid for the current parts.',
    footer: 'The crank, gears, cylinder, pin contact, tine motion and sound share one mechanical state.',
  },
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof (typeof messages)['en']

export const defaultLocale: Locale = 'en'

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return messages[locale][key]
}
