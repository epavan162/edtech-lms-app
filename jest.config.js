module.exports = {
  preset: 'jest-expo/web',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|@sentry/react-native|native-base|react-native-svg|nativewind|@legendapp/list|expo-router|expo-constants|expo-modules-core|expo-font|expo-asset|expo-linking|expo-image|expo-secure-store|expo-local-authentication|expo-sharing|expo-file-system|expo-notifications|expo-splash-screen|expo-status-bar)'
  ],
  modulePathIgnorePatterns: ['<rootDir>/.expo/', '<rootDir>/index.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__tests__/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__tests__/mocks/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/types/**',
    '!src/services/api.ts',
    '!src/utils/storage.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
};
