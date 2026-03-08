/**
 * Unit tests for mobile lib/feedback.ts
 * Mocks expo-haptics and expo-av to verify correct haptic/audio calls.
 */

// Mock expo-haptics with module factory (hoisted properly)
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
    Warning: 'warning',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}))

// Mock expo-av — access mocks via the imported module to avoid jest hoisting issues
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn().mockResolvedValue(undefined),
          unloadAsync: jest.fn().mockResolvedValue(undefined),
          setOnPlaybackStatusUpdate: jest.fn(),
        },
      }),
    },
  },
}))

import * as Haptics from 'expo-haptics'
import { Audio } from 'expo-av'
import { playSuccess, playError, playCelebration, playTap } from '../../lib/feedback'

beforeEach(() => {
  jest.clearAllMocks()
})

/** Helper: get the playAsync mock from the last createAsync call */
async function getPlayAsyncMock(): Promise<jest.Mock> {
  const result = await (Audio.Sound.createAsync as jest.Mock).mock.results[0]?.value
  return result?.sound?.playAsync
}

describe('playSuccess', () => {
  it('calls notificationAsync with Success type', async () => {
    await playSuccess()
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success')
  })

  it('calls Audio.Sound.createAsync to play a sound', async () => {
    await playSuccess()
    expect(Audio.Sound.createAsync).toHaveBeenCalled()
  })
})

describe('playError', () => {
  it('calls notificationAsync with Error type', async () => {
    await playError()
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error')
  })

  it('calls Audio.Sound.createAsync to play a sound', async () => {
    await playError()
    expect(Audio.Sound.createAsync).toHaveBeenCalled()
  })
})

describe('playCelebration', () => {
  it('calls impactAsync twice (Heavy then Medium)', async () => {
    await playCelebration()
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(2)
    expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, 'heavy')
    expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, 'medium')
  })

  it('calls Audio.Sound.createAsync to play celebration sound', async () => {
    await playCelebration()
    expect(Audio.Sound.createAsync).toHaveBeenCalled()
  })
})

describe('playTap', () => {
  it('calls impactAsync with Light style', async () => {
    await playTap()
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light')
  })

  it('calls impactAsync exactly once', async () => {
    await playTap()
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1)
  })

  it('does not play any sound', async () => {
    await playTap()
    expect(Audio.Sound.createAsync).not.toHaveBeenCalled()
  })
})
