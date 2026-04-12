import { Colors } from '@/constants/colors';

export type GamificationRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type GamificationBadgeFamily =
  | 'habits'
  | 'streaks'
  | 'score'
  | 'progress'
  | 'social'
  | 'special';

export type CoinSourceId =
  | 'water_goal'
  | 'steps_goal'
  | 'sleep_goal'
  | 'nutrition_log'
  | 'fasting_14h'
  | 'close_day'
  | 'daily_mission'
  | 'weekly_mission'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'rewarded_ad'
  | 'daily_score_80'
  | 'daily_score_100'
  | 'referral';

type CoinSourceKind = 'activity' | 'mission' | 'milestone' | 'ad' | 'score' | 'social';

export interface CoinSourceDef {
  id: CoinSourceId;
  label: string;
  coins: number;
  limit: number;
  period: 'day' | 'week' | 'milestone' | 'unlimited';
  kind: CoinSourceKind;
  premiumEligible: boolean;
  rankBonusEligible: boolean;
  freeOnly?: boolean;
}

export interface RankDef {
  id: string;
  name: string;
  subtitle: string;
  accent: string;
  glyph: string;
  minXp: number;
  maxXp: number | null;
  minLevel: number;
  maxLevel: number | null;
  perk: string;
  dailyCoinBonusPct: number;
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  accent: string;
  icon: string;
  rewardCoins: number;
  rewardXp: number;
  target: number;
  unit: string;
  sourceId?: CoinSourceId;
}

export interface ShopItemDef {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  price: number;
  accent: string;
  icon: string;
  kind: 'theme' | 'boost' | 'cosmetic';
  lockedLevel?: number;
  lockedRankId?: string;
  featured?: boolean;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  unlockRule: string;
  family: GamificationBadgeFamily;
  rarity: GamificationRarity;
  emoji: string;
  coins: number;
  xp: number;
}

export const DAILY_FREE_COINS_CAP = 25;
export const DAILY_PREMIUM_COINS_CAP = 35;
export const PREMIUM_MULTIPLIER = 1.5;
export const FREE_WEEKLY_DOUBLE_COINS_USES = 1;
export const REWARDED_AD_COINS = 2;
export const REWARDED_AD_DAILY_LIMIT = 5;

