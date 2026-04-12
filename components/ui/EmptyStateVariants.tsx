import React from 'react';
import EmptyState from './EmptyState';

type SharedProps = {
  moduleLabel: string;
  itemLabel: string;
  emoji?: string;
  tone?: 'neutral' | 'brand' | 'premium' | 'warning' | 'success';
  ctaLabel?: string;
  onCta?: () => void;
  compact?: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function EmptyStateFirstUse({
  moduleLabel,
  itemLabel,
  emoji = 'STAR',
  tone = 'brand',
  ctaLabel,
  onCta,
  compact = false,
  eyebrow,
  title,
  subtitle,
}: SharedProps) {
  return (
    <EmptyState
      compact={compact}
      emoji={emoji}
      tone={tone}
      eyebrow={eyebrow ?? `Primer uso - ${moduleLabel}`}
      title={title ?? `Crea tu primer ${itemLabel}`}
      subtitle={subtitle ?? `Tu ${moduleLabel.toLowerCase()} aparecerá aquí cuando registres el primer ${itemLabel}.`}
      ctaLabel={ctaLabel}
      onCta={onCta}
    />
  );
}

export function EmptyStateNoData({
  moduleLabel,
  itemLabel,
  emoji = 'DATA',
  tone = 'neutral',
  ctaLabel,
  onCta,
  compact = false,
  eyebrow,
  title,
  subtitle,
}: SharedProps) {
  return (
    <EmptyState
      compact={compact}
      emoji={emoji}
      tone={tone}
      eyebrow={eyebrow ?? `Sin historial - ${moduleLabel}`}
      title={title ?? `Tu historial de ${moduleLabel.toLowerCase()} aparecerá aquí`}
      subtitle={subtitle ?? `Registra tu primer ${itemLabel} y empieza a ver tu evolución sin listas vacías.`}
      ctaLabel={ctaLabel}
      onCta={onCta}
    />
  );
}

export function EmptyStateError({
  moduleLabel,
  itemLabel,
  emoji = 'NET',
  tone = 'warning',
  ctaLabel = 'Reintentar',
  onCta,
  compact = false,
  eyebrow,
  title,
  subtitle,
}: SharedProps) {
  return (
    <EmptyState
      compact={compact}
      emoji={emoji}
      tone={tone}
      eyebrow={eyebrow ?? `No pudimos cargar ${moduleLabel.toLowerCase()}`}
      title={title ?? `Tu ${itemLabel} no está disponible ahora`}
      subtitle={subtitle ?? 'Reintenta en unos segundos. Si el problema sigue, la app mantendrá el resto del módulo usable.'}
      ctaLabel={ctaLabel}
      onCta={onCta}
    />
  );
}
