/**
 * Extended geofence tests — additional distance calculations
 * beyond what geofence.test.ts already covers.
 */
jest.mock('../../lib/supabase', () => require('../../__mocks__/lib/supabase'))
jest.mock('../../lib/push', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(undefined),
}))

import { distanceMeters, STORE_LOCATION } from '../../lib/geofence'

describe('distanceMeters — Cleveland area', () => {
  it('calculates ~1km for a point roughly 1km from store', () => {
    // Approximately 0.009 degrees latitude ~ 1km
    const d = distanceMeters(
      STORE_LOCATION.lat,
      STORE_LOCATION.lng,
      STORE_LOCATION.lat + 0.009,
      STORE_LOCATION.lng
    )
    expect(d).toBeGreaterThan(900)
    expect(d).toBeLessThan(1100)
  })

  it('calculates reasonable distance from store to downtown Cleveland (~25km)', () => {
    // Downtown Cleveland: approx 41.4993, -81.6944
    const d = distanceMeters(STORE_LOCATION.lat, STORE_LOCATION.lng, 41.4993, -81.6944)
    expect(d).toBeGreaterThan(20000) // > 20km
    expect(d).toBeLessThan(35000) // < 35km
  })

  it('calculates small distance for nearby points (within geofence radius)', () => {
    // ~50 meters away
    const d = distanceMeters(
      STORE_LOCATION.lat,
      STORE_LOCATION.lng,
      STORE_LOCATION.lat + 0.00045,
      STORE_LOCATION.lng
    )
    expect(d).toBeGreaterThan(40)
    expect(d).toBeLessThan(60)
  })

  it('handles coordinates on opposite hemispheres', () => {
    const d = distanceMeters(41.4384, -81.4096, -33.8688, 151.2093) // Cleveland to Sydney
    expect(d).toBeGreaterThan(15000000) // > 15,000km
    expect(d).toBeLessThan(17000000) // < 17,000km
  })

  it('handles equator to pole', () => {
    const d = distanceMeters(0, 0, 90, 0)
    // Quarter of Earth circumference ~ 10,000km
    expect(d).toBeGreaterThan(9900000)
    expect(d).toBeLessThan(10100000)
  })
})
