import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Header from '@/components/layout/Header';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface ModuleScaffoldProps {
  title: string;
  subtitle?: string;
  color?: string;
  backgroundColor?: string;
  disableAtmosphere?: boolean;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function ModuleScaffold({
  title,
  subtitle,
  color = Colors.brand,
  backgroundColor = Colors.bgBase,
  disableAtmosphere = false,
  tabs,
  children,
  contentContainerStyle,
}: ModuleScaffoldProps) {
  return (
    <SafeScreen
      backgroundColor={backgroundColor}
      disableAtmosphere={disableAtmosphere}
      padHorizontal={false}
      padBottom={false}
    >
      <Header title={title} subtitle={subtitle} showBack color={color} />

      <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]} showsVerticalScrollIndicator={false}>
        {tabs ? <View style={styles.tabs}>{tabs}</View> : null}
        {children}
        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  tabs: {
    marginBottom: Spacing[1],
  },
});
