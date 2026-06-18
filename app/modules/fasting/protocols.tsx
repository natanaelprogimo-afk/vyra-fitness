import { useMemo, useState } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useFasting, PROTOCOLS } from '@/hooks/useFasting';
import { useUIStore } from '@/stores/uiStore';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

// FIX #15: Added targetHours to EXTRA_PROTOCOLS so downstream code
// (history progress bars, analysis) doesn't get undefined for these protocols.
const EXTRA_PROTOCOLS: Record<string, { label: string; description: string; targetHours: number }> = {
  OMAD:  { label: 'OMAD', description: 'Una comida al día.',                               targetHours: 23 },
  '24h': { label: '24h',  description: 'Ayuno completo de 24 horas.',                      targetHours: 24 },
  '5:2': { label: '5:2',  description: '5 días normal + 2 días con restricción calórica.', targetHours: 16 },
};

const PROTOCOL_DIFFICULTY: Record<string, 'beginner' | 'moderate' | 'advanced' | 'extreme'> = {
  '12:12': 'beginner',
  '14:10': 'beginner',
  '16:8':  'moderate',
  '18:6':  'moderate',
  '20:4':  'advanced',
  '23:1':  'extreme',
  OMAD:    'extreme',
  '24h':   'extreme',
  '5:2':   'advanced',
};

const DIFFICULTY_META: Record<string, { label: string; color: string; emoji: string }> = {
  beginner: { label: 'Principiante', color: Colors.success, emoji: '🌱' },
  moderate: { label: 'Moderado',     color: Colors.fasting, emoji: '⚡' },
  advanced: { label: 'Avanzado',     color: Colors.warning, emoji: '🔥' },
  extreme:  { label: 'Exigente',     color: '#EF4444',      emoji: '⚠️' },
};

const RISKY_PROTOCOLS = new Set(['20:4', '23:1', 'OMAD', '24h', '5:2']);

/** Extrae horas de ayuno y ventana de comer de un protocolo string como "16:8" */
function parseProtocolHours(id: string): { fasting: number; eating: number } | null {
  const match = id.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  return { fasting: parseInt(match[1], 10), eating: parseInt(match[2], 10) };
}

