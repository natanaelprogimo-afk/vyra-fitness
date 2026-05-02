declare module '@expo-google-fonts/*' {
  const value: Record<string, unknown>;
  export default value;
}

declare module 'react-native-view-shot' {
  import type { RefObject } from 'react';

  export type CaptureOptions = {
    format?: 'jpg' | 'png' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    fileName?: string;
    width?: number;
    height?: number;
    snapshotContentContainer?: boolean;
  };

  export function captureRef(
    view: number | RefObject<unknown> | unknown,
    options?: CaptureOptions,
  ): Promise<string>;
}
