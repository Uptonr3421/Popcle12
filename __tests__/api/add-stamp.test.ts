/**
 * Tests for POST /api/loyalty/add-stamp
 * Uses mocked Supabase — no real DB required.
 *
 * Variables used inside jest.mock factories must be defined INSIDE
 * the factory — jest hoists mock calls above variable declarations.
 */

jest.mock('@/lib/supabase', () => {
  const mockSingle = jest.fn()
  const mockChain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
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
import { POST } from '@/app/api/loyalty/add-stamp/route'

const getM = () => require('@/lib/supabase') as {
  __mockSingle: jest.Mock
  __mockChain: any
  __mockFrom: jest.Mock
}

beforeEach(() => {
  jest.clearAllMocks()
  const m = getM()
  m.__mockChain.select.mockReturnThis()
  m.__mockChain.insert.mockReturnThis()
  m.__mockChain.update.mockReturnThis()
  m.__mockChain.eq.mockReturnThis()
  m.__mockFrom.mockReturnValue(m.__mockChain)
})

describe('POST /api/loyalty/add-stamp', () => {
  it('returns 400 if required fields missing', async () => {
    const req = new NextRequest('http://localhost/api/loyalty/add-stamp', {
      method: 'POST',
      body: JSON.stringify({ customerPhone: '2165551234' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Missing required fields')
  })

  it('returns 404 if customer not found', async () => {
    const m = getM()
    m.__mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'not found' } })

    const req = new NextRequest('http://localhost/api/loyalty/add-stamp', {
      method: 'POST',
      body: JSON.stringify({ customerPhone: '2165551234', employeePhone: '2165559999' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Customer not found')
  })

  it('returns 403 if employee has wrong user_type', async () => {
    const m = getM()
    m.__mockSingle
      .mockResolvedValueOnce({
        data: { id: 'cust-1', name: 'Jane', stamp_count: 3, user_type: 'customer' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'emp-1', user_type: 'customer' },
        error: null,
      })

    const req = new NextRequest('http://localhost/api/loyalty/add-stamp', {
      method: 'POST',
      body: JSON.stringify({ customerPhone: '2165551234', employeePhone: '2165559999' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 200 with incremented stamp count on success', async () => {
    const m = getM()
    m.__mockSingle
      .mockResolvedValueOnce({
        data: { id: 'cust-1', name: 'Jane', stamp_count: 5, user_type: 'customer' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'emp-1', user_type: 'employee' },
        error: null,
      })
    m.__mockChain.update.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })
    m.__mockChain.insert.mockResolvedValueOnce({ error: null })

    const req = new NextRequest('http://localhost/api/loyalty/add-stamp', {
      method: 'POST',
      body: JSON.stringify({ customerPhone: '2165551234', employeePhone: '2165559999' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.newStampCount).toBe(6)
  })
})
