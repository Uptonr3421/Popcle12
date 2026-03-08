/**
 * Unit tests for mobile lib/push.ts
 * Mocks expo-notifications, expo-device, supabase, and AsyncStorage.
 */

// Must mock supabase before importing push.ts
jest.mock('../../lib/supabase', () => require('../../__mocks__/lib/supabase'))

// Mock expo-device — use a mutable object on globalThis to survive jest hoisting
let mockIsDevice = false
jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice
  },
}))

import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { registerPushToken } from '../../lib/push'

beforeEach(() => {
  jest.clearAllMocks()
  mockIsDevice = false
})

describe('registerPushToken', () => {
  it('returns null when not on a physical device', async () => {
    const result = await registerPushToken('user-123')
    expect(result).toBeNull()
  })

  it('does not request permissions when not on device', async () => {
    await registerPushToken('user-123')
    expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled()
  })

  describe('when on a physical device', () => {
    beforeEach(() => {
      mockIsDevice = true
    })

    it('checks existing permissions first', async () => {
      await registerPushToken('user-123')
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled()
    })

    it('gets expo push token when permissions granted', async () => {
      await registerPushToken('user-123')
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled()
    })

    it('saves token to AsyncStorage', async () => {
      await registerPushToken('user-123')
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@popcle_push_token',
        'ExponentPushToken[test]'
      )
    })

    it('updates user record in Supabase', async () => {
      await registerPushToken('user-123')
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('returns the token string', async () => {
      const token = await registerPushToken('user-123')
      expect(token).toBe('ExponentPushToken[test]')
    })

    it('requests permissions if not already granted', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      })
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      })

      await registerPushToken('user-123')
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled()
    })

    it('returns null if permissions denied', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      })
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      })

      const result = await registerPushToken('user-123')
      expect(result).toBeNull()
    })
  })
})
