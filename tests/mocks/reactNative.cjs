module.exports = {
  AppState: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(() => Promise.resolve()),
  },
  NativeModules: {},
  Platform: {
    OS: 'android',
    select: (options) => options.android ?? options.default ?? null,
  },
  PixelRatio: {
    getPixelSizeForLayoutSize: (value) => value,
  },
  Appearance: {
    getColorScheme: () => 'dark',
  },
  Dimensions: {
    get: () => ({ width: 390, height: 844 }),
  },
};