export const COIN_SOURCES: Record<CoinSourceId, CoinSourceDef> = {
  water_goal: {
    id: 'water_goal',
    label: 'Meta de agua',
    coins: 3,
    limit: 1,
    period: 'day',
    kind: 'activity',
    premiumEligible: true,
    rankBonusEligible: true,
  },
  steps_goal: {
    id: 'steps_goal',
    label: 'Meta de pasos',
    coins: 3,
    limit: 1,
    period: 'day',
    kind: 'activity',
    premiumEligible: true,
    rankBonusEligible: true,
  },
  sleep_goal: {
    id: 'sleep_goal',
    label: 'Sueño 7h+',
    coins: 2,
    limit: 1,
    period: 'day',
    kind: 'activity',
    premiumEligible: true,
    rankBonusEligible: true,
  },
  nutrition_log: {
    id: 'nutrition_log',
    label: 'Registrar comida',
    coins: 2,
    limit: 3,
    period: 'day',
    kind: 'activity',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  fasting_14h: {
    id: 'fasting_14h',
    label: 'Ayuno 14h',
    coins: 3,
    limit: 1,
    period: 'day',
    kind: 'activity',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  close_day: {
    id: 'close_day',
    label: 'Cerrar el día',
    coins: 2,
    limit: 1,
    period: 'day',
    kind: 'activity',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  daily_mission: {
    id: 'daily_mission',
    label: 'Misión diaria',
    coins: 5,
    limit: 3,
    period: 'day',
    kind: 'mission',
    premiumEligible: true,
    rankBonusEligible: true,
  },
  weekly_mission: {
    id: 'weekly_mission',
    label: 'Misión semanal',
    coins: 15,
    limit: 2,
    period: 'week',
    kind: 'mission',
    premiumEligible: true,
    rankBonusEligible: true,
  },
  streak_3: {
    id: 'streak_3',
    label: 'Racha 3 días',
    coins: 5,
    limit: 1,
    period: 'milestone',
    kind: 'milestone',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  streak_7: {
    id: 'streak_7',
    label: 'Racha 7 días',
    coins: 15,
    limit: 1,
    period: 'milestone',
    kind: 'milestone',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  streak_30: {
    id: 'streak_30',
    label: 'Racha 30 días',
    coins: 50,
    limit: 1,
    period: 'milestone',
    kind: 'milestone',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  rewarded_ad: {
    id: 'rewarded_ad',
    label: 'Ver anuncio',
    coins: REWARDED_AD_COINS,
    limit: REWARDED_AD_DAILY_LIMIT,
    period: 'day',
    kind: 'ad',
    premiumEligible: false,
    rankBonusEligible: false,
    freeOnly: true,
  },
  daily_score_80: {
    id: 'daily_score_80',
    label: 'Score 80+',
    coins: 5,
    limit: 1,
    period: 'day',
    kind: 'score',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  daily_score_100: {
    id: 'daily_score_100',
    label: 'Score 100',
    coins: 10,
    limit: 1,
    period: 'day',
    kind: 'score',
    premiumEligible: false,
    rankBonusEligible: false,
  },
  referral: {
    id: 'referral',
    label: 'Referir amigo',
    coins: 30,
    limit: 999,
    period: 'unlimited',
    kind: 'social',
    premiumEligible: false,
    rankBonusEligible: false,
  },
};

export const VYRA_RANKS: RankDef[] = [
  {
    id: 'semilla',
    name: 'Semilla',
    subtitle: 'Acceso base. Tema Midnight y misiones diarias.',
    accent: Colors.water,
    glyph: '🌱',
    minXp: 0,
    maxXp: 499,
    minLevel: 1,
    maxLevel: 2,
    perk: 'Tema Midnight y loop base.',
    dailyCoinBonusPct: 0,
  },
  {
    id: 'constante',
    name: 'Constante',
    subtitle: 'Tu sistema ya se nota estable.',
    accent: Colors.water,
    glyph: '💧',
    minXp: 500,
    maxXp: 1499,
    minLevel: 3,
    maxLevel: 5,
    perk: '+1 tema desbloqueado y misiones semanales.',
    dailyCoinBonusPct: 0,
  },
  {
    id: 'activo',
    name: 'Activo',
    subtitle: 'Movés el día y ya se ve avance.',
    accent: Colors.steps,
    glyph: '⚡',
    minXp: 1500,
    maxXp: 3999,
    minLevel: 6,
    maxLevel: 9,
    perk: 'Coins diarios +10% y desafíos de 7 días.',
    dailyCoinBonusPct: 10,
  },
  {
    id: 'en_racha',
    name: 'En Racha',
    subtitle: 'La consistencia ya empuja sola.',
    accent: Colors.fasting,
    glyph: '🔥',
    minXp: 4000,
    maxXp: 8999,
    minLevel: 10,
    maxLevel: 14,
    perk: 'Tema Fire y misiones de evento.',
    dailyCoinBonusPct: 10,
  },
  {
    id: 'enfocado',
    name: 'Enfocado',
    subtitle: 'Menos ruido. Más intención.',
    accent: Colors.mental,
    glyph: '🧠',
    minXp: 9000,
    maxXp: 17999,
    minLevel: 15,
    maxLevel: 20,
    perk: 'Coins diarios +20% y temas exclusivos.',
    dailyCoinBonusPct: 20,
  },
  {
    id: 'elite',
    name: 'Élite',
    subtitle: 'Tu perfil ya tiene estatus propio.',
    accent: Colors.coins,
    glyph: '🏆',
    minXp: 18000,
    maxXp: 34999,
    minLevel: 21,
    maxLevel: 28,
    perk: 'Badge especial visible e insignias épicas.',
    dailyCoinBonusPct: 20,
  },
  {
    id: 'leyenda',
    name: 'Leyenda',
    subtitle: 'Nivel alto, identidad visible.',
    accent: Colors.premium,
    glyph: '💎',
    minXp: 35000,
    maxXp: 69999,
    minLevel: 29,
    maxLevel: 38,
    perk: 'Tema Gold, coins diarios +30% y badge animado.',
    dailyCoinBonusPct: 30,
  },
  {
    id: 'vyra',
    name: 'VYRA',
    subtitle: 'Rango máximo. Todo desbloqueado.',
    accent: Colors.brandLight,
    glyph: '✨',
    minXp: 70000,
    maxXp: null,
    minLevel: 39,
    maxLevel: null,
    perk: 'Acceso total y badge animado exclusivo.',
    dailyCoinBonusPct: 30,
  },
];

export const DAILY_MISSION_LIBRARY: MissionDef[] = [
  {
    id: 'daily_water_goal',
    title: 'Hidratación perfecta',
    description: 'Alcanzá tu meta de agua hoy.',
    accent: Colors.water,
    icon: 'water-outline',
    rewardCoins: 5,
    rewardXp: 30,
    target: 1,
    unit: 'meta',
    sourceId: 'daily_mission',
  },
  {
    id: 'daily_steps_8k',
    title: 'Día activo',
    description: 'Superá los 8.000 pasos hoy.',
    accent: Colors.steps,
    icon: 'footsteps-outline',
    rewardCoins: 5,
    rewardXp: 30,
    target: 8000,
    unit: 'pasos',
    sourceId: 'daily_mission',
  },
  {
    id: 'daily_sleep_7h',
    title: 'Sueño reparador',
    description: 'Registrá 7h+ de sueño.',
    accent: Colors.sleep,
    icon: 'moon-outline',
    rewardCoins: 5,
    rewardXp: 30,
    target: 7,
    unit: 'h',
    sourceId: 'daily_mission',
  },
  {
    id: 'daily_score_80',
    title: 'Score ≥ 80',
    description: 'Cerrá el día con score alto.',
    accent: Colors.brand,
    icon: 'sparkles-outline',
    rewardCoins: 8,
    rewardXp: 40,
    target: 80,
    unit: 'score',
    sourceId: 'daily_mission',
  },
  {
    id: 'daily_keep_streak',
    title: 'Mantener racha',
    description: 'No rompas tu racha hoy.',
    accent: Colors.fasting,
    icon: 'flame-outline',
    rewardCoins: 3,
    rewardXp: 20,
    target: 1,
    unit: 'día',
    sourceId: 'daily_mission',
  },
];

export const WEEKLY_MISSION_LIBRARY: MissionDef[] = [
  {
    id: 'weekly_steps_5_days',
    title: 'Semana activa',
    description: 'Meta de pasos 5 días seguidos.',
    accent: Colors.steps,
    icon: 'walk-outline',
    rewardCoins: 20,
    rewardXp: 120,
    target: 5,
    unit: 'días',
    sourceId: 'weekly_mission',
  },
  {
    id: 'weekly_water_6_of_7',
    title: 'Hidratación consistente',
    description: 'Meta de agua 6 de 7 días.',
    accent: Colors.water,
    icon: 'water-outline',
    rewardCoins: 15,
    rewardXp: 100,
    target: 6,
    unit: 'días',
    sourceId: 'weekly_mission',
  },
  {
    id: 'weekly_score_80',
    title: 'Score 80+',
    description: '4 días con score alto esta semana.',
    accent: Colors.brand,
    icon: 'stats-chart-outline',
    rewardCoins: 25,
    rewardXp: 140,
    target: 4,
    unit: 'días',
    sourceId: 'weekly_mission',
  },
  {
    id: 'weekly_no_break',
    title: 'Sin romper racha',
    description: '7 días seguidos con al menos una acción.',
    accent: Colors.fasting,
    icon: 'flame-outline',
    rewardCoins: 30,
    rewardXp: 160,
    target: 7,
    unit: 'días',
    sourceId: 'weekly_mission',
  },
];

export const EVENT_LIBRARY: MissionDef[] = [
  {
    id: 'event_fitness_week',
    title: 'Semana Fitness',
    description: '7 días con recompensas dobles.',
    accent: Colors.fasting,
    icon: 'flash-outline',
    rewardCoins: 0,
    rewardXp: 0,
    target: 7,
    unit: 'días',
  },
  {
    id: 'event_hydration_14',
    title: 'Reto de hidratación',
    description: 'Meta de agua 14 días seguidos.',
    accent: Colors.water,
    icon: 'water-outline',
    rewardCoins: 80,
    rewardXp: 220,
    target: 14,
    unit: 'días',
  },
  {
    id: 'event_month_elite',
    title: 'Mes Élite',
    description: 'Score 80+ durante 30 días.',
    accent: Colors.coins,
    icon: 'trophy-outline',
    rewardCoins: 200,
    rewardXp: 400,
    target: 30,
    unit: 'días',
  },
  {
    id: 'event_vyra_season',
    title: 'Temporada VYRA',
    description: 'Completá 20 misiones en el mes.',
    accent: Colors.brand,
    icon: 'sparkles-outline',
    rewardCoins: 0,
    rewardXp: 260,
    target: 20,
    unit: 'misiones',
  },
];

export const SHOP_CATALOG: ShopItemDef[] = [
  {
    id: 'theme_midnight_pro',
    name: 'Midnight+',
    title: 'Midnight Pro',
    subtitle: 'Tema · Básico',
    price: 10,
    accent: Colors.brand,
    icon: 'moon-outline',
    kind: 'theme',
    featured: true,
  },
  {
    id: 'theme_fire',
    name: 'Fire',
    title: 'Fire',
    subtitle: 'Tema · Estándar',
    price: 25,
    accent: Colors.fasting,
    icon: 'flame-outline',
    kind: 'theme',
  },
  {
    id: 'theme_nature',
    name: 'Nature',
    title: 'Nature',
    subtitle: 'Tema · Estándar',
    price: 25,
    accent: Colors.recovery,
    icon: 'leaf-outline',
    kind: 'theme',
  },
  {
    id: 'theme_ocean',
    name: 'Ocean',
    title: 'Ocean',
    subtitle: 'Tema · Estándar',
    price: 25,
    accent: Colors.water,
    icon: 'water-outline',
    kind: 'theme',
  },
  {
    id: 'theme_neon',
    name: 'Neon',
    title: 'Neon',
    subtitle: 'Tema · Premium',
    price: 40,
    accent: Colors.brandLight,
    icon: 'flash-outline',
    kind: 'theme',
  },
  {
    id: 'theme_gold',
    name: 'Gold',
    title: 'Gold',
    subtitle: 'Tema · Exclusivo',
    price: 60,
    accent: Colors.coins,
    icon: 'diamond-outline',
    kind: 'theme',
    lockedLevel: 29,
    lockedRankId: 'leyenda',
  },
  {
    id: 'boost_double_coins',
    name: 'x2 Coins (24h)',
    title: 'x2 Coins (24h)',
    subtitle: 'Boost · 1 día',
    price: 25,
    accent: Colors.coins,
    icon: 'flash-outline',
    kind: 'boost',
    featured: true,
  },
  {
    id: 'boost_streak_revive',
    name: 'Recuperar racha',
    title: 'Recuperar racha',
    subtitle: 'Boost · 1 uso',
    price: 20,
    accent: Colors.steps,
    icon: 'shield-checkmark-outline',
    kind: 'boost',
  },
  {
    id: 'boost_progress_bonus',
    name: 'Bonus progreso',
    title: '+50 XP',
    subtitle: 'Boost · +50 XP',
    price: 15,
    accent: Colors.brand,
    icon: 'trending-up-outline',
    kind: 'boost',
  },
  {
    id: 'cosmetic_accent',
    name: 'Color acento',
    title: 'Color acento',
    subtitle: 'Personalización',
    price: 20,
    accent: Colors.premium,
    icon: 'color-palette-outline',
    kind: 'cosmetic',
  },
  {
    id: 'cosmetic_avatar_frame',
    name: 'Marco avatar',
    title: 'Marco avatar',
    subtitle: 'Cosmético',
    price: 30,
    accent: Colors.female,
    icon: 'albums-outline',
    kind: 'cosmetic',
  },
  {
    id: 'cosmetic_animated_badge',
    name: 'Badge animado',
    title: 'Badge animado',
    subtitle: 'Cosmético · Lvl 21+',
    price: 50,
    accent: Colors.premium,
    icon: 'sparkles-outline',
    kind: 'cosmetic',
    lockedLevel: 21,
  },
];

export const BADGE_RARITY_LABELS: Record<GamificationRarity, string> = {
  common: 'Común',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Especial',
};

export const BADGE_FAMILY_LABELS: Record<GamificationBadgeFamily, string> = {
  habits: 'Hábitos',
  streaks: 'Rachas',
  score: 'Score',
  progress: 'Progreso',
  social: 'Social',
  special: 'Módulos especiales',
};

export const BADGE_FAMILY_COLORS: Record<GamificationBadgeFamily, string> = {
  habits: Colors.water,
  streaks: Colors.fasting,
  score: Colors.brand,
  progress: Colors.coins,
  social: Colors.premium,
  special: Colors.mental,
};

export const BADGE_CATALOG: BadgeDef[] = [
  { id: 'habit_first_drop', name: 'Primera gota', description: 'Primer día con meta de agua.', unlockRule: 'Completar la meta de agua por primera vez.', family: 'habits', rarity: 'common', emoji: '💧', coins: 5, xp: 20 },
  { id: 'habit_water_7', name: 'Constante', description: 'Agua 7 días seguidos.', unlockRule: 'Meta de agua 7 días seguidos.', family: 'habits', rarity: 'rare', emoji: '🌊', coins: 10, xp: 35 },
  { id: 'habit_water_30', name: 'Imparable', description: 'Agua 30 días seguidos.', unlockRule: 'Meta de agua 30 días seguidos.', family: 'habits', rarity: 'epic', emoji: '🌊', coins: 20, xp: 60 },
  { id: 'habit_steps_first_10k', name: 'Caminante', description: '10k pasos por primera vez.', unlockRule: 'Llegar a 10.000 pasos una vez.', family: 'habits', rarity: 'common', emoji: '👟', coins: 5, xp: 20 },
  { id: 'habit_steps_30x10k', name: 'Maratonista lento', description: '10k pasos durante 30 días.', unlockRule: '10.000 pasos 30 días.', family: 'habits', rarity: 'epic', emoji: '🏃', coins: 20, xp: 60 },
  { id: 'habit_sleep_7_days', name: 'Dormilón sano', description: '7h de sueño durante 7 días.', unlockRule: 'Registrar 7h+ de sueño 7 días.', family: 'habits', rarity: 'rare', emoji: '🌙', coins: 10, xp: 35 },
  { id: 'habit_sleep_30_days', name: 'Ciclo completo', description: '30 días con sueño registrado.', unlockRule: 'Registrar sueño 30 días.', family: 'habits', rarity: 'epic', emoji: '🛌', coins: 20, xp: 60 },

  { id: 'streak_3_days', name: 'Arranqué', description: 'Primera racha de 3 días.', unlockRule: 'Sostener 3 días seguidos.', family: 'streaks', rarity: 'common', emoji: '🔥', coins: 5, xp: 20 },
  { id: 'streak_7_days', name: 'Una semana', description: '7 días seguidos.', unlockRule: 'Sostener 7 días seguidos.', family: 'streaks', rarity: 'rare', emoji: '🔥', coins: 10, xp: 35 },
  { id: 'streak_14_days', name: 'Dos semanas', description: '14 días seguidos.', unlockRule: 'Sostener 14 días seguidos.', family: 'streaks', rarity: 'rare', emoji: '⚡', coins: 12, xp: 40 },
  { id: 'streak_30_days', name: 'Un mes', description: '30 días seguidos.', unlockRule: 'Sostener 30 días seguidos.', family: 'streaks', rarity: 'epic', emoji: '🏅', coins: 20, xp: 60 },
  { id: 'streak_60_days', name: 'Dos meses', description: '60 días seguidos.', unlockRule: 'Sostener 60 días seguidos.', family: 'streaks', rarity: 'epic', emoji: '🏆', coins: 25, xp: 70 },
  { id: 'streak_100_days', name: 'Centenario', description: '100 días seguidos.', unlockRule: 'Sostener 100 días seguidos.', family: 'streaks', rarity: 'legendary', emoji: '💎', coins: 30, xp: 90 },
  { id: 'streak_phoenix', name: 'Fénix', description: 'Recuperaste una racha con boost.', unlockRule: 'Usar Recuperar racha y salvar el loop.', family: 'streaks', rarity: 'rare', emoji: '🛡️', coins: 12, xp: 40 },

  { id: 'score_week_perfect', name: 'Primera semana perfecta', description: 'Score 80+ durante 7 días.', unlockRule: '7 días con score 80+.', family: 'score', rarity: 'rare', emoji: '📈', coins: 10, xp: 35 },
  { id: 'score_month_clean', name: 'Mes impecable', description: 'Score 80+ durante 30 días.', unlockRule: '30 días con score 80+.', family: 'score', rarity: 'epic', emoji: '📊', coins: 20, xp: 60 },
  { id: 'score_100_first', name: 'Perfección', description: 'Score 100 por primera vez.', unlockRule: 'Cerrar un día con score 100.', family: 'score', rarity: 'rare', emoji: '✨', coins: 12, xp: 40 },
  { id: 'score_100_triple', name: 'Triple perfecto', description: '3 días de score 100.', unlockRule: '3 días con score 100.', family: 'score', rarity: 'epic', emoji: '✨', coins: 20, xp: 60 },
  { id: 'score_recovery_elite', name: 'Recovery élite', description: 'Recovery 90+ durante 7 días.', unlockRule: 'Recovery 90+ por 7 días.', family: 'score', rarity: 'epic', emoji: '🧠', coins: 20, xp: 60 },
  { id: 'score_balance_total', name: 'Equilibrio total', description: 'Las 3 métricas al 100%.', unlockRule: 'Agua, pasos y sueño al 100% el mismo día.', family: 'score', rarity: 'rare', emoji: '⚖️', coins: 12, xp: 40 },
  { id: 'score_no_fail_month', name: 'Sin fallas', description: 'Mes sin score bajo 60.', unlockRule: '30 días sin bajar de score 60.', family: 'score', rarity: 'legendary', emoji: '🌟', coins: 30, xp: 90 },

  { id: 'progress_level_2', name: 'Primer nivel', description: 'Subiste a nivel 2.', unlockRule: 'Llegar al nivel 2.', family: 'progress', rarity: 'common', emoji: '⬆️', coins: 5, xp: 20 },
  { id: 'progress_level_10', name: 'Nivel 10', description: 'Milestone de progreso.', unlockRule: 'Llegar al nivel 10.', family: 'progress', rarity: 'rare', emoji: '🏁', coins: 10, xp: 35 },
  { id: 'progress_level_20', name: 'Nivel 20', description: 'Rango Élite alcanzado.', unlockRule: 'Llegar al nivel 20.', family: 'progress', rarity: 'epic', emoji: '🏆', coins: 20, xp: 60 },
  { id: 'progress_collect_10', name: 'Coleccionista', description: '10 insignias desbloqueadas.', unlockRule: 'Desbloquear 10 insignias.', family: 'progress', rarity: 'rare', emoji: '🎒', coins: 10, xp: 35 },
  { id: 'progress_collect_25', name: 'Museísta', description: '25 insignias desbloqueadas.', unlockRule: 'Desbloquear 25 insignias.', family: 'progress', rarity: 'epic', emoji: '🖼️', coins: 20, xp: 60 },
  { id: 'progress_collect_50', name: 'Completista', description: '50 insignias desbloqueadas.', unlockRule: 'Desbloquear 50 insignias.', family: 'progress', rarity: 'legendary', emoji: '🧩', coins: 30, xp: 90 },
  { id: 'progress_day_one', name: 'VYRA original', description: 'Usuario desde el día 1.', unlockRule: 'Ser parte del primer día del producto.', family: 'progress', rarity: 'legendary', emoji: '🚀', coins: 30, xp: 90 },

  { id: 'social_referral_1', name: 'Referidor', description: 'Invitaste a un amigo.', unlockRule: 'Conseguir tu primer referido.', family: 'social', rarity: 'common', emoji: '🤝', coins: 5, xp: 20 },
  { id: 'social_referral_5', name: 'Embajador', description: '5 amigos referidos.', unlockRule: 'Conseguir 5 referidos.', family: 'social', rarity: 'rare', emoji: '📣', coins: 10, xp: 35 },
  { id: 'social_referral_10', name: 'Comunidad', description: '10 amigos referidos.', unlockRule: 'Conseguir 10 referidos.', family: 'social', rarity: 'epic', emoji: '👥', coins: 20, xp: 60 },
  { id: 'social_event_1', name: 'Evento superado', description: 'Completaste 1 evento temporal.', unlockRule: 'Terminar un evento temporal.', family: 'social', rarity: 'common', emoji: '🎉', coins: 5, xp: 20 },
  { id: 'social_event_5', name: 'Veterano de eventos', description: 'Completaste 5 eventos.', unlockRule: 'Terminar 5 eventos temporales.', family: 'social', rarity: 'epic', emoji: '🎪', coins: 20, xp: 60 },
  { id: 'social_founder', name: 'Fundador', description: 'Usuario de los primeros 1.000.', unlockRule: 'Entrar entre las primeras 1.000 cuentas.', family: 'social', rarity: 'legendary', emoji: '🏛️', coins: 25, xp: 75 },
  { id: 'social_early_adopter', name: 'Early adopter', description: 'Primeros 3 meses de la app.', unlockRule: 'Registrarte durante los primeros 3 meses.', family: 'social', rarity: 'legendary', emoji: '⏳', coins: 25, xp: 75 },

  { id: 'special_fasting_10', name: 'Ayunador', description: 'Ayuno 14h completado 10 veces.', unlockRule: 'Completar 10 ayunos de 14h.', family: 'special', rarity: 'rare', emoji: '⏱️', coins: 10, xp: 35 },
  { id: 'special_nutrition_30', name: 'Nutricionista', description: 'Comida registrada 30 días.', unlockRule: 'Registrar comida 30 días.', family: 'special', rarity: 'rare', emoji: '🍽️', coins: 10, xp: 35 },
  { id: 'special_mental_14', name: 'Mental sano', description: 'Check-in mental 14 días.', unlockRule: 'Completar 14 check-ins mentales.', family: 'special', rarity: 'rare', emoji: '🧠', coins: 10, xp: 35 },
  { id: 'special_cycle_3', name: 'Ciclo consciente', description: '3 ciclos registrados.', unlockRule: 'Registrar 3 ciclos completos.', family: 'special', rarity: 'epic', emoji: '🌸', coins: 20, xp: 60 },
  { id: 'special_all_modules', name: 'Todo activado', description: 'Todos los módulos activos.', unlockRule: 'Activar todos los módulos disponibles.', family: 'special', rarity: 'epic', emoji: '🧩', coins: 20, xp: 60 },
  { id: 'special_premium_week_one', name: 'Premium desde día 1', description: 'Te suscribiste la primera semana.', unlockRule: 'Activar premium dentro de los primeros 7 días.', family: 'special', rarity: 'legendary', emoji: '💜', coins: 25, xp: 75 },
  { id: 'special_exporter', name: 'Exportador', description: 'Exportaste tus datos por primera vez.', unlockRule: 'Exportar datos desde Perfil.', family: 'special', rarity: 'common', emoji: '📦', coins: 5, xp: 20 },
];

export function getRankByXp(xp: number) {
  return [...VYRA_RANKS].reverse().find((rank) => xp >= rank.minXp) ?? VYRA_RANKS[0]!;
}

export function getNextRank(xp: number) {
  return VYRA_RANKS.find((rank) => xp < rank.minXp) ?? null;
}

export function getUpcomingRanks(xp: number, count = 3) {
  return VYRA_RANKS.filter((rank) => xp < rank.minXp).slice(0, count);
}

export function getRankProgress(xp: number) {
  const current = getRankByXp(xp);
  const next = getNextRank(xp);
  const start = current.minXp;
  const end = next?.minXp ?? current.maxXp ?? start;
  const span = Math.max(1, end - start);
  const progress = next ? Math.min(100, Math.max(0, ((xp - start) / span) * 100)) : 100;
  return {
    current,
    next,
    xpIntoRank: Math.max(0, xp - start),
    xpToNextRank: next ? Math.max(0, next.minXp - xp) : 0,
    rankSpan: span,
    progressPct: progress,
  };
}

export function getRankCoinBonusPct(xp: number) {
  return getRankByXp(xp).dailyCoinBonusPct;
}

export function getDailyCoinCap(isPremium: boolean) {
  return isPremium ? DAILY_PREMIUM_COINS_CAP : DAILY_FREE_COINS_CAP;
}

export function identifyCoinSource(type: string, description?: string | null): CoinSourceId | null {
  const raw = `${type} ${description ?? ''}`.toLowerCase();
  if (raw.includes('rewarded') || raw.includes('anuncio') || raw.includes('ad_reward')) return 'rewarded_ad';
  if (raw.includes('water_goal') || raw.includes('meta de agua') || raw.includes('hydration_goal')) return 'water_goal';
  if (raw.includes('steps_goal') || raw.includes('meta de pasos')) return 'steps_goal';
  if (raw.includes('sleep') && raw.includes('7h')) return 'sleep_goal';
  if (raw.includes('nutrition') || raw.includes('comida') || raw.includes('meal')) return 'nutrition_log';
  if (raw.includes('fast') || raw.includes('ayuno')) return 'fasting_14h';
  if (raw.includes('cerrar') || raw.includes('close_day') || raw.includes('resumen')) return 'close_day';
  if (raw.includes('mision diaria') || raw.includes('misión diaria')) return 'daily_mission';
  if (raw.includes('mision semanal') || raw.includes('misión semanal') || raw.includes('desafio') || raw.includes('desafío')) return 'weekly_mission';
  if (raw.includes('streak_30') || raw.includes('racha 30')) return 'streak_30';
  if (raw.includes('streak_7') || raw.includes('racha 7')) return 'streak_7';
  if (raw.includes('streak_3') || raw.includes('racha 3')) return 'streak_3';
  if (raw.includes('score 100') || raw.includes('daily_score_100')) return 'daily_score_100';
  if (raw.includes('score 80') || raw.includes('daily_score_80')) return 'daily_score_80';
  if (raw.includes('refer') || raw.includes('amigo')) return 'referral';
  return null;
}

export function getCoinSourceCountForWindow(
  sourceId: CoinSourceId,
  entries: Array<{ type: string; description?: string | null }>,
) {
  return entries.filter((entry) => identifyCoinSource(entry.type, entry.description) === sourceId).length;
}

export function computeCoinReward(sourceId: CoinSourceId, options: {
  isPremium: boolean;
  currentXp: number;
  todayEarned: number;
  todaySourceCount: number;
  hasDoubleCoinsBoost?: boolean;
}) {
  const source = COIN_SOURCES[sourceId];
  if (!source) {
    return { awarded: 0, blocked: true, capReached: false };
  }

  if (source.freeOnly && options.isPremium) {
    return { awarded: 0, blocked: true, capReached: false };
  }

  if (source.period !== 'unlimited' && options.todaySourceCount >= source.limit) {
    return { awarded: 0, blocked: true, capReached: false };
  }

  let multiplier = 1;
  if (source.premiumEligible && options.isPremium) multiplier *= PREMIUM_MULTIPLIER;
  if (source.rankBonusEligible) multiplier *= 1 + getRankCoinBonusPct(options.currentXp) / 100;
  if (options.hasDoubleCoinsBoost) multiplier *= 2;

  const baseCoins = source.coins;
  const computed = Math.max(0, Math.round(baseCoins * multiplier));
  const dailyCap = getDailyCoinCap(options.isPremium);
  const remainingCap = source.kind === 'social' ? computed : Math.max(0, dailyCap - options.todayEarned);
  const awarded = Math.max(0, Math.min(computed, remainingCap));

  return {
    awarded,
    blocked: awarded <= 0,
    capReached: awarded < computed,
  };
}

export function getBadgeById(id: string) {
  return BADGE_CATALOG.find((badge) => badge.id === id) ?? null;
}

export function getBadgeRarityColor(rarity: GamificationRarity) {
  switch (rarity) {
    case 'common':
      return Colors.rarityCommon;
    case 'rare':
      return Colors.rarityRare;
    case 'epic':
      return Colors.rarityEpic;
    case 'legendary':
    default:
      return Colors.rarityLegendary;
  }
}

export function getBadgeFamilyLabel(family: GamificationBadgeFamily) {
  return BADGE_FAMILY_LABELS[family];
}

export function getBadgeFamilyColor(family: GamificationBadgeFamily) {
  return BADGE_FAMILY_COLORS[family];
}
