export const messages = {
  en: {
    appSubtitle: 'music box / first vertical slice',
    play: 'Play',
    stop: 'Stop',
    speed: 'Speed',
    footer: 'Tune data generates cylinder pins. Pin contact plucks the matching tine and triggers the same note event.',
  },
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof (typeof messages)['en']

export const defaultLocale: Locale = 'en'

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return messages[locale][key]
}
