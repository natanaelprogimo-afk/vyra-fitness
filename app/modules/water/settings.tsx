import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { validateWaterGoal } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';
import { WaterModule } from '@/constants/strings';
import {
  getWaterContainerHint,
  validateWaterContainerAmount,
  WATER_DEFAULT_BOTTLE_ML,
  WATER_DEFAULT_GLASS_ML,
  WATER_DEFAULT_LARGE_GLASS_ML,
} from '@/lib/water';

const PRESET_GOALS = [
  { label: '1.5L', value: 1500, desc: WaterModule.dailyGoal.presets.low },
  { label: '2L', value: 2000, desc: WaterModule.dailyGoal.presets.moderate },
  { label: '2.5L', value: 2500, desc: WaterModule.dailyGoal.presets.recommended },
  { label: '3L', value: 3000, desc: WaterModule.dailyGoal.presets.athlete },
  { label: '3.5L', value: 3500, desc: WaterModule.dailyGoal.presets.hotClimate },
];

export default function WaterSettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const { updateUserProfile, isLoading } = useAuth();
  const waterGlassMl = useSettingsStore((state) => state.waterGlassMl);
  const waterLargeGlassMl = useSettingsStore((state) => state.waterLargeGlassMl);
  const waterBottleMl = useSettingsStore((state) => state.waterBottleMl);
  const setWaterGlassMl = useSettingsStore((state) => state.setWaterGlassMl);
  const setWaterLargeGlassMl = useSettingsStore((state) => state.setWaterLargeGlassMl);
  const setWaterBottleMl = useSettingsStore((state) => state.setWaterBottleMl);

  const [goal, setGoal] = useState((profile?.water_goal_ml ?? 2500).toString());
  const [glass, setGlass] = useState(String(waterGlassMl));
  const [largeGlass, setLargeGlass] = useState(String(waterLargeGlassMl));
  const [bottle, setBottle] = useState(String(waterBottleMl));
  const [error, setError] = useState<string | null>(null);
  const [glassError, setGlassError] = useState<string | null>(null);
  const [largeGlassError, setLargeGlassError] = useState<string | null>(null);
  const [bottleError, setBottleError] = useState<string | null>(null);

  const goalNumber = useMemo(() => parseInt(goal, 10) || 0, [goal]);
  const glassNumber = useMemo(() => parseInt(glass, 10) || 0, [glass]);
  const largeGlassNumber = useMemo(() => parseInt(largeGlass, 10) || 0, [largeGlass]);
  const bottleNumber = useMemo(() => parseInt(bottle, 10) || 0, [bottle]);

  const resetContainers = () => {
    setGlass(String(WATER_DEFAULT_GLASS_ML));
    setLargeGlass(String(WATER_DEFAULT_LARGE_GLASS_ML));
    setBottle(String(WATER_DEFAULT_BOTTLE_ML));
    setGlassError(null);
    setLargeGlassError(null);
    setBottleError(null);
  };

  const handleSave = async () => {
    const nextGoalError = validateWaterGoal(goalNumber);
    const nextGlassError = validateWaterContainerAmount('glass', glassNumber);
    const nextLargeGlassError = validateWaterContainerAmount('largeGlass', largeGlassNumber);
    const nextBottleError = validateWaterContainerAmount('bottle', bottleNumber);

    setError(nextGoalError);
    setGlassError(nextGlassError);
    setLargeGlassError(nextLargeGlassError);
    setBottleError(nextBottleError);

    if (nextGoalError || nextGlassError || nextLargeGlassError || nextBottleError) {
      return;
    }

    setWaterGlassMl(glassNumber);
    setWaterLargeGlassMl(largeGlassNumber);
    setWaterBottleMl(bottleNumber);

    const ok = await updateUserProfile({ water_goal_ml: goalNumber });
    if (ok) {
      router.back();
    }
  };

  return (
    <SafeScreen scrollable>
      <Header eyebrow={WaterModule.header.eyebrow} title={WaterModule.header.title} showBack color={Colors.water} />

      <Text style={styles.sectionTitle}>{WaterModule.dailyGoal.title}</Text>
      <Text style={styles.sectionSub}>
        {WaterModule.dailyGoal.description}
      </Text>

      <View style={styles.presets}>
        {PRESET_GOALS.map((preset) => (
          <Card
            key={preset.value}
            onPress={() => setGoal(preset.value.toString())}
            style={
              goalNumber === preset.value
                ? [styles.presetCard, { borderColor: Colors.water, backgroundColor: `${Colors.water}12` }]
                : styles.presetCard
            }
          >
            <Text style={[styles.presetLabel, goalNumber === preset.value && { color: Colors.water }]}>
              {preset.label}
            </Text>
            <Text style={styles.presetDesc}>{preset.desc}</Text>
          </Card>
        ))}
      </View>

      <Input
        label={WaterModule.dailyGoal.customLabel}
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        unit={WaterModule.dailyGoal.unit}
        error={error}
        hint={WaterModule.dailyGoal.customHint}
        style={styles.input}
      />

      <Card style={styles.infoCard}>
        <Text style={styles.infoEmoji}>{WaterModule.infoCard.eyebrow}</Text>
        <Text style={styles.infoText}>
          {WaterModule.infoCard.body}
        </Text>
      </Card>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderCopy}>
          <Text style={styles.sectionTitle}>{WaterModule.containers.title}</Text>
          <Text style={styles.sectionSub}>
            {WaterModule.containers.description}
          </Text>
        </View>
        <Pressable
          onPress={resetContainers}
          accessibilityRole="button"
          accessibilityLabel={WaterModule.containers.resetA11y}
          hitSlop={8}
        >
          <Text style={styles.sectionLink}>{WaterModule.containers.resetLabel}</Text>
        </Pressable>
      </View>

      <Input
        label={WaterModule.containers.glass}
        value={glass}
        onChangeText={setGlass}
        keyboardType="numeric"
        unit={WaterModule.dailyGoal.unit}
        error={glassError}
        hint={getWaterContainerHint('glass')}
        style={styles.input}
      />
      <Input
        label={WaterModule.containers.largeGlass}
        value={largeGlass}
        onChangeText={setLargeGlass}
        keyboardType="numeric"
        unit={WaterModule.dailyGoal.unit}
        error={largeGlassError}
        hint={getWaterContainerHint('largeGlass')}
        style={styles.input}
      />
      <Input
        label={WaterModule.containers.bottle}
        value={bottle}
        onChangeText={setBottle}
        keyboardType="numeric"
        unit={WaterModule.dailyGoal.unit}
        error={bottleError}
        hint={getWaterContainerHint('bottle')}
        style={styles.input}
      />

      <Card style={styles.infoCard}>
        <Text style={styles.infoEmoji}>{WaterModule.warningCard.eyebrow}</Text>
        <Text style={styles.infoText}>
          {WaterModule.warningCard.body}
        </Text>
      </Card>

      <Button onPress={() => router.push(Routes.settings.notificationsSettings)} variant="secondary" fullWidth color={Colors.water}>
        {WaterModule.buttons.openNotifications}
      </Button>

      <Button onPress={() => router.push(Routes.settings.appearance)} variant="ghost" fullWidth color={Colors.water}>
        {WaterModule.buttons.changeUnits}
      </Button>

      <Button onPress={handleSave} variant="primary" fullWidth size="lg" loading={isLoading} style={styles.cta}>
        {WaterModule.buttons.save}
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: Spacing[4],
    marginBottom: Spacing[1],
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionHeaderCopy: {
    flex: 1,
  },
  sectionLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.water,
    marginTop: Spacing[1],
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[5],
  },
  presetCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  presetLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  presetDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  input: {
    marginBottom: Spacing[3],
  },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
    backgroundColor: Colors.info,
    borderColor: `${Colors.info}33`,
    marginBottom: Spacing[4],
  },
  infoEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.info,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  cta: {},
});
