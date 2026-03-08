module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Stub Expo's import.meta winter runtime — it uses import.meta which is
    // not supported in Jest's CommonJS environment (Expo 55 + Jest 30 incompatibility)
    '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter-stub.js',
    '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expo-winter-stub.js',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.ts',
    'hooks/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}
