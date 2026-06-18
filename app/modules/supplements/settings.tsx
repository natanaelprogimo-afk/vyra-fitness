import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LinkRow from '@/components/ui/LinkRow';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
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
  return `Semana ${week} - iniciado ${new Date(`${start}T00:00:00`).toLocaleDateString('es-UY')}`;
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
      <Header
        color={Colors.supplements}
        eyebrow="Suplementos"
        title="Ajustes"
        subtitle="Privacidad, avisos y ciclos del stack."
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Stack con menos friccion"
          body="Este panel ya usa el mismo sistema de toggles, filas y bloques informativos que el resto de la app."
          tone="info"
        />

        <Card accentColor={Colors.supplements} style={styles.card}>
          <SectionHeader
            eyebrow="Feedback"
            title="Avisos y confirmaciones"
            subtitle="Los controles globales del stack viven en una sola gramatica visual."
          />

          <SettingToggleRow
            title="Notificaciones activas"
            description="Recordatorios de toma y resumenes del stack."
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            accentColor={Colors.supplements}
          />
          <SettingToggleRow
            title="Haptica"
            description="Feedback tactil al marcar tomas o confirmar cambios."
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            accentColor={Colors.supplements}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Contexto medico"
            title="Disclaimer guardado"
            subtitle="Queda disponible aqui para consulta sin repetir ruido en la pantalla diaria."
          />

          <Text style={styles.bodyText}>
            El modulo acompana decisiones de adherencia y contexto, pero no reemplaza indicacion profesional.
          </Text>

          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>Confirmado</Text>
            <Text style={styles.inlineValue}>
              {supplementsDisclaimerAccepted ? 'Si' : 'Aun no'}
            </Text>
          </View>

            <Button
              label={
                supplementsDisclaimerAccepted
                ? 'Mostrar aviso de nuevo'
                : 'Marcar como entendido'
              }
            onPress={() => setSupplementsDisclaimerAccepted(!supplementsDisclaimerAccepted)}
            variant="secondary"
            color={Colors.supplements}
            fullWidth
          />
        </Card>

        {interactionWarnings.length ? (
          <Card accentColor={Colors.warning} style={styles.card}>
            <SectionHeader
              eyebrow="Revisar"
              title="Interacciones detectadas"
              subtitle="Alertas visibles dentro del flujo en vez de perderlas entre cards sueltas."
            />

            <View style={styles.warningStack}>
              {interactionWarnings.map((warning) => (
                <View key={warning.id} style={styles.warningRow}>
                  <View style={styles.warningDot} />
                  <Text style={styles.warningText}>{warning.message}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Ciclos"
            title="Inicio por suplemento"
            subtitle="Si un suplemento se usa por fases, puedes iniciar o reiniciar el ciclo sin salir del panel."
          />

          {supplements.length === 0 ? (
            <NoticeCard
              title="Todavia no hay suplementos activos"
              body="Cuando armes tu stack, aqui vas a poder reiniciar y limpiar ciclos por item."
              tone="info"
            />
          ) : (
            <View style={styles.stack}>
              {supplements.map((supplement) => {
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
                        accessibilityRole="button"
                        accessibilityLabel={`${cycleStart ? 'Reiniciar' : 'Iniciar'} ciclo de ${supplement.name}`}
                        accessibilityHint="Actualiza la fecha base del ciclo para este suplemento."
                      >
                        <Text style={styles.actionChipText}>
                          {cycleStart ? 'Reiniciar' : 'Iniciar'}
                        </Text>
                      </Pressable>

                      {cycleStart ? (
                        <Pressable
                          style={[styles.actionChip, styles.actionChipMuted]}
                          onPress={() => clearSupplementCycleStart(supplement.id)}
                          accessibilityRole="button"
                          accessibilityLabel={`Limpiar ciclo de ${supplement.name}`}
                          accessibilityHint="Quita la fecha base guardada para este suplemento."
                        >
                          <Text style={[styles.actionChipText, styles.actionChipTextMuted]}>
                            Limpiar
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Stack"
            title="Suplementos activos"
            subtitle="Puedes pausarlos sin entrar a otra superficie."
          />

          {supplements.length === 0 ? (
            <NoticeCard
              title="No tienes suplementos activos"
              body="En cuanto agregues alguno al stack, aparecera aqui con acceso rapido para pausarlo."
              tone="info"
            />
          ) : (
            <View style={styles.stack}>
              {supplements.map((supplement) => (
                <View key={supplement.id} style={styles.suppRow}>
                  <View style={styles.suppCopy}>
                    <Text style={styles.suppTitle}>{supplement.name}</Text>
                    <Text style={styles.suppSub}>
                      {supplement.dose}
                      {supplement.unit} - {supplement.frequency === 'daily' ? 'Diario' : supplement.frequency}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.pauseBtn}
                    onPress={() => deactivateSupplement(supplement.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Pausar ${supplement.name}`}
                    accessibilityHint="Lo saca del stack activo sin borrar el historial."
                  >
                    <Text style={styles.pauseText}>Pausar</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Mas contexto"
            title="Abrir paneles relacionados"
            subtitle="Navegacion clara hacia notificaciones e historial del modulo."
          />

          <LinkRow
            label="Notificaciones"
            description="Ajusta permisos, grupos y actividad reciente del sistema."
            onPress={() => router.push('/settings/notifications-settings' as never)}
            accentColor={Colors.supplements}
          />
          <LinkRow
            label="Historial de suplementos"
            description="Revisa adherencia, patrones y notas del stack."
            onPress={() => router.push('/modules/supplements/history' as never)}
            accentColor={Colors.supplements}
          />
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
  bodyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing[1],
    paddingVertical: Spacing[3],
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
  warningStack: {
    gap: Spacing[2],
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
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
  stack: {
    gap: Spacing[2],
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
});
