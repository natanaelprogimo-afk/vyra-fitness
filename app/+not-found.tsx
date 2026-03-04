// ============================================================
// VYRA FITNESS — Not Found (404)
// ============================================================

import { useEffect } from 'react';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import EmptyState from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <SafeScreen>
      <EmptyState
        emoji="🗺️"
        title="Esta pantalla no existe"
        subtitle="Parece que te perdiste. No pasa nada — volvamos al inicio."
        ctaLabel="Volver al inicio"
        onCta={() => router.replace('/(tabs)/' as any)}
      />
    </SafeScreen>
  );
}