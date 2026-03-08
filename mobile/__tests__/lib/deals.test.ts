/**
 * Unit tests for mobile lib/deals.ts
 * Tests formatCountdown, getStaffInstruction, and getActiveDeals (mocked Supabase).
 */
jest.mock('../../lib/supabase', () => require('../../__mocks__/lib/supabase'))

import { formatCountdown, getStaffInstruction, getActiveDeals, ActiveDeal } from '../../lib/deals'
import { supabase } from '../../lib/supabase'

describe('formatCountdown', () => {
  it('formats exactly 1 hour', () => {
    expect(formatCountdown(3600)).toBe('1h 00m 00s')
  })

  it('formats 2h 1m 1s', () => {
    expect(formatCountdown(7261)).toBe('2h 01m 01s')
  })

  it('formats 125 seconds as 2m 05s', () => {
    expect(formatCountdown(125)).toBe('2m 05s')
  })

  it('formats 59 seconds with no minutes or hours', () => {
    expect(formatCountdown(59)).toBe('59s')
  })

  it('formats 1 second', () => {
    expect(formatCountdown(1)).toBe('1s')
  })

  it('returns EXPIRED for 0', () => {
    expect(formatCountdown(0)).toBe('EXPIRED')
  })

  it('returns EXPIRED for negative values', () => {
    expect(formatCountdown(-100)).toBe('EXPIRED')
  })

  it('formats 60 seconds as 1m 00s', () => {
    expect(formatCountdown(60)).toBe('1m 00s')
  })

  it('formats large value (24h)', () => {
    expect(formatCountdown(86400)).toBe('24h 00m 00s')
  })
})

describe('getStaffInstruction', () => {
  const baseDeal: ActiveDeal = {
    id: 'deal-1',
    title: 'Summer Special',
    description: 'Cool off with savings',
    discountLabel: '20% OFF',
    expiresAt: '2026-12-31T23:59:59Z',
    secondsLeft: 3600,
  }

  it('returns instruction with discount_percentage label', () => {
    expect(getStaffInstruction(baseDeal)).toBe('Apply 20% OFF to this order')
  })

  it('returns instruction with free_item label', () => {
    const deal: ActiveDeal = { ...baseDeal, discountLabel: 'FREE ITEM' }
    expect(getStaffInstruction(deal)).toBe('Apply FREE ITEM to this order')
  })

  it('returns instruction with custom discount_label', () => {
    const deal: ActiveDeal = { ...baseDeal, discountLabel: 'BOGO Half Off' }
    expect(getStaffInstruction(deal)).toBe('Apply BOGO Half Off to this order')
  })

  it('returns instruction with Special Deal fallback', () => {
    const deal: ActiveDeal = { ...baseDeal, discountLabel: 'Special Deal' }
    expect(getStaffInstruction(deal)).toBe('Apply Special Deal to this order')
  })
})

describe('getActiveDeals', () => {
  // Build a mock chain that ends with the data we want
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    gt: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'deal-1',
          title: 'Half Off Sundaes',
          description: 'Enjoy 50% off',
          discount_percentage: 50,
          free_item: null,
          discount_label: null,
          starts_at: '2026-01-01T00:00:00Z',
          expires_at: '2099-12-31T23:59:59Z',
        },
        {
          id: 'deal-2',
          title: 'Free Topping',
          description: '',
          discount_percentage: null,
          free_item: true,
          discount_label: null,
          starts_at: '2026-01-01T00:00:00Z',
          expires_at: '2099-12-31T23:59:59Z',
        },
        {
          id: 'deal-3',
          title: 'Custom Label Deal',
          description: 'Something special',
          discount_percentage: null,
          free_item: null,
          discount_label: 'BOGO',
          starts_at: '2026-01-01T00:00:00Z',
          expires_at: '2099-12-31T23:59:59Z',
        },
      ],
      error: null,
    }),
  }

  beforeEach(() => {
    ;(supabase.from as jest.Mock).mockReturnValue(mockChain)
  })

  it('fetches and maps active deals correctly', async () => {
    const deals = await getActiveDeals()
    expect(deals).toHaveLength(3)
    expect(supabase.from).toHaveBeenCalledWith('offers')
  })

  it('derives discountLabel from discount_percentage when no label', async () => {
    const deals = await getActiveDeals()
    expect(deals[0].discountLabel).toBe('50% OFF')
  })

  it('derives discountLabel as FREE ITEM when free_item is true', async () => {
    const deals = await getActiveDeals()
    expect(deals[1].discountLabel).toBe('FREE ITEM')
  })

  it('uses discount_label when provided', async () => {
    const deals = await getActiveDeals()
    expect(deals[2].discountLabel).toBe('BOGO')
  })

  it('returns empty array on Supabase error', async () => {
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gt: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
    })
    const deals = await getActiveDeals()
    expect(deals).toEqual([])
  })

  it('calculates secondsLeft as non-negative', async () => {
    const deals = await getActiveDeals()
    deals.forEach((d) => {
      expect(d.secondsLeft).toBeGreaterThanOrEqual(0)
    })
  })
})
