/**
 * Unit tests for mobile lib/geofence.ts utility functions.
 * Tests pure math (distanceMeters) and exported constants.
 *
 * geofence.ts imports expo-location, expo-task-manager, and supabase.
 * All three are mocked via jest.setup.js and the mock below.
 */
jest.mock('../../lib/supabase', () => require('../../__mocks__/lib/supabase'))
jest.mock('../../lib/push', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(undefined),
}))

import { distanceMeters, STORE_LOCATION } from '../../lib/geofence'

describe('distanceMeters', () => {
  it('returns 0 for same coordinates', () => {
    const d = distanceMeters(41.4384, -81.4096, 41.4384, -81.4096)
    expect(d).toBe(0)
  })

  it('returns correct distance between two points (~111km per degree latitude)', () => {
    const d = distanceMeters(0, 0, 1, 0)
    expect(d).toBeGreaterThan(110000)
    expect(d).toBeLessThan(112000)
  })

  it('is symmetric (distance A→B equals B→A)', () => {
    const d1 = distanceMeters(41.4384, -81.4096, 41.5, -81.5)
    const d2 = distanceMeters(41.5, -81.5, 41.4384, -81.4096)
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001)
  })
})

describe('STORE_LOCATION', () => {
  it('has correct store coordinates for Pop Culture CLE', () => {
    expect(STORE_LOCATION.lat).toBeCloseTo(41.4384, 3)
    expect(STORE_LOCATION.lng).toBeCloseTo(-81.4096, 3)
  })

  it('has name and address', () => {
    expect(STORE_LOCATION.name).toBe('Pop Culture CLE')
    expect(STORE_LOCATION.address).toContain('Solon')
  })
})
