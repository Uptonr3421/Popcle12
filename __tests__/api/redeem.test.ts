/**
 * Tests for POST /api/loyalty/redeem
 * Uses mocked Supabase — no real DB required.
 *
 * The redeem route imports supabaseAdmin from @/lib/supabase.
 * Variables used inside jest.mock factories must be defined INSIDE
 * the factory — jest hoists mock calls above variable declarations.
 */

jest.mock('@/lib/supabase', () => {
  const mockSingle = jest.fn()
  const mockChain: any = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: mockSingle,
  }
  const mockFrom = jest.fn().mockReturnValue(mockChain)
  return {
    supabase: { from: mockFrom },
    supabaseAdmin: { from: mockFrom },
    __mockSingle: mockSingle,
    __mockChain: mockChain,
    __mockFrom: mockFrom,
  }
})

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/loyalty/redeem/route'

// Access the mock internals via require (safe after jest.mock hoisting)
const getM = () => require('@/lib/supabase') as {
  __mockSingle: jest.Mock
  __mockChain: any
  __mockFrom: jest.Mock
}

beforeEach(() => {
  jest.clearAllMocks()
  const m = getM()
  m.__mockChain.select.mockReturnThis()
  m.__mockChain.update.mockReturnThis()
  m.__mockChain.insert.mockReturnThis()
  m.__mockChain.eq.mockReturnThis()
  m.__mockFrom.mockReturnValue(m.__mockChain)
})

describe('POST /api/loyalty/redeem', () => {
  it('returns 400 if phone is missing', async () => {
    const req = new NextRequest('http://localhost/api/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Phone number is required')
  })

  it('returns 404 if user not found', async () => {
    const m = getM()
    m.__mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'not found' } })

    const req = new NextRequest('http://localhost/api/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ phone: '2165551234' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('User not found')
  })

  it('returns 400 if stamp_count < 10', async () => {
    const m = getM()
    m.__mockSingle.mockResolvedValueOnce({
      data: { id: 'user-123', name: 'Test', stamp_count: 7 },
      error: null,
    })

    const req = new NextRequest('http://localhost/api/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ phone: '2165551234' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    // Route returns "Need 3 more stamps to redeem"
    expect(json.error).toContain('more stamp')
  })

  it('returns 200 on successful redemption', async () => {
    const m = getM()
    // User lookup returns 10 stamps
    m.__mockSingle.mockResolvedValueOnce({
      data: { id: 'user-123', name: 'Test Customer', stamp_count: 10 },
      error: null,
    })
    // update().eq() returns no error
    m.__mockChain.update.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })
    // insert() returns no error
    m.__mockChain.insert.mockResolvedValueOnce({ error: null })

    const req = new NextRequest('http://localhost/api/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ phone: '2165551234' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
