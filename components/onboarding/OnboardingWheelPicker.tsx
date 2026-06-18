import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const ITEM_HEIGHT = 36;
const VISIBLE_ROWS = 3;

type OnboardingWheelPickerProps = {
  value: number;
  values: number[];
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  a11yLabel?: string; // Accessibility label (e.g., "Age picker")
};

export default function OnboardingWheelPicker({
  value,
  values,
  unit,
  onChange,
  formatValue,
  a11yLabel = 'Numeric picker',
}: OnboardingWheelPickerProps) {
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, values.indexOf(value));
  const paddingVertical = ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const contentHeight = useMemo(
    () => ITEM_HEIGHT * VISIBLE_ROWS + paddingVertical * 2,
    [paddingVertical],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!listRef.current || selectedIndex < 0) return;
      listRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  const commitOffset = (offsetY: number) => {
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(values.length - 1, rawIndex));
    const nextValue = values[safeIndex];
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    commitOffset(event.nativeEvent.contentOffset.y);
  };

  const renderLabel = (item: number) => {
    const formatted = formatValue ? formatValue(item) : String(item);
    return unit ? `${formatted} ${unit}` : formatted;
  };

  return (
    <View
      style={styles.wrap}
      accessible={true}
      accessibilityRole="adjustable"
      accessibilityLabel={a11yLabel}
      accessibilityValue={{
        min: minValue,
        max: maxValue,
        now: value,
        text: `${value} ${unit || ''}`,
      }}
      accessibilityHint={`Use increment and decrement to adjust the value. Current: ${renderLabel(value)}`}
    >
      <View style={styles.currentValue}>
        <Text style={styles.currentValueText}>{renderLabel(value)}</Text>
      </View>

      <View style={[styles.wheelFrame, { height: contentHeight }]}>
        <View pointerEvents="none" style={styles.centerHighlight} />
        <FlatList
          ref={listRef}
          data={values}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingVertical }}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumEnd}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const active = index === selectedIndex;
            return (
              <Pressable
                onPress={() => {
                  listRef.current?.scrollToOffset({
                    offset: index * ITEM_HEIGHT,
                    animated: true,
                  });
                  onChange(item);
                }}
                style={styles.item}
              >
                <Text style={[styles.itemText, active && styles.itemTextActive]}>
                  {renderLabel(item)}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[3],
  },
  currentValue: {
    alignItems: 'center',
  },
  currentValueText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  wheelFrame: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    overflow: 'hidden',
    position: 'relative',
  },
  centerHighlight: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '50%',
    marginTop: -(ITEM_HEIGHT / 2),
    height: ITEM_HEIGHT,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.22),
    backgroundColor: withOpacity(Colors.secondary, 0.08),
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  itemTextActive: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
});
