import { NativeModules, Platform } from 'react-native';

type WidgetStatus = {
  pinSupported: boolean;
  compactPinned: boolean;
  expandedPinned: boolean;
};

type WidgetControlModule = {
  getWidgetStatus?: () => Promise<WidgetStatus>;
  requestPinWidget?: (kind: 'compact' | 'expanded') => Promise<boolean>;
};

const widgetControl = (NativeModules.WidgetControl ?? null) as WidgetControlModule | null;

export async function getWidgetStatus(): Promise<WidgetStatus> {
  if (Platform.OS !== 'android' || !widgetControl?.getWidgetStatus) {
    return { pinSupported: false, compactPinned: false, expandedPinned: false };
  }
  return widgetControl.getWidgetStatus();
}

export async function requestPinWidget(kind: 'compact' | 'expanded'): Promise<boolean> {
  if (Platform.OS !== 'android' || !widgetControl?.requestPinWidget) {
    return false;
  }
  return widgetControl.requestPinWidget(kind);
}
