import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/constants/theme';

export default function WeightPhotosScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Peso" showBack color={Colors.weight} />
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Esta pantalla no esta activa en esta version</Text>
          <Text style={styles.body}>
            El seguimiento de peso funciona con registros, historial y tendencias. Las fotos de progreso no estan publicadas todavia.
          </Text>
          <Button
            label="Ver historial de peso"
            onPress={() => router.replace('/modules/weight/history' as any)}
            color={Colors.weight}
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
