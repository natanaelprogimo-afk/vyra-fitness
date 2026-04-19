import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSupplements } from '@/hooks/useSupplements';
import { useSettingsStore } from '@/stores/settingsStore';

function getCycleLabel(start: string) {
  const diffDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(`${start}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24)),
  );
  const week = Math.floor(diffDays / 7) + 1;
  return `Semana ${week} · iniciado ${new Date(`${start}T00:00:00`).toLocaleDateString('es-AR')}`;
}

export default function SupplementsSettingsScreen() {
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const supplementsDisclaimerAccepted = useSettingsStore(
    (state) => state.supplementsDisclaimerAccepted,
  );
  const supplementCycleStarts = useSettingsStore((state) => state.supplementCycleStarts);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const setHapticsEnabled = useSettingsStore((state) => state.setHapticsEnabled);
  const setSupplementsDisclaimerAccepted = useSettingsStore(
    (state) => state.setSupplementsDisclaimerAccepted,
  );
  const setSupplementCycleStart = useSettingsStore((state) => state.setSupplementCycleStart);
  const clearSupplementCycleStart = useSettingsStore((state) => state.clearSupplementCycleStart);
  const { supplements, interactionWarnings, deactivateSupplement } = useSupplements();

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header
          color={Colors.supplements}
          eyebrow="Suplementos"
          title="Ajustes"
          subtitle="Privacidad, avisos y ciclos para que el stack se mantenga util."
        />

        <Card accentColor={Colors.supplements}>
          <Text style={styles.sectionTitle}>Avisos y feedback</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchLabel}>Notificaciones activas</Text>
              <Text style={styles.switchHint}>Recordatorios de toma y resumenes del stack.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: `${Colors.supplements}66` }}
              thumbColor={notificationsEnabled ? Colors.supplements : Colors.textMuted}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchLabel}>Haptica</Text>
              <Text style={styles.switchHint}>Feedback tactil al marcar tomas o confirmar cambios.</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: Colors.border, true: `${Colors.supplements}66` }}
              thumbColor={hapticsEnabled ? Colors.supplements : Colors.textMuted}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Sobre suplementos</Text>
          <Text style={styles.bodyText}>
            El disclaimer medico ya no vive en la pantalla diaria. Aqui queda guardado para
            consultarlo cuando haga falta, no para molestar todos los dias.
          </Text>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>Confirmado</Text>
            <Text style={styles.inlineValue}>
              {supplementsDisclaimerAccepted ? 'Si' : 'Todavia no'}
            </Text>
          </View>
          <Button
            label={supplementsDisclaimerAccepted ? 'Volver a mostrar en primer uso' : 'Marcar como entendido'}
            onPress={() => setSupplementsDisclaimerAccepted(!supplementsDisclaimerAccepted)}
            variant="secondary"
            color={Colors.supplements}
            fullWidth
          />
        </Card>

        {interactionWarnings.length > 0 ? (
          <Card accentColor={Colors.warning}>
            <Text style={styles.sectionTitle}>Interacciones a revisar</Text>
            {interactionWarnings.map((warning) => (
              <View key={warning.id} style={styles.warningRow}>
                <View style={styles.warningDot} />
                <Text style={styles.warningText}>{warning.message}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Ciclos de suplementacion</Text>
          <Text style={styles.bodyText}>
            Si un suplemento se usa por fases, puedes iniciar o reiniciar el ciclo desde aqui.
          </Text>
          {supplements.length === 0 ? (
            <Text style={styles.emptyText}>No hay suplementos activos todavia.</Text>
          ) : (
            supplements.map((supplement) => {
              const cycleStart = supplementCycleStarts[supplement.id];
              return (
                <View key={supplement.id} style={styles.suppRow}>
                  <View style={styles.suppCopy}>
                    <Text style={styles.suppTitle}>{supplement.name}</Text>
                    <Text style={styles.suppSub}>
                      {cycleStart ? getCycleLabel(cycleStart) : 'Sin ciclo activo'}
                    </Text>
                  </View>
                  <View style={styles.suppActions}>
                    <Pressable
                      style={styles.actionChip}
                      onPress={() =>
                        setSupplementCycleStart(
                          supplement.id,
                          new Date().toISOString().split('T')[0] ?? '',
                        )
                      }
                    >
                      <Text style={styles.actionChipText}>{cycleStart ? 'Reiniciar' : 'Iniciar'}</Text>
                    </Pressable>
                    {cycleStart ? (
                      <Pressable
                        style={[styles.actionChip, styles.actionChipMuted]}
                        onPress={() => clearSupplementCycleStart(supplement.id)}
                      >
                        <Text style={[styles.actionChipText, styles.actionChipTextMuted]}>Limpiar</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Stack activo</Text>
          {supplements.length === 0 ? (
            <Text style={styles.emptyText}>No tienes suplementos activos.</Text>
          ) : (
            supplements.map((supplement) => (
              <View key={supplement.id} style={styles.suppRow}>
                <View style={styles.suppCopy}>
                  <Text style={styles.suppTitle}>{supplement.name}</Text>
                  <Text style={styles.suppSub}>
                    {supplement.dose}
                    {supplement.unit} · {supplement.frequency === 'daily' ? 'Diario' : supplement.frequency}
                  </Text>
                </View>
                <Pressable style={styles.pauseBtn} onPress={() => deactivateSupplement(supplement.id)}>
                  <Text style={styles.pauseText}>Pausar</Text>
                </Pressable>
              </View>
            ))
          )}
        </Card>

        <View style={styles.buttonStack}>
          <Button
            onPress={() => router.push('/settings/notifications-settings' as never)}
            label="Abrir notificaciones"
            variant="secondary"
            color={Colors.supplements}
            fullWidth
          />
          <Button
            onPress={() => router.push('/modules/supplements/history' as never)}
            label="Abrir historial"
            variant="ghost"
            color={Colors.supplements}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  bodyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  switchLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  switchHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing[3],
    paddingVertical: Spacing[2],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  inlineLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  inlineValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: Colors.warning,
  },
  warningText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  suppRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  suppCopy: {
    flex: 1,
    gap: 4,
  },
  suppTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  suppSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  suppActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  actionChip: {
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.supplements, 0.3),
    backgroundColor: withOpacity(Colors.supplements, 0.12),
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionChipMuted: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
  },
  actionChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.supplements,
  },
  actionChipTextMuted: {
    color: Colors.textSecondary,
  },
  pauseBtn: {
    minHeight: 44,
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.supplements,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.supplements,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  buttonStack: {
    gap: Spacing[2],
  },
});
