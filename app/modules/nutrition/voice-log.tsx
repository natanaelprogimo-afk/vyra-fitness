import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/constants/theme';

export default function NutritionVoiceLogScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Nutricion" showBack color={Colors.nutrition} />
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Log por voz no disponible por ahora</Text>
          <Text style={styles.body}>
            En esta version publica el registro de comidas activo es manual o por barcode. Usa esas opciones para guardar tu comida.
          </Text>
          <Button
            label="Ir al log manual"
            onPress={() => router.replace('/modules/nutrition/log' as any)}
            color={Colors.nutrition}
          />
        </Card>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  card: {
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
