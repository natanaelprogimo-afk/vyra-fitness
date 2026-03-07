import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useSupplements, Supplement } from '@/hooks/useSupplements';
import { AddSupplementSheet } from './components/AddSupplementSheet';

const UNIT_LABELS: Record<string, string> = {
  mg: 'mg',
  g: 'g',
  ml: 'ml',
  caps: 'cáps.',
  IU: 'UI',
};

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  as_needed: 'Según necesidad',
};

export default function SupplementsScreen() {
  const {
    supplements,
    loading,
    saving,
    markTaken,
    unmarkTaken,
    addSupplement,
    deactivateSupplement,
    isTakenToday,
    dailyAdherenceStreak,
    interactionWarnings,
  } = useSupplements();

  const [showAdd, setShowAdd] = useState(false);

  const todayCount = supplements.filter((s) => isTakenToday(s.id)).length;
  const totalDaily = supplements.filter((s) => s.frequency === 'daily').length;

  const handleToggle = async (supplement: Supplement) => {
    const taken = isTakenToday(supplement.id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (taken) {
      await unmarkTaken(supplement.id);
    } else {
      await markTaken(supplement.id);
    }
  };

  const handleDelete = (supplement: Supplement) => {
    Alert.alert(
      `Eliminar ${supplement.name}`,
      '¿Querés dejar de trackear este suplemento? No se borrarán los registros históricos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deactivateSupplement(supplement.id),
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Suplementos" showBack color={Colors.brand} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Skeleton height={80} style={styles.skeleton} />
          <Skeleton height={140} style={styles.skeleton} />
          <Skeleton height={200} style={styles.skeleton} />
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Suplementos" showBack color={Colors.brand} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Disclaimer médico — SIEMPRE VISIBLE */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerText}>
            Esta app no recomienda dosis ni combinaciones. Consultá a un profesional de salud.
          </Text>
        </View>

        {/* Resumen del día */}
        {supplements.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Hoy</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCircle}>
                <Text style={styles.summaryNum}>{todayCount}</Text>
                <Text style={styles.summaryDen}>/{totalDaily}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryLabel}>
                  {todayCount === totalDaily && totalDaily > 0
                    ? '✅ Todos tomados hoy'
                    : `Faltan ${totalDaily - todayCount} suplementos diarios`}
                </Text>
                <Text style={styles.summarySubLabel}>
                  {new Date().toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {dailyAdherenceStreak > 0 && (
          <Card style={styles.streakCard}>
            <Text style={styles.streakTitle}>Racha de adherencia</Text>
            <Text style={styles.streakValue}>{dailyAdherenceStreak} días</Text>
            <Text style={styles.streakHint}>Días seguidos tomando todos tus suplementos diarios.</Text>
          </Card>
        )}

        {interactionWarnings.map((warning) => (
          <Card key={warning.id} style={styles.warningCard}>
            <Text style={styles.warningTitle}>Interacción a revisar</Text>
            <Text style={styles.warningText}>{warning.message}</Text>
          </Card>
        ))}

        {/* Lista de suplementos */}
        {supplements.length === 0 ? (
          <EmptyState
            icon="💊"
            title="Sin suplementos"
            description="Agregá tu primer suplemento para hacer seguimiento diario"
          />
        ) : (
          supplements.map((supplement) => {
            const taken = isTakenToday(supplement.id);
            return (
              <Card
                key={supplement.id}
                style={taken ? [styles.supplementCard, styles.supplementCardTaken] : styles.supplementCard}
              >
                <View style={styles.supplementRow}>
                  <View style={styles.supplementLeft}>
                    <Text style={styles.supplementName}>{supplement.name}</Text>
                    <Text style={styles.supplementDetails}>
                      {supplement.dose} {UNIT_LABELS[supplement.unit]} ·{' '}
                      {FREQ_LABELS[supplement.frequency]}
                    </Text>
                    {supplement.reminder_times.length > 0 && (
                      <Text style={styles.supplementReminder}>
                        🔔 {supplement.reminder_times.join(', ')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.supplementRight}>
                    <Switch
                      value={taken}
                      onValueChange={() => handleToggle(supplement)}
                      trackColor={{
                        false: Colors.bgElevated,
                        true: `${Colors.success}80`,
                      }}
                      thumbColor={taken ? Colors.success : Colors.textMuted}
                    />
                    <Text style={[styles.switchLabel, taken && styles.switchLabelTaken]}>
                      {taken ? 'Tomado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(supplement)}
                >
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </Card>
            );
          })
        )}

        {/* Botón agregar */}
        <Button
          label="+ Agregar suplemento"
          onPress={() => setShowAdd(true)}
          color={Colors.brand}
          style={styles.addBtn}
        />
      </ScrollView>

      <AddSupplementSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={async (name, dose, unit, frequency, reminders) => {
          await addSupplement(name, dose, unit, frequency, reminders);
          setShowAdd(false);
        }}
        saving={saving}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  skeleton: {
    borderRadius: Radius.xl,
    marginBottom: Spacing[3],
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${Colors.warning}18`,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    gap: Spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  disclaimerIcon: { fontSize: 20 },
  disclaimerText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.warning,
    lineHeight: 18,
  },
  summaryCard: {},
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  summaryCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  summaryNum: {
    fontFamily: FontFamily.bold,
    fontSize: 42,
    color: Colors.brand,
  },
  summaryDen: {
    fontFamily: FontFamily.medium,
    fontSize: 22,
    color: Colors.textSecondary,
  },
  summaryRight: {
    flex: 1,
    gap: Spacing[1],
  },
  summaryLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  summarySubLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  streakCard: {
    borderWidth: 1,
    borderColor: `${Colors.brand}40`,
    backgroundColor: `${Colors.brand}10`,
  },
  streakTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.brand,
    marginBottom: Spacing[1],
  },
  streakValue: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  streakHint: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  warningCard: {
    borderWidth: 1,
    borderColor: `${Colors.warning}55`,
    backgroundColor: `${Colors.warning}14`,
  },
  warningTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.warning,
    marginBottom: Spacing[1],
  },
  warningText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  supplementCard: {
    gap: Spacing[3],
  },
  supplementCardTaken: {
    borderWidth: 1,
    borderColor: `${Colors.success}40`,
    backgroundColor: `${Colors.success}08`,
  },
  supplementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  supplementLeft: {
    flex: 1,
    gap: Spacing[1],
    paddingRight: Spacing[3],
  },
  supplementName: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  supplementDetails: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  supplementReminder: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  supplementRight: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  switchLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  switchLabelTaken: {
    color: Colors.success,
  },
  deleteBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  deleteBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.error,
  },
  addBtn: {
    marginTop: Spacing[2],
  },
});
