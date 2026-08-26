import { describe, expect, it } from 'vitest'
import { defaultLocale, messages } from './messages'

describe('UI message catalogs', () => {
  it('keeps English as the default locale', () => {
    expect(defaultLocale).toBe('en')
  })

  it('keeps Japanese keys exactly aligned with English', () => {
    expect(Object.keys(messages.ja).sort()).toEqual(Object.keys(messages.en).sort())
  })

  it('contains no empty current UI messages', () => {
    for (const catalog of Object.values(messages)) {
      for (const value of Object.values(catalog)) {
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
