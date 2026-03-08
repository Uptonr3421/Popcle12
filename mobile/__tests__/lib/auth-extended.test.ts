/**
 * Extended auth tests — edge cases not covered in auth.test.ts.
 */
jest.mock('../../lib/supabase', () => require('../../__mocks__/lib/supabase'))

import { toE164, to10Digit } from '../../lib/auth'

describe('toE164 — edge cases', () => {
  it('handles short number (less than 10 digits)', () => {
    const result = toE164('555')
    // Should add + prefix to whatever digits remain
    expect(result).toBe('+555')
  })

  it('handles empty string', () => {
    const result = toE164('')
    expect(result).toBe('+')
  })

  it('handles non-numeric input (letters stripped)', () => {
    const result = toE164('abc')
    expect(result).toBe('+')
  })

  it('handles number with dashes', () => {
    expect(toE164('216-555-1234')).toBe('+12165551234')
  })

  it('handles number with dots', () => {
    expect(toE164('216.555.1234')).toBe('+12165551234')
  })

  it('handles number with spaces', () => {
    expect(toE164('216 555 1234')).toBe('+12165551234')
  })

  it('handles international format with +1 prefix', () => {
    expect(toE164('+12165551234')).toBe('+12165551234')
  })

  it('handles 11-digit without + prefix', () => {
    expect(toE164('12165551234')).toBe('+12165551234')
  })
})

describe('to10Digit — edge cases', () => {
  it('handles short number', () => {
    expect(to10Digit('555')).toBe('555')
  })

  it('handles formatted phone', () => {
    expect(to10Digit('(216) 555-1234')).toBe('2165551234')
  })

  it('handles empty string', () => {
    expect(to10Digit('')).toBe('')
  })

  it('strips non-digit characters', () => {
    expect(to10Digit('abc-216-555-1234')).toBe('2165551234')
  })

  it('handles 11-digit with country code', () => {
    expect(to10Digit('12165551234')).toBe('2165551234')
  })
})
