import {
  BADGE_CATALOG,
  BADGE_FAMILY_LABELS,
  BADGE_RARITY_LABELS,
  getBadgeById,
  getBadgeFamilyColor,
  getBadgeFamilyLabel,
  getBadgeRarityColor,
  type BadgeDef,
  type GamificationBadgeFamily as BadgeFamily,
  type GamificationRarity as BadgeRarity,
} from './gamification-system';

export type { BadgeDef, BadgeFamily, BadgeRarity };

export { BADGE_CATALOG, BADGE_FAMILY_LABELS, BADGE_RARITY_LABELS };
export { getBadgeById, getBadgeFamilyColor, getBadgeFamilyLabel, getBadgeRarityColor };

export function getBadgeRarityLabel(rarity: BadgeRarity) {
  return BADGE_RARITY_LABELS[rarity];
}
