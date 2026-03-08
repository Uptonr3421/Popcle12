/**
 * Unit tests for mobile lib/auth.ts utility functions.
 * Pure function tests — no Supabase calls.
 *
 * lib/auth.ts imports from ./supabase, so we mock that module
 * to prevent any real Supabase initialization during tests.
 */
jest.mock('../../lib/supabase', () => require('../../__mocks__/lib/supabase'))

import { toE164, to10Digit } from '../../lib/auth'

describe('toE164', () => {
  it('converts 10-digit to E.164', () => {
    expect(toE164('2165551234')).toBe('+12165551234')
  })

  it('converts 11-digit starting with 1 to E.164', () => {
    expect(toE164('12165551234')).toBe('+12165551234')
  })

  it('returns E.164 as-is if already formatted', () => {
    expect(toE164('+12165551234')).toBe('+12165551234')
  })

  it('handles formatted input', () => {
    expect(toE164('(216) 555-1234')).toBe('+12165551234')
  })
})

describe('to10Digit', () => {
  it('strips country code from E.164', () => {
    expect(to10Digit('+12165551234')).toBe('2165551234')
  })

  it('strips leading 1 from 11-digit', () => {
    expect(to10Digit('12165551234')).toBe('2165551234')
  })

  it('returns 10-digit unchanged', () => {
    expect(to10Digit('2165551234')).toBe('2165551234')
  })
})
