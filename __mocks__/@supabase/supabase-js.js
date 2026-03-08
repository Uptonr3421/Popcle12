const mockSingle = jest.fn()
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockEq = jest.fn()
const mockNot = jest.fn()
const mockGt = jest.fn()
const mockOrder = jest.fn()

const chainable = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  not: mockNot,
  gt: mockGt,
  order: mockOrder,
  single: mockSingle,
}

// All methods return themselves for chaining
Object.values(chainable).forEach(fn => {
  fn.mockReturnValue(chainable)
})

const mockFrom = jest.fn().mockReturnValue(chainable)

const mockSupabase = {
  from: mockFrom,
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    signInWithOtp: jest.fn(),
    verifyOtp: jest.fn(),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    admin: {
      listUsers: jest.fn().mockResolvedValue({ data: { users: [] } }),
    },
  },
}

const createClient = jest.fn().mockReturnValue(mockSupabase)

module.exports = { createClient, mockSupabase, mockFrom, mockSingle, mockSelect, mockEq }
