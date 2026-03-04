// ============================================================
// VYRA FITNESS — UI Components Barrel Export
// Importar desde '@/components/ui' en vez de rutas individuales
// ============================================================

// Default exports
export { default as SafeScreen }      from './SafeScreen';
export { default as Button }          from './Button';
export { default as Card }            from './Card';
export { default as Input }           from './Input';
export { default as Badge }           from './Badge';
export { default as Skeleton }        from './Skeleton';
export { CardSkeleton, StatSkeleton, ListSkeleton, DailyScoreSkeleton } from './Skeleton';
export { default as AnimatedNumber }  from './AnimatedNumber';
export { BigNumber }                  from './AnimatedNumber';
export { default as ProgressBar }     from './ProgressBar';
export { MacroBar }                   from './ProgressBar';
export { default as Modal }           from './Modal';
export { default as BottomSheet }     from './BottomSheet';
export { default as Toast }           from './Toast';
export { default as EmptyState }      from './EmptyState';
export { default as PremiumLock }     from './PremiumLock';
export { usePremiumGate }             from './PremiumLock';
export { default as CoinBadge }       from './CoinBadge';
export { InlineCoin }                 from './CoinBadge';
export { default as GradientText }    from './GradientText';
export { default as AchievementModal }from './AchievementModal';

// Re-export named for people importing with named syntax
export { default as Card_default } from './Card';
export { default as CoinBadge_default } from './CoinBadge';
export { default as Toast_default } from './Toast';
export { default as AchievementModal_default } from './AchievementModal';

// Charts
export { default as ProgressCircle }  from '../charts/ProgressCircle';
export { SimpleRing }                 from '../charts/ProgressCircle';

// Layout
export { default as Header }          from '../layout/Header';
export { default as OfflineNotice }   from '../layout/OfflineNotice';
export { default as TabBar }          from '../layout/TabBar';
