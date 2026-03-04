import { registerRootComponent } from 'expo';
import { Stack } from 'expo-router';
import React from 'react';

export function App() {
  return React.createElement(Stack);
}

registerRootComponent(App);
