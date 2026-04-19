import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useSupplements, type Supplement } from '@/hooks/useSupplements';
import { useNutrition } from '@/hooks/useNutrition';
import { buildSupplementNutritionInsight } from '@/lib/module-correlations';
import { useSettingsStore } from '@/stores/settingsStore';
import { AddSupplementSheet } from './components/AddSupplementSheet';

const UNIT_LABELS: Record<string, string> = {
  mg: 'mg',
  g: 'g',
  ml: 'ml',
  caps: 'caps.',
  IU: 'UI',
};

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  as_needed: 'Segun necesidad',
};

function getCycleSummary(supplement: Supplement, cycleStart: string | undefined) {
  if (!cycleStart) return null;
  const diffDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(`${cycleStart}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24)),
  );
  const week = Math.floor(diffDays / 7) + 1;
  const lower = supplement.name.toLowerCase();
  const isCreatine = lower.includes('creatina') || lower.includes('creatine');

  if (isCreatine) {
    const loading = diffDays < 7;
    return {
      title: loading ? 'Ciclo de carga' : 'Mantenimiento',
      body: loading
        ? 'Semana 1 · 20g/dia repartidos en 4 tomas si asi te lo indico tu profesional.'
        : 'Desde aqui conviene pasar a mantenimiento y sostener una dosis simple.',
      meta: `Hoy vas por la semana ${week}. Dosis visible del stack: ${supplement.dose}${UNIT_LABELS[supplement.unit]}.`,
    };
  }

  return {
    title: `Ciclo activo · semana ${week}`,
    body: `${supplement.name} esta en seguimiento por ciclo desde ${new Date(`${cycleStart}T00:00:00`).toLocaleDateString('es-AR')}.`,
    meta: 'Si ya no corresponde seguirlo por fases, reinicia o limpia el ciclo desde ajustes.',
  };
}

export default function SupplementsScreen() {
  const {
    supplements,
    todayLogs,
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
  const { totals, hasEaten } = useNutrition();
  const supplementsDisclaimerAccepted = useSettingsStore((state) => state.supplementsDisclaimerAccepted);
  const setSupplementsDisclaimerAccepted = useSettingsStore(
    (state) => state.setSupplementsDisclaimerAccepted,
  );
  const supplementCycleStarts = useSettingsStore((state) => state.supplementCycleStarts);

  const [showAdd, setShowAdd] = useState(false);

  const todayCount = supplements.filter((supplement) => isTakenToday(supplement.id)).length;
  const totalDaily = supplements.filter((supplement) => supplement.frequency === 'daily').length;

  const nextSupplementWindow = (() => {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const pendingWithReminder = supplements
      .filter((supplement) => !isTakenToday(supplement.id))
      .flatMap((supplement) =>
        supplement.reminder_times.map((time) => {
          const [hour, minute] = time.split(':').map((value) => Number(value));
          return {
            supplement,
            time,
            delta: (Number.isFinite(hour) ? hour : 0) * 60 + (Number.isFinite(minute) ? minute : 0) - nowMinutes,
          };
        }),
      )
      .sort((left, right) => Math.abs(left.delta) - Math.abs(right.delta));

    const next = pendingWithReminder[0] ?? null;
    if (next) {
      return {
        title: 'Siguiente ventana del stack',
        body: `${next.supplement.name} queda mejor alrededor de ${next.time}. Si lo anclas a una comida, la adherencia deja de depender de memoria suelta.`,
      };
    }

    if (supplements.some((supplement) => !isTakenToday(supplement.id))) {
      return {
        title: 'Pendientes sin horario fijo',
        body: 'Todavia hay suplementos por tomar, pero sin una ventana clara. Anclalos a desayuno, almuerzo o cena para bajar friccion.',
      };
    }

    return {
      title: 'Stack del dia bastante ordenado',
      body: `Hoy ya hay ${todayLogs.length} registro${todayLogs.length === 1 ? '' : 's'} y no quedan pendientes obvios. Mantener este patron vale mas que sumar complejidad.`,
    };
  })();

  const nutritionInsight = buildSupplementNutritionInsight({
    supplementCount: totalDaily,
    takenToday: todayCount,
    proteinGrams: totals.protein,
    calories: totals.calories,
    hasBreakfast: hasEaten.breakfast,
    hasLunch: hasEaten.lunch,
    hasDinner: hasEaten.dinner,
    hasWarnings: interactionWarnings.length > 0,
  });

  const cycleCards = useMemo(
    () =>
      supplements
        .map((supplement) => ({
          supplement,
          summary: getCycleSummary(supplement, supplementCycleStarts[supplement.id]),
        }))
        .filter((item) => Boolean(item.summary)),
    [supplementCycleStarts, supplements],
  );

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
      'Quieres dejar de trackear este suplemento? No se borraran los registros historicos.',
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!supplementsDisclaimerAccepted ? (
          <Card style={styles.onboardingCard}>
            <Text style={styles.onboardingEyebrow}>Primer uso del modulo</Text>
            <Text style={styles.onboardingTitle}>Antes de arrancar: una sola aclaracion util</Text>
            <Text style={styles.onboardingText}>
              Vyra te ayuda a ordenar tomas, horarios y adherencia. No reemplaza indicacion
              medica ni recomienda dosis por su cuenta.
            </Text>
            <Button
              onPress={() => setSupplementsDisclaimerAccepted(true)}
              color={Colors.brand}
              fullWidth
            >
              Entendido, continuar
            </Button>
            <Button
              onPress={() => router.push('/modules/supplements/settings' as never)}
              variant="secondary"
              color={Colors.brand}
              fullWidth
            >
              Ver mas contexto
            </Button>
          </Card>
        ) : null}

        {supplements.length > 0 ? (
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
                    ? 'Todo tomado hoy'
                    : `Faltan ${Math.max(0, totalDaily - todayCount)} suplementos diarios`}
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
        ) : null}

        {dailyAdherenceStreak > 0 ? (
          <Card style={styles.streakCard}>
            <Text style={styles.streakTitle}>Racha de adherencia</Text>
            <Text style={styles.streakValue}>{dailyAdherenceStreak} dias</Text>
            <Text style={styles.streakHint}>
              Dias seguidos tomando todos tus suplementos diarios.
            </Text>
          </Card>
        ) : null}

        {interactionWarnings.map((warning) => (
          <Card key={warning.id} style={styles.warningCard}>
            <Text style={styles.warningTitle}>Interaccion a revisar</Text>
            <Text style={styles.warningText}>{warning.message}</Text>
            <View style={styles.inlineActions}>
              <Button
                label="Ajustar horarios"
                onPress={() => router.push('/modules/supplements/settings' as never)}
                size="sm"
                color={Colors.warning}
              />
              <Button
                label="Ignorar hoy"
                onPress={() => undefined}
                size="sm"
                variant="secondary"
                color={Colors.warning}
              />
            </View>
          </Card>
        ))}

        {cycleCards.map(({ supplement, summary }) =>
          summary ? (
            <Card key={supplement.id} style={styles.cycleCard}>
              <Text style={styles.cycleEyebrow}>{supplement.name}</Text>
              <Text style={styles.cycleTitle}>{summary.title}</Text>
              <Text style={styles.cycleText}>{summary.body}</Text>
              <Text style={styles.cycleMeta}>{summary.meta}</Text>
              <Button
                label="Abrir ajustes"
                onPress={() => router.push('/modules/supplements/settings' as never)}
                size="sm"
                variant="secondary"
                color={Colors.brand}
              />
            </Card>
          ) : null,
        )}

        <Card
          style={[
            styles.nutritionCard,
            nutritionInsight.tone === 'warning'
              ? styles.nutritionCardWarning
              : nutritionInsight.tone === 'positive'
                ? styles.nutritionCardPositive
                : styles.nutritionCardNeutral,
          ]}
        >
          <Text style={styles.nutritionTitle}>{nutritionInsight.title}</Text>
          <Text style={styles.nutritionText}>{nutritionInsight.body}</Text>
          <View style={styles.nutritionMetaRow}>
            <Text style={styles.nutritionMeta}>Proteina: {Math.round(totals.protein)} g</Text>
            <Text style={styles.nutritionMeta}>Kcal: {Math.round(totals.calories)}</Text>
          </View>
          <View style={styles.inlineActions}>
            <Button
              label="Abrir nutricion"
              onPress={() => router.push('/modules/nutrition' as never)}
              size="sm"
              color={Colors.brand}
            />
            <Button
              label="Agregar comida"
              onPress={() => router.push('/modules/nutrition/log?mealType=snack' as never)}
              variant="secondary"
              size="sm"
              color={Colors.brand}
            />
          </View>
        </Card>

        <Card style={styles.timingCard}>
          <Text style={styles.timingTitle}>{nextSupplementWindow.title}</Text>
          <Text style={styles.timingText}>{nextSupplementWindow.body}</Text>
          <View style={styles.inlineActions}>
            <Button
              label="Ver historial"
              onPress={() => router.push('/modules/supplements/history' as never)}
              size="sm"
              color={Colors.brand}
            />
            <Button
              label="Abrir ajustes"
              onPress={() => router.push('/modules/supplements/settings' as never)}
              variant="secondary"
              size="sm"
              color={Colors.brand}
            />
          </View>
        </Card>

        {supplements.length === 0 ? (
          <EmptyState
            icon="Pildoras"
            title="Sin suplementos"
            description="Agrega tu primer suplemento para hacer seguimiento diario."
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
                      {supplement.dose} {UNIT_LABELS[supplement.unit]} · {FREQ_LABELS[supplement.frequency]}
                    </Text>
                    <Text style={styles.supplementReminder}>
                      {supplement.reminder_times.length > 0
                        ? `Ventanas: ${supplement.reminder_times.join(', ')}`
                        : 'Sin horario fijo'}
                    </Text>
                  </View>

                  <View style={styles.supplementRight}>
                    <Switch
                      value={taken}
                      onValueChange={() => void handleToggle(supplement)}
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

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(supplement)}>
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </Card>
            );
          })
        )}

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
  onboardingCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: `${Colors.brand}40`,
    backgroundColor: `${Colors.brand}10`,
  },
  onboardingEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  onboardingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  onboardingText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
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
    gap: Spacing[2],
  },
  warningTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.warning,
  },
  warningText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  inlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  cycleCard: {
    borderWidth: 1,
    borderColor: `${Colors.brand}44`,
    backgroundColor: `${Colors.brand}0F`,
    gap: Spacing[2],
  },
  cycleEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  cycleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  cycleText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  cycleMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  nutritionCard: {
    borderWidth: 1,
    gap: Spacing[2],
  },
  nutritionCardNeutral: {
    borderColor: `${Colors.brand}44`,
    backgroundColor: `${Colors.brand}10`,
  },
  nutritionCardPositive: {
    borderColor: `${Colors.success}44`,
    backgroundColor: `${Colors.success}10`,
  },
  nutritionCardWarning: {
    borderColor: `${Colors.warning}55`,
    backgroundColor: `${Colors.warning}12`,
  },
  nutritionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  nutritionText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  nutritionMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  nutritionMeta: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  timingCard: {
    borderWidth: 1,
    borderColor: `${Colors.brand}44`,
    backgroundColor: `${Colors.brand}10`,
    gap: Spacing[2],
  },
  timingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.brand,
  },
  timingText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
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
