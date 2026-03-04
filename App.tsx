// This file is deprecated - expo-router handles routing via app/ directory
// DO NOT use this file - managed by Expo Router

import { registerRootComponent } from 'expo';
import { Stack } from 'expo-router';

export default function App() {
  return <Stack />;
}

registerRootComponent(App);
