// Lightweight JS shim for @react-native-community/netinfo to allow running
// the JS app in Expo dev-client / Expo Go without requiring native rebuild.

const defaultState = {
  type: 'unknown',
  isConnected: true,
  isInternetReachable: true,
  details: null,
};

function addEventListener(handler) {
  // Immediately invoke with a connected state and return an unsubscribe fn
  try {
    handler && handler(defaultState);
  } catch (e) {
    // swallow
  }
  return () => {};
}

async function fetch() {
  return Promise.resolve(defaultState);
}

function useNetInfo() {
  // Minimal hook-compatible shape — not a real hook implementation.
  return defaultState;
}

module.exports = {
  addEventListener,
  fetch,
  useNetInfo,
  addListener: addEventListener,
  removeEventListener: () => {},
  isConnected: {
    addEventListener: addEventListener,
  },
  default: {
    addEventListener,
    fetch,
    useNetInfo,
  },
};
