// ─── Global Polyfills ───
// localStorage polyfill for web storage tests in node environment
if (typeof global.localStorage === 'undefined') {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

// ─── Mock: src/services/api (axios instance) ───
jest.mock('./src/services/api', () => {
  const mockApi = {
    get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
    post: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    put: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: mockApi,
    BASE_URL: 'https://api.freeapi.app',
  };
});

// ─── Mock: src/utils/storage (avoid localStorage issues in node/web test env) ───
const mockStore = {};
jest.mock('./src/utils/storage', () => ({
  storage: {
    getItem: jest.fn((key) => Promise.resolve(mockStore[key] || null)),
    setItem: jest.fn((key, val) => { mockStore[key] = val; return Promise.resolve(); }),
    deleteItem: jest.fn((key) => { delete mockStore[key]; return Promise.resolve(); }),
  },
}));

// ─── Global Jest Setup ───
// Mocks for native modules that don't exist in the web/node test environment.

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock('expo-asset', () => ({
  Asset: { fromModule: jest.fn(() => ({ downloadAsync: jest.fn(), localUri: 'uri' })) },
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiUrl: 'http://localhost:3000' } },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'TIME_INTERVAL' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Image: (props) => React.createElement(View, props) };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { LinearGradient: (props) => React.createElement(View, props, props.children) };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: false,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  wrap: (component) => component,
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy({}, {
    get: () => (props) => React.createElement(View, props),
  });
});

jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: () => [true, null],
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_600SemiBold: 'Inter_600SemiBold',
}));

jest.mock('@expo-google-fonts/manrope', () => ({
  useFonts: () => [true, null],
  Manrope_400Regular: 'Manrope_400Regular',
  Manrope_500Medium: 'Manrope_500Medium',
  Manrope_600SemiBold: 'Manrope_600SemiBold',
  Manrope_700Bold: 'Manrope_700Bold',
  Manrope_800ExtraBold: 'Manrope_800ExtraBold',
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { default: (props) => React.createElement(View, props) };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: '1' }),
  Link: ({ children }) => children,
  Stack: ({ children }) => children,
  Tabs: ({ children }) => children,
  usePathname: () => '/',
}));
