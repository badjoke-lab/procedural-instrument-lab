import { describe, expect, it } from 'vitest'
import { defaultLocale, messages } from './messages'

describe('UI localization catalogs', () => {
  it('keeps English as the default locale', () => {
    expect(defaultLocale).toBe('en')
  })

  it('keeps English and Japanese message keys in exact parity', () => {
    const enKeys = Object.keys(messages.en).sort()
    const jaKeys = Object.keys(messages.ja).sort()
    expect(jaKeys).toEqual(enKeys)
  })

  it('does not ship empty user-facing messages', () => {
    for (const catalog of Object.values(messages)) {
      for (const value of Object.values(catalog)) {
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
