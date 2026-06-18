import { useWindowDimensions } from 'react-native';
import { Spacing } from './theme';

export interface ResponsiveLayout {
  /** Maximum content width for larger screens (tablet/desktop) */
  maxWidth: number;
  /** Number of columns for grid layouts */
  numColumns: number;
  /** Horizontal padding for screen content */
  paddingHorizontal: number;
  /** Whether device is in landscape mode */
  isLandscape: boolean;
  /** Whether device is tablet-sized (>600px) */
  isTablet: boolean;
  /** Base container width for responsive calculations */
  containerWidth: number;
  /** Item width for 2-column grid layouts */
  gridItemWidth: number;
  /** Item width for 3-column grid layouts */
  gridItemWidth3Col: number;
  /** Item width for 4-column grid layouts */
  gridItemWidth4Col: number;
}

/**
 * Hook for responsive layout calculations across mobile and tablet screens.
 * Provides consistent layout guidance for all screens avoiding infinite stretching on tablets.
 *
 * Usage in StyleSheet:
 * ```
 * const { maxWidth, paddingHorizontal, gridItemWidth } = useResponsiveLayout();
 * const styles = StyleSheet.create({
 *   screen: {
 *     maxWidth,
 *     paddingHorizontal,
 *     alignSelf: 'center',
 *   },
 *   gridContainer: {
 *     gap: Spacing[2],
 *     flexDirection: 'row',
 *     flexWrap: 'wrap',
 *   },
 *   gridItem: {
 *     width: gridItemWidth,
 *   },
 * });
 * ```
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Define device tier based on width
  const isTablet = width > 600;
  
  // Maximum content width prevents stretching on ultra-wide tablets
  // Mobile: full width with padding
  // Tablet: capped at 600px (portrait) or 800px (landscape)
  const maxWidth = isTablet
    ? (isLandscape ? 900 : 620)
    : width;
  
  // Horizontal padding: larger on tablets for breathing room
  const paddingHorizontal = isTablet ? Spacing[4] : Spacing[3];
  
  // Number of columns for responsive grids
  // Most screens use 2-col on mobile, 3-col on tablet
  const numColumns = isTablet ? 3 : 2;
  
  // Container width available for layout (minus padding on both sides)
  const containerWidth = Math.min(maxWidth, width) - paddingHorizontal * 2;
  
  // Grid item widths for common grid patterns
  // Account for gaps between items (typically Spacing[2] = 8px)
  const gapWidth = Spacing[2];
  
  // 2-column grid: [item] gap [item]
  // containerWidth = 2 * itemWidth + 1 * gap
  // itemWidth = (containerWidth - gap) / 2
  const gridItemWidth = (containerWidth - gapWidth) / 2;
  
  // 3-column grid: [item] gap [item] gap [item]
  // containerWidth = 3 * itemWidth + 2 * gaps
  // itemWidth = (containerWidth - 2*gap) / 3
  const gridItemWidth3Col = (containerWidth - 2 * gapWidth) / 3;
  
  // 4-column grid
  const gridItemWidth4Col = (containerWidth - 3 * gapWidth) / 4;
  
  return {
    maxWidth,
    numColumns,
    paddingHorizontal,
    isLandscape,
    isTablet,
    containerWidth,
    gridItemWidth,
    gridItemWidth3Col,
    gridItemWidth4Col,
  };
}

/**
 * Common responsive layout presets for standard screen scenarios
 */
export const ResponsivePresets = {
  /**
   * Center content with maxWidth constraint (most screens)
   * Apply to ScrollView/View wrapping entire screen content
   */
  screenContent: (layout: ResponsiveLayout) => ({
    maxWidth: layout.maxWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
    paddingHorizontal: layout.paddingHorizontal,
  }),
  
  /**
   * 2-column grid with proper spacing
   */
  gridRow2Col: (_layout: ResponsiveLayout) => ({
    flexDirection: 'row' as const,
    gap: Spacing[2],
    justifyContent: 'space-between' as const,
  }),
  
  /**
   * Grid item for 2-column layout
   */
  gridItem2Col: (layout: ResponsiveLayout) => ({
    width: layout.gridItemWidth,
  }),
  
  /**
   * Grid item for 3-column layout
   */
  gridItem3Col: (layout: ResponsiveLayout) => ({
    width: layout.gridItemWidth3Col,
  }),
  
  /**
   * Common centered container (like modals, cards)
   */
  centeredContainer: (layout: ResponsiveLayout) => ({
    maxWidth: Math.min(480, layout.containerWidth),
    width: '100%' as const,
    alignSelf: 'center' as const,
  }),
} as const;
