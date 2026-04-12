import { create } from 'zustand';

type QaBridgeDebugSource = 'session-bridge' | 'root-auth' | 'welcome' | null;

interface QaBridgeDebugState {
  source: QaBridgeDebugSource;
  stage: string | null;
  detail: string | null;
  updatedAt: string | null;
  setSnapshot: (snapshot: {
    source: Exclude<QaBridgeDebugSource, null>;
    stage: string;
    detail: string;
  }) => void;
  clear: () => void;
}

const initialState = {
  source: null,
  stage: null,
  detail: null,
  updatedAt: null,
};

export const useQaBridgeDebugStore = create<QaBridgeDebugState>((set) => ({
  ...initialState,
  setSnapshot: ({ source, stage, detail }) =>
    set({
      source,
      stage,
      detail,
      updatedAt: new Date().toISOString(),
    }),
  clear: () => set(initialState),
}));
