import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  requireNativeComponent,
} from 'react-native';

const NativeUnityAds = NativeModules.RNUnityAds;
const emitter = NativeUnityAds ? new NativeEventEmitter(NativeUnityAds) : null;
const listeners = new Map();

function ensureMethod(methodName) {
  if (!NativeUnityAds || typeof NativeUnityAds[methodName] !== 'function') {
    throw new Error(`RNUnityAds native method ${methodName} is not available.`);
  }
}

const UnityBannerView = Platform.OS === 'android'
  ? requireNativeComponent('RNUnityAdsBannerView')
  : () => null;

const UnityAds = {
  async initialize(gameId, testMode = false) {
    ensureMethod('initialize');
    return NativeUnityAds.initialize(gameId, Boolean(testMode));
  },

  async isInitialized() {
    if (!NativeUnityAds || typeof NativeUnityAds.isInitialized !== 'function') {
      return false;
    }

    return NativeUnityAds.isInitialized();
  },

  async load(placementId) {
    ensureMethod('load');
    return NativeUnityAds.load(placementId);
  },

  async show(placementId) {
    ensureMethod('show');
    return NativeUnityAds.show(placementId);
  },

  async hideBanner() {
    if (!NativeUnityAds || typeof NativeUnityAds.hideBanner !== 'function') {
      return false;
    }

    return NativeUnityAds.hideBanner();
  },

  addEventListener(type, handler) {
    if (!emitter) return;

    const key = `${type}:${String(handler)}`;
    const subscription = emitter.addListener(type, handler);
    listeners.set(key, subscription);
  },

  removeEventListener(type, handler) {
    const key = `${type}:${String(handler)}`;
    const subscription = listeners.get(key);
    if (!subscription) return;

    subscription.remove();
    listeners.delete(key);
  },

  removeAllListeners() {
    listeners.forEach((subscription) => {
      subscription.remove();
    });
    listeners.clear();
  },
};

export { UnityBannerView };
export default UnityAds;