/** Visualización de la ventana de 24h dividida entre ayuno y comer */
function FastingWindowBar({ protocolId, color }: { protocolId: string; color: string }) {
  if (protocolId === '5:2') {
    return (
      <View style={windowStyles.container}>
        <View style={windowStyles.weekPattern}>
          {['Normal', 'Normal', 'Ayuno', 'Normal', 'Normal', 'Ayuno', 'Libre'].map((label, index) => {
            const fastingDay = label === 'Ayuno';
            return (
              <View
                key={`${label}-${index}`}
                style={[
                  windowStyles.weekChip,
                  fastingDay
                    ? {
                        backgroundColor: withOpacity(color, 0.18),
                        borderColor: withOpacity(color, 0.34),
                      }
                    : windowStyles.weekChipNeutral,
                ]}
              >
                <Text
                  style={[
                    windowStyles.weekChipText,
                    fastingDay ? { color } : windowStyles.weekChipTextNeutral,
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const hours = parseProtocolHours(protocolId);

  // FIX #16: For non-standard protocols (OMAD, 24h, 5:2) show a descriptive
  // fallback bar instead of returning null silently.
  if (!hours) {
    const fallbackMap: Record<string, { fasting: number; eating: number }> = {
      OMAD:  { fasting: 23, eating: 1 },
      '24h': { fasting: 24, eating: 0 },
    };
    const fallback = fallbackMap[protocolId];
    if (!fallback) return null;

    return (
      <View style={windowStyles.container}>
        <View style={windowStyles.bar}>
          <View style={[windowStyles.fastingSegment, {
            flex: fallback.fasting,
            backgroundColor: withOpacity(color, 0.25),
            borderRightWidth: fallback.eating > 0 ? 1 : 0,
            borderRightColor: withOpacity(color, 0.4),
          }]}>
            <Text style={[windowStyles.segLabel, { color }]}>{fallback.fasting}h ayuno</Text>
          </View>
          {fallback.eating > 0 && (
            <View style={[windowStyles.eatingSegment, { flex: fallback.eating }]}>
              <Text style={[windowStyles.segLabel, { color: Colors.textMuted }]}>{fallback.eating}h comida</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  const { fasting, eating } = hours;

  return (
    <View style={windowStyles.container}>
      <View style={windowStyles.bar}>
        <View style={[windowStyles.fastingSegment, {
          flex: fasting,
          backgroundColor: withOpacity(color, 0.25),
          borderRightWidth: 1,
          borderRightColor: withOpacity(color, 0.4),
        }]}>
          <Text style={[windowStyles.segLabel, { color }]}>{fasting}h ayuno</Text>
        </View>
        <View style={[windowStyles.eatingSegment, { flex: eating }]}>
          <Text style={[windowStyles.segLabel, { color: Colors.textMuted }]}>{eating}h comida</Text>
        </View>
      </View>
    </View>
  );
}

const windowStyles = StyleSheet.create({
  container: { marginTop: Spacing[2] },
  bar: {
    flexDirection: 'row',
    height: 28,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.elevated,
  },
  fastingSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eatingSegment: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: withOpacity(Colors.success, 0.1),
  },
  weekPattern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
  },
  weekChip: {
    minWidth: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekChipNeutral: {
    backgroundColor: Colors.elevated,
    borderColor: Colors.border,
  },
  weekChipText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  weekChipTextNeutral: {
    color: Colors.textMuted,
  },
  segLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

const DIFFICULTY_ORDER = ['beginner', 'moderate', 'advanced', 'extreme'] as const;

export default function FastingProtocolsScreen() {
  const { startFast, isStarting, isActive } = useFasting();
  const showToast = useUIStore((s) => s.showToast);
  const [selected, setSelected] = useState<string>('16:8');
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  const protocolOptions = useMemo(() => {
    const base = Object.entries(PROTOCOLS)
      .filter(([id]) => id !== 'custom' && id !== 'OMAD')
      .map(([id, data]) => ({
        id,
        label: id === '23:1' ? '23:1 / OMAD' : data.label,
        description: id === '23:1' ? 'Ventana mínima con una comida principal al día.' : data.description,
        difficulty: PROTOCOL_DIFFICULTY[id] ?? 'moderate',
      }));
    const extra = Object.entries(EXTRA_PROTOCOLS)
      .filter(([id]) => id !== 'OMAD')
      .map(([id, data]) => ({
        id,
        label: data.label,
        description: data.description,
        difficulty: PROTOCOL_DIFFICULTY[id] ?? 'advanced',
      }));

    const map = new Map<string, { id: string; label: string; description: string; difficulty: string }>();
    base.forEach((p) => map.set(p.id, p));
    extra.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, []);

  const grouped = useMemo(() => {
    return DIFFICULTY_ORDER
      .map((diff) => ({
        difficulty: diff,
        protocols: protocolOptions.filter((p) => p.difficulty === diff),
      }))
      .filter((g) => g.protocols.length > 0);
  }, [protocolOptions]);

  // FIX #14: handleSelect no longer shows the medical modal — that was firing
  // on mere selection (browsing), not on intent to start. The medical modal
  // is now triggered only from the "Iniciar" button press.
  const handleSelect = (id: string) => {
    setSelected(id);
  };

  // FIX #13: confirmStart uses `startFast(selected, { onSuccess })` consistently.
  // This matches the hook signature used throughout the app and ensures the
  // callback actually runs after the fast is created.
  const confirmStart = () => {
    setShowMedicalModal(false);
    if (isActive) {
      showToast('Ya hay un ayuno en curso.', 'info');
      return;
    }
    startFast({ protocol: selected }, {
      onSuccess: () => router.back(),
    });
  };

  const handleStartPress = () => {
    if (isActive) {
      showToast('Ya hay un ayuno en curso.', 'info');
      return;
    }
    if (RISKY_PROTOCOLS.has(selected)) {
      // FIX #14: Show medical modal only on start intent, not on selection
      setShowMedicalModal(true);
      return;
    }
    startFast({ protocol: selected }, { onSuccess: () => router.back() });
  };

  const selectedIsRisky = RISKY_PROTOCOLS.has(selected);

  return (
    <ModuleScaffold
      title="Protocolos de ayuno"
      color={Colors.fasting}
      tabs={<FastingModuleTabs active="protocols" />}
      contentContainerStyle={styles.content}
    >
        {/* Intro card */}
        <Card>
          <Text style={styles.title}>Elegí tu protocolo</Text>
          <Text style={styles.subtitle}>
            Seleccioná el que mejor se adapte a tu rutina y nivel de experiencia actual.
          </Text>
        </Card>

        {/* Info card 5:2 (contextual) */}
        {selected === '5:2' && !showMedicalModal && (
          <Card style={styles.fiveTwoInfoCard} shadow={false}>
            <Text style={styles.fiveTwoInfoTitle}>ℹ️ Cómo funciona el 5:2</Text>
            <Text style={styles.fiveTwoInfoText}>
              Elegís dos días por semana para ayunar. VYRA los planifica automáticamente
              y te recuerda. Los días normales no requieren ninguna acción.
            </Text>
            <Text style={styles.fiveTwoInfoHint}>
              Configurá tus días de ayuno en Ajustes → Programa 5:2.
            </Text>
          </Card>
        )}

        {/* Protocolos agrupados por dificultad */}
        {grouped.map(({ difficulty, protocols }) => {
          const meta = DIFFICULTY_META[difficulty];
          return (
            <View key={difficulty} style={styles.difficultyGroup}>
              {/* Header de grupo */}
              <View style={styles.groupHeader}>
                <Text style={styles.groupEmoji}>{meta.emoji}</Text>
                <Text style={[styles.groupLabel, { color: meta.color }]}>{meta.label}</Text>
                <View style={[styles.groupLine, { backgroundColor: withOpacity(meta.color, 0.2) }]} />
              </View>

              {/* Cards de protocolo */}
              {protocols.map((protocol) => {
                const isSelected = selected === protocol.id;
                const isRisky = RISKY_PROTOCOLS.has(protocol.id);

                return (
                  <Pressable
                    key={protocol.id}
                    onPress={() => handleSelect(protocol.id)}
                    style={[
                      styles.protocolCard,
                      isSelected && styles.protocolCardActive,
                      isSelected && isRisky && styles.protocolCardRisky,
                    ]}
                    accessibilityRole="radio"
                    accessibilityLabel={protocol.label}
                    accessibilityHint={protocol.description}
                    accessibilityState={{ selected: isSelected }}
                    hitSlop={8}
                  >
                    {/* Encabezado */}
                    <View style={styles.protocolHeader}>
                      <View style={styles.protocolTitleRow}>
                        {isSelected && (
                          <View style={[styles.selectedDot, { backgroundColor: isRisky ? Colors.warning : Colors.fasting }]} />
                        )}
                        <Text style={[
                          styles.protocolLabel,
                          isSelected && (isRisky ? styles.protocolLabelRisky : styles.protocolLabelActive)
                        ]}>
                          {protocol.label}
                        </Text>
                      </View>

                      {isSelected && (
                        <View style={[
                          styles.selectedBadge,
                          { backgroundColor: withOpacity(isRisky ? Colors.warning : Colors.fasting, 0.12) }
                        ]}>
                          <Text style={[styles.selectedBadgeText, { color: isRisky ? Colors.warning : Colors.fasting }]}>
                            Seleccionado
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.protocolDescription}>{protocol.description}</Text>

                    {/* Barra visual de ventana */}
                    <FastingWindowBar
                      protocolId={protocol.id}
                      color={isRisky ? Colors.warning : Colors.fasting}
                    />

                    {/* Advertencia inline — only when selected AND risky
                        FIX #14: removed the medical modal trigger from here */}
                    {isSelected && isRisky && (
                      <View style={styles.riskyRow}>
                        <Text style={styles.riskyWarning}>
                          ⚠ Consultá un profesional si tenés condiciones médicas o dudas clínicas
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {/* FIX #13 + #14: Unified start handler — risky check happens here */}
        <Button
          label={`Iniciar ${selected}`}
          onPress={handleStartPress}
          loading={isStarting}
          color={selectedIsRisky ? Colors.warning : Colors.fasting}
          style={styles.startBtn}
          disabled={isActive}
          fullWidth
        />

      {/* Medical modal — now only triggered from start intent, not from selection */}
      <Modal
        visible={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        title="Aviso médico"
        ctaLabel="Entiendo y continuar"
        onCta={confirmStart}
      >
        <Text style={styles.modalText}>
          Este protocolo puede ser exigente. Si tenés alguna condición médica, antecedentes de
          trastornos alimentarios, estás embarazada o tenés dudas clínicas, consultá a un
          profesional de salud antes de continuar.
        </Text>
      </Modal>
    </ModuleScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Grupos por dificultad
  difficultyGroup: {
    gap: Spacing[2],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  groupEmoji: { fontSize: 14, color: Colors.textPrimary },
  groupLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupLine: {
    flex: 1,
    height: 1,
  },

  // Cards
  protocolCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  protocolCardActive: {
    borderColor: Colors.fasting,
    backgroundColor: withOpacity(Colors.fasting, 0.06),
  },
  protocolCardRisky: {
    borderColor: Colors.warning,
    backgroundColor: withOpacity(Colors.warning, 0.05),
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  protocolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  protocolLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  protocolLabelActive: { color: Colors.fasting },
  protocolLabelRisky: { color: Colors.warning },
  selectedBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  selectedBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  protocolDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  riskyRow: {
    backgroundColor: withOpacity(Colors.warning, 0.08),
    borderRadius: Radius.lg,
    padding: Spacing[2],
  },
  riskyWarning: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.warning,
    lineHeight: 16,
  },
  startBtn: { marginTop: Spacing[2] },
  modalText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  fiveTwoInfoCard: {
    padding: Spacing[4],
    gap: Spacing[2],
    backgroundColor: Colors.bgSurface,
  },
  fiveTwoInfoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  fiveTwoInfoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  fiveTwoInfoHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

