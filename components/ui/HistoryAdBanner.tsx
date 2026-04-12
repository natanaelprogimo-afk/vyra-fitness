import React from 'react';
import { StyleSheet, View } from 'react-native';
import UnityAdBanner from '@/components/ui/UnityAdBanner';
import { Spacing } from '@/constants/theme';

export default function HistoryAdBanner() {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={[styles.wrap, !visible && styles.wrapCollapsed]}>
      <UnityAdBanner surface="history" onVisibilityChange={setVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  wrapCollapsed: {
    marginTop: 0,
    marginBottom: 0,
    height: 0,
    overflow: 'hidden',
  },
});
