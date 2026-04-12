import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import VyraAnimation from '@/components/ui/VyraAnimation';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useKora } from '@/hooks/useKora';
import { useVyraCosmetics } from '@/hooks/useVyraCosmetics';
import { getKoraAssetUrl } from '@/lib/kora-visuals';
import { VYRA_ANIMATION_LABELS } from '@/lib/vyra-animations';

export default function KoraScreen() {
  const router = useRouter();
  const {
    koraName,
    descriptor,
    stageDescriptor,
    stageProgress,
    weeklyJournal,
    patternSummary,
    todayTruth,
    moduleMentions,
    cosmetics,
    equippedCosmetic,
    equippedCosmeticId,
    renameKora,
    isSavingName,
    equipCosmetic,
    isSavingCosmetic,
  } = useKora();
  const {
    skins,
    accessories,
    equippedSkin,
    equippedAccessory,
    isSavingSkin,
    isSavingAccessory,
    equipSkin,
    equipAccessory,
  } = useVyraCosmetics();

  const [draftName, setDraftName] = useState(koraName);
  const journalRef = useRef<View | null>(null);
  const progressPct =
    stageProgress.target && stageProgress.target > 0
      ? Math.min(100, Math.round((stageProgress.current / stageProgress.target) * 100))
      : 100;
  const koraAssetUrl = getKoraAssetUrl(descriptor.mood, stageDescriptor.stage);
  const ritualPrompts = [
    { label: 'Pulso', value: descriptor.signature },
    { label: 'Umbral', value: stageDescriptor.tagline },
    { label: 'Verdad de hoy', value: todayTruth },
  ];
  const ritualHighlights = [
    { label: 'enfoque', value: stageDescriptor.focus },
    { label: 'pilar fuerte', value: patternSummary.strongestMetric ?? 'Aprendiendo' },
    { label: 'aura', value: descriptor.aura },
  ];
  const shortFocus = stageDescriptor.focus.split(',')[0]?.split(' y ')[0]?.trim() || stageDescriptor.focus;
  const guideTitle =
    stageProgress.current <= 1
      ? 'Hoy conviene construir memoria con una sola accion real.'
      : patternSummary.strongestMetric
        ? `Hoy conviene sostener ${String(patternSummary.strongestMetric).toLowerCase()} antes de pedir mas.`
        : 'Hoy conviene sostener lo que ya esta vivo.';
  const guideBody = weeklyJournal?.narrative ?? todayTruth;
  const guideStats = [
    { label: 'aura', value: descriptor.aura },
    { label: 'enfoque', value: shortFocus },
    { label: 'pulso', value: patternSummary.strongestMetric ?? 'aprendiendo' },
  ];

  const handleShareJournal = async () => {
    if (!journalRef.current || !weeklyJournal) return;
    try {
      const uri = await captureRef(journalRef, { format: 'png', quality: 0.9 });
      const canShareFile = await Sharing.isAvailableAsync();
      if (canShareFile) {
        await Sharing.shareAsync(uri, { dialogTitle: 'Compartir resumen semanal' });
        return;
      }
      await Share.share({
        message: `${weeklyJournal.title}\n${weeklyJournal.narrative}`,
      });
    } catch {
      await Share.share({
        message: `${weeklyJournal.title}\n${weeklyJournal.narrative}`,
      });
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        eyebrow="Kora"
        title={koraName}
        subtitle="Companera visual para leer tu pulso y darte una direccion clara."
        showBack
        color={descriptor.accent}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} accentColor={descriptor.accent}>
          <View style={styles.heroTop}>
            <View style={[styles.heroGlyphWrap, { backgroundColor: `${descriptor.accent}18` }]}>
              {koraAssetUrl ? (
                <LottieView
                  source={{ uri: koraAssetUrl }}
                  autoPlay
                  loop
                  style={styles.heroLottie}
                />
              ) : (
                <Text
                  style={[styles.heroGlyph, { color: descriptor.accent }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.55}
                >
                  {descriptor.glyph}
                </Text>
              )}
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Estado de hoy</Text>
              <Text style={styles.heroTitle}>{descriptor.title}</Text>
              <Text style={styles.heroText} numberOfLines={3}>{descriptor.subtitle}</Text>
            </View>
          </View>
          <Text style={styles.truthText} numberOfLines={2}>{todayTruth}</Text>
          <Button onPress={() => router.push(Routes.dailySummary as any)} color={descriptor.accent} fullWidth>
            Abrir resumen diario
          </Button>
          <View style={styles.guideActions}>
            <Pressable style={styles.guidePill} onPress={() => router.push(Routes.coach.index as any)}>
              <Text style={styles.guidePillText}>Abrir coach</Text>
            </Pressable>
            <Pressable style={styles.guidePill} onPress={() => router.push(Routes.tabs.home as any)}>
              <Text style={styles.guidePillText}>Volver a home</Text>
            </Pressable>
          </View>
          <View style={styles.heroBadges}>
            <View style={[styles.heroBadge, { borderColor: `${descriptor.accent}40` }]}>
              <Text style={[styles.heroBadgeValue, { color: descriptor.accent }]}>{descriptor.aura}</Text>
              <Text style={styles.heroBadgeLabel}>Aura</Text>
            </View>
            <View style={[styles.heroBadge, { borderColor: `${descriptor.accent}40` }]}>
              <Text style={[styles.heroBadgeValue, { color: descriptor.accent }]}>{stageDescriptor.motif}</Text>
              <Text style={styles.heroBadgeLabel}>Etapa</Text>
            </View>
            {equippedCosmetic ? (
              <View style={[styles.heroBadge, { borderColor: `${descriptor.accent}40` }]}>
                <Text style={[styles.heroBadgeValue, { color: descriptor.accent }]}>{equippedCosmetic.name}</Text>
                <Text style={styles.heroBadgeLabel}>Accesorio</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.ritualRow}>
            {ritualHighlights.map((item, index) => (
              <View
                key={item.label}
                style={[styles.ritualChip, index === ritualHighlights.length - 1 && styles.ritualChipFull]}
              >
                <Text style={styles.ritualValue}>{item.value}</Text>
                <Text style={styles.ritualLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.signatureText}>{descriptor.signature}</Text>
          {moduleMentions.length > 0 ? (
            <View style={styles.moduleRow}>
              {moduleMentions.map((entry) => (
                <View key={entry} style={styles.moduleChip}>
                  <Text style={styles.moduleChipText}>{entry}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <Card style={styles.guideCard} accentColor={descriptor.accent}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Companera contextual</Text>
          <Text style={styles.sectionTitle}>{guideTitle}</Text>
          <Text style={styles.sectionHint} numberOfLines={2}>{guideBody}</Text>
          <View style={styles.guideMetrics}>
            {guideStats.map((item, index) => (
              <View
                key={item.label}
                style={[styles.guideMetric, index === guideStats.length - 1 && styles.guideMetricFull]}
              >
                <Text style={[styles.guideMetricValue, { color: descriptor.accent }]} numberOfLines={1}>
                  {item.value}
                </Text>
                <Text style={styles.guideMetricLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.oracleCard} accentColor={descriptor.accent}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Ritual de hoy</Text>
          <Text style={styles.sectionTitle}>Tres claves para entrar en sintonia con Kora</Text>
          <View style={styles.oracleList}>
            {ritualPrompts.map((item, index) => (
              <View key={item.label} style={styles.oracleItem}>
                <View style={[styles.oracleIndex, { backgroundColor: `${descriptor.accent}16`, borderColor: `${descriptor.accent}3A` }]}>
                  <Text style={[styles.oracleIndexText, { color: descriptor.accent }]}>{index + 1}</Text>
                </View>
                <View style={styles.oracleCopy}>
                  <Text style={styles.oracleLabel}>{item.label}</Text>
                  <Text style={styles.oracleText}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.signalCard}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Lectura corta</Text>
          <Text style={styles.sectionTitle}>Lo esencial que Kora esta viendo hoy</Text>
          <Text style={styles.sectionHint}>
            Kora resume lo que hoy ve en tu sistema: energia, constancia y el patron que se esta formando.
          </Text>
          <View style={styles.signalGrid}>
            <View style={styles.signalTile}>
              <Text style={[styles.signalValue, { color: descriptor.accent }]}>{descriptor.title}</Text>
              <Text style={styles.signalLabel}>estado</Text>
            </View>
            <View style={styles.signalTile}>
              <Text style={styles.signalValue}>{stageDescriptor.title}</Text>
              <Text style={styles.signalLabel}>etapa</Text>
            </View>
            <View style={styles.signalTile}>
              <Text style={styles.signalValue}>{patternSummary.strongestMetric ?? 'aprendiendo'}</Text>
              <Text style={styles.signalLabel}>fortaleza</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.vyraGallery}>
          <Text style={styles.sectionTitle}>Animaciones de Vyra</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vyraRow}
          >
            {VYRA_ANIMATION_LABELS.map((item) => (
              <View key={item.id} style={styles.vyraTile}>
                <VyraAnimation variant={item.id} size={72} />
                <Text style={styles.vyraLabel}>{item.label}</Text>
              </View>
            ))}
          </ScrollView>
        </Card>

        <Card style={styles.stageCard}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Evolucion viva</Text>
          <Text style={styles.sectionTitle}>Evolucion</Text>
          <View style={styles.stageHeader}>
            <Text style={styles.stageName}>{stageDescriptor.title}</Text>
            <Text style={styles.stageMeta}>
              {stageProgress.target ? `${stageProgress.current}/${stageProgress.target} dias` : 'Forma maxima alcanzada'}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.sectionHint}>{stageDescriptor.tagline}</Text>
          <View style={styles.stageFacts}>
            <View style={styles.stageFact}>
              <Text style={styles.stageFactLabel}>Motivo</Text>
              <Text style={styles.stageFactValue}>{stageDescriptor.motif}</Text>
            </View>
            <View style={styles.stageFact}>
              <Text style={styles.stageFactLabel}>Enfoque</Text>
              <Text style={styles.stageFactValue}>{stageDescriptor.focus}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.nameCard}>
          <Text style={styles.sectionTitle}>Nombre</Text>
          <Input
            label="Como quieres llamarla"
            value={draftName}
            onChangeText={setDraftName}
            maxLength={24}
            autoCapitalize="words"
            hint="Puedes dejar Kora o ponerle tu propio nombre."
          />
          <Button
            onPress={() => void renameKora(draftName)}
            loading={isSavingName}
            disabled={!draftName.trim() || draftName.trim() === koraName}
            fullWidth
          >
            Guardar nombre
          </Button>
        </Card>

        <Card style={styles.patternCard}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Memoria viva</Text>
          <Text style={styles.sectionTitle}>Lo que Kora ya reconoce en ti</Text>
          <MemoryRow label="Tu mejor día" value={patternSummary.strongestWeekday ?? 'Todavía aprendiendo'} />
          <MemoryRow label="Tu día más flojo" value={patternSummary.weakestWeekday ?? 'Todavía aprendiendo'} />
          <MemoryRow label="Tu pilar más fuerte" value={patternSummary.strongestMetric ?? 'Todavía aprendiendo'} />
        </Card>

        <Card style={styles.cosmeticCard}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Rastro visual</Text>
          <Text style={styles.sectionTitle}>Cosmeticos desbloqueables</Text>
          <Text style={styles.sectionHint}>
            Cada etapa abre accesorios nuevos. Puedes equipar uno a la vez.
          </Text>
          <View style={styles.cosmeticList}>
            <CosmeticRow
              title="Sin accesorio"
              description="Kora en estado natural."
              stageLabel="Base"
              glyph="NONE"
              unlocked
              equipped={!equippedCosmeticId}
              onPress={() => void equipCosmetic(null)}
              disabled={isSavingCosmetic || !equippedCosmeticId}
            />
            {cosmetics.map((cosmetic) => (
              <CosmeticRow
                key={cosmetic.id}
                title={cosmetic.name}
                description={cosmetic.description}
                stageLabel={`Etapa ${cosmetic.stage}`}
                glyph={cosmetic.glyph}
                unlocked={cosmetic.unlocked}
                equipped={cosmetic.id === equippedCosmeticId}
                onPress={() => void equipCosmetic(cosmetic.id)}
                disabled={isSavingCosmetic || !cosmetic.unlocked || cosmetic.id === equippedCosmeticId}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.vyraSkinCard}>
          <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Compania visible</Text>
          <Text style={styles.sectionTitle}>Skins y accesorios de VYRA</Text>
          <Text style={styles.sectionHint}>
            Desbloquea skins con coins, nivel o Premium. Los accesorios se compran en la tienda.
          </Text>
          <View style={styles.vyraEquipRow}>
            <View
              style={[
                styles.vyraEquipPreview,
                {
                  backgroundColor: equippedSkin?.background ?? Colors.bgElevated,
                  borderColor: equippedSkin?.accent ?? Colors.border,
                },
              ]}
            >
              <VyraAnimation variant="idle" size={52} />
            </View>
            <View style={styles.vyraEquipCopy}>
              <Text style={styles.vyraEquipTitle}>{equippedSkin?.name ?? 'Base'}</Text>
              <Text style={styles.vyraEquipSub}>
                {equippedAccessory ? `Accesorio: ${equippedAccessory.name}` : 'Sin accesorio'}
              </Text>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Skins</Text>
          <View style={styles.vyraGrid}>
            {skins.map((skin) => {
              const isEquipped = equippedSkin?.id === skin.id;
              return (
                <Pressable
                  key={skin.id}
                  onPress={() => void equipSkin(isEquipped ? null : skin.id)}
                  disabled={isSavingSkin || (!skin.unlocked && !isEquipped)}
                  style={[
                    styles.skinTile,
                    skin.unlocked ? styles.skinTileOn : styles.skinTileOff,
                    isEquipped && styles.skinTileEquipped,
                    { borderColor: `${skin.accent}55` },
                  ]}
                >
                  <Text style={styles.skinTileTitle}>{skin.name}</Text>
                  <Text style={styles.skinTileMeta}>{skin.unlockLabel}</Text>
                  {!skin.unlocked ? (
                    <Text style={styles.skinTileLocked}>{skin.lockedReason}</Text>
                  ) : null}
                  <Text style={[styles.skinTileAction, isEquipped && styles.skinTileActionEquipped]}>
                    {isEquipped ? 'Equipada' : skin.unlocked ? 'Equipar' : 'Bloqueada'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.subSectionTitle}>Accesorios</Text>
          <View style={styles.cosmeticList}>
            <AccessoryRow
              title="Sin accesorio"
              description="VYRA en estado natural."
              unlockLabel="Base"
              unlocked
              equipped={!equippedAccessory}
              onPress={() => void equipAccessory(null)}
              disabled={isSavingAccessory || !equippedAccessory}
            />
            {accessories.map((accessory) => (
                <AccessoryRow
                  key={accessory.id}
                  title={accessory.name}
                  description={accessory.unlocked ? 'Disponible para equipar.' : 'Desbloquealo en la tienda.'}
                  unlockLabel={accessory.unlockLabel}
                  unlocked={accessory.unlocked}
                  equipped={accessory.id === equippedAccessory?.id}
                  onPress={() => void equipAccessory(accessory.id)}
                  disabled={isSavingAccessory || !accessory.unlocked || accessory.id === equippedAccessory?.id}
              />
            ))}
          </View>
        </Card>

        {weeklyJournal ? (
          <Card style={styles.journalCard} accentColor={descriptor.accent}>
            <View ref={journalRef} collapsable={false} style={styles.journalShareCard}>
              <Text style={[styles.sectionEyebrow, { color: descriptor.accent }]}>Cronica semanal</Text>
              <Text style={styles.sectionTitle}>{weeklyJournal.title}</Text>
              <Text style={styles.journalNarrative}>{weeklyJournal.narrative}</Text>
              <View style={styles.journalBlock}>
                <Text style={styles.journalLabel}>Mejor momento</Text>
                <Text style={styles.journalText}>{weeklyJournal.bestMoment}</Text>
              </View>
              <View style={styles.journalBlock}>
                <Text style={styles.journalLabel}>Aviso gentil</Text>
                <Text style={styles.journalText}>{weeklyJournal.gentleWarning}</Text>
              </View>
              <View style={styles.journalBlock}>
                <Text style={styles.journalLabel}>Comparacion</Text>
                <Text style={styles.journalText}>{weeklyJournal.comparedToLastWeek}</Text>
              </View>
              <View style={styles.journalBlock}>
                <Text style={styles.journalLabel}>Lo que espera de ti</Text>
                <Text style={styles.journalText}>{weeklyJournal.nextWeekHint}</Text>
              </View>
            </View>
            <Button onPress={handleShareJournal} variant="secondary" fullWidth>
              Compartir resumen
            </Button>
          </Card>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

function MemoryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.memoryRow}>
      <Text style={styles.memoryLabel}>{label}</Text>
      <Text style={styles.memoryValue}>{value}</Text>
    </View>
  );
}

function CosmeticRow({
  title,
  description,
  stageLabel,
  glyph,
  unlocked,
  equipped,
  onPress,
  disabled,
}: {
  title: string;
  description: string;
  stageLabel: string;
  glyph: string;
  unlocked: boolean;
  equipped: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.cosmeticRow}>
      <View style={[styles.cosmeticGlyph, unlocked ? styles.cosmeticGlyphOn : styles.cosmeticGlyphOff]}>
        <Text style={styles.cosmeticGlyphText}>{glyph}</Text>
      </View>
      <View style={styles.cosmeticCopy}>
        <Text style={styles.cosmeticTitle}>{title}</Text>
        <Text style={styles.cosmeticDesc}>{description}</Text>
        <Text style={styles.cosmeticStage}>{stageLabel}</Text>
      </View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.cosmeticAction,
          equipped && styles.cosmeticActionEquipped,
          !unlocked && styles.cosmeticActionLocked,
        ]}
      >
        <Text
          style={[
            styles.cosmeticActionText,
            equipped && styles.cosmeticActionTextEquipped,
            !unlocked && styles.cosmeticActionTextLocked,
          ]}
        >
          {equipped ? 'Equipado' : unlocked ? 'Equipar' : 'Bloqueado'}
        </Text>
      </Pressable>
    </View>
  );
}

function AccessoryRow({
  title,
  description,
  unlockLabel,
  unlocked,
  equipped,
  onPress,
  disabled,
}: {
  title: string;
  description: string;
  unlockLabel: string;
  unlocked: boolean;
  equipped: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const glyph = unlocked ? 'ACC' : 'LOCK';
  return (
    <View style={styles.cosmeticRow}>
      <View style={[styles.cosmeticGlyph, unlocked ? styles.cosmeticGlyphOn : styles.cosmeticGlyphOff]}>
        <Text style={styles.cosmeticGlyphText}>{glyph}</Text>
      </View>
      <View style={styles.cosmeticCopy}>
        <Text style={styles.cosmeticTitle}>{title}</Text>
        <Text style={styles.cosmeticDesc}>{description}</Text>
        <Text style={styles.cosmeticStage}>{unlockLabel}</Text>
      </View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.cosmeticAction,
          equipped && styles.cosmeticActionEquipped,
          !unlocked && styles.cosmeticActionLocked,
        ]}
      >
        <Text
          style={[
            styles.cosmeticActionText,
            equipped && styles.cosmeticActionTextEquipped,
            !unlocked && styles.cosmeticActionTextLocked,
          ]}
        >
          {equipped ? 'Equipado' : unlocked ? 'Equipar' : 'Bloqueado'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[6],
  },
  guideCard: {
    gap: Spacing[2.5],
  },
  guideMetrics: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  guideMetric: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: 4,
  },
  guideMetricFull: {
    flexBasis: '100%',
  },
  guideMetricValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  guideMetricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  guideActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  guidePill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  guidePillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  heroCard: {
    gap: Spacing[3],
  },
  vyraGallery: {
    gap: Spacing[3],
  },
  vyraRow: {
    gap: Spacing[3],
    paddingRight: Spacing[3],
  },
  skinTile: {
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[3],
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 150,
  },
  vyraLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  heroTop: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  heroGlyphWrap: {
    width: 76,
    height: 76,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
  },
  heroGlyph: {
    fontFamily: FontFamily.bold,
    fontSize: 34,
    textAlign: 'center',
  },
  heroLottie: {
    width: 60,
    height: 60,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  heroText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  truthText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textPrimary,
  },
  signatureText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  heroBadge: {
    minWidth: 96,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 4,
  },
  heroBadgeValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  heroBadgeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  ritualRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  ritualChip: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: Radius.lg,
    padding: Spacing[3],
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  ritualChipFull: {
    flexBasis: '100%',
  },
  ritualValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  ritualLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  moduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  moduleChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moduleChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  signalCard: {
    gap: Spacing[3],
  },
  oracleCard: {
    gap: Spacing[3],
  },
  sectionEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.25,
  },
  oracleList: {
    gap: Spacing[3],
  },
  oracleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    padding: Spacing[3],
  },
  oracleIndex: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oracleIndexText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  oracleCopy: {
    flex: 1,
    gap: 4,
  },
  oracleLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  oracleText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  signalGrid: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  signalTile: {
    flex: 1,
    minWidth: 108,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: 4,
  },
  signalValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  signalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  stageCard: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  stageMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  stageFacts: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  stageFact: {
    flex: 1,
    minWidth: 120,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    padding: Spacing[3],
    gap: 4,
  },
  stageFactLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  stageFactValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  track: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
  },
  nameCard: {
    gap: Spacing[3],
  },
  patternCard: {
    gap: Spacing[3],
  },
  cosmeticCard: {
    gap: Spacing[3],
  },
  vyraSkinCard: {
    gap: Spacing[3],
  },
  cosmeticList: {
    gap: Spacing[2],
  },
  vyraEquipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  vyraEquipPreview: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vyraEquipCopy: {
    flex: 1,
    gap: 4,
  },
  vyraEquipTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  vyraEquipSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  subSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginTop: Spacing[2],
  },
  vyraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  vyraTile: {
    width: '47%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing[3],
    gap: 4,
  },
  skinTileOn: {
    backgroundColor: Colors.bgElevated,
  },
  skinTileOff: {
    backgroundColor: Colors.bgSurface,
    opacity: 0.7,
  },
  skinTileEquipped: {
    borderColor: `${Colors.success}55`,
    backgroundColor: Colors.successBg,
  },
  skinTileTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  skinTileMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  skinTileLocked: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.warning,
  },
  skinTileAction: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  skinTileActionEquipped: {
    color: Colors.success,
  },
  cosmeticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  cosmeticGlyph: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cosmeticGlyphOn: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}12`,
  },
  cosmeticGlyphOff: {
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  cosmeticGlyphText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  cosmeticCopy: {
    flex: 1,
    gap: 2,
  },
  cosmeticTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  cosmeticDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cosmeticStage: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  cosmeticAction: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: Colors.bgElevated,
  },
  cosmeticActionEquipped: {
    borderColor: `${Colors.success}55`,
    backgroundColor: Colors.successBg,
  },
  cosmeticActionLocked: {
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  cosmeticActionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  cosmeticActionTextEquipped: {
    color: Colors.success,
  },
  cosmeticActionTextLocked: {
    color: Colors.textMuted,
  },
  memoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  memoryLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  memoryValue: {
    maxWidth: '48%',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  journalCard: {
    gap: Spacing[3],
  },
  journalShareCard: {
    gap: Spacing[3],
  },
  journalNarrative: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 21,
    color: Colors.textPrimary,
  },
  journalBlock: {
    gap: 4,
  },
  journalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  journalText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
