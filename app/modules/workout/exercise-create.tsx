import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';

const TYPE_OPTIONS = ['strength', 'cardio', 'core', 'mobility'];

function parseListField(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function SelectPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
      accessibilityRole="radio"
      accessibilityLabel={`Tipo ${label}`}
      accessibilityState={{ selected: active }}
      hitSlop={8}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function WorkoutExerciseCreateScreen() {
  const params = useLocalSearchParams<{ seedExerciseId?: string }>();
  const { createExercise, exercises } = useWorkout();
  const seedExercise = useMemo(
    () => exercises.find((item) => item.id === String(params.seedExerciseId ?? '')) ?? null,
    [exercises, params.seedExerciseId],
  );

  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('strength');
  const [aliasesInput, setAliasesInput] = useState('');
  const [variationsInput, setVariationsInput] = useState('');
  const [cuesInput, setCuesInput] = useState('');
  const [mistakesInput, setMistakesInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!seedExercise) return;

    setName(`${seedExercise.name} variante`);
    setMuscle(seedExercise.muscle_group ?? '');
    setEquipment(seedExercise.equipment ?? '');
    setInstructions(seedExercise.instructions ?? '');
    setDescription(seedExercise.description ?? '');
    setType(seedExercise.type?.trim() || 'strength');
    setAliasesInput((seedExercise.aliases ?? []).join(', '));
    setVariationsInput((seedExercise.variations ?? []).join(', '));
    setCuesInput((seedExercise.cues ?? []).join('\n'));
    setMistakesInput((seedExercise.mistakes ?? []).join('\n'));
    setVideoUrl(seedExercise.video_url ?? '');
    setGifUrl(seedExercise.gif_url ?? '');
  }, [seedExercise?.id]);

  const formReady = useMemo(
    () => name.trim().length >= 3 && muscle.trim().length >= 2 && equipment.trim().length >= 2,
    [equipment, muscle, name],
  );

  const handleSave = async () => {
    if (!formReady) return;
    setSaving(true);
    const id = await createExercise({
      name: name.trim(),
      muscle_group: muscle.trim(),
      equipment: equipment.trim(),
      instructions: instructions.trim() || null,
      description: description.trim() || null,
      aliases: parseListField(aliasesInput),
      variations: parseListField(variationsInput),
      cues: parseListField(cuesInput),
      mistakes: parseListField(mistakesInput),
      video_url: videoUrl.trim() || null,
      gif_url: gifUrl.trim() || null,
      type: type.trim() || 'strength',
    });
    setSaving(false);
    if (id) {
      router.replace({ pathname: Routes.workout.exerciseDetail, params: { exerciseId: id } } as never);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title={seedExercise ? 'Crear variante' : 'Crear ejercicio'} color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{seedExercise ? 'Variante propia' : 'Movimiento propio'}</Text>
          <Text style={styles.heroTitle}>
            {seedExercise
              ? 'Parte de un ejercicio base y guardalo con tu propia variacion.'
              : 'Suma un ejercicio nuevo con el mismo lenguaje visual del resto del modulo.'}
          </Text>
          <Text style={styles.heroBody}>
            Primero dejalo claro y usable. Despues puedes enriquecerlo con media, cues, errores y variantes reales.
          </Text>
        </Card>

        <Card accentColor={Colors.workout} style={styles.card}>
          <Text style={styles.cardTitle}>Base del ejercicio</Text>
          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Sentadilla goblet" />
          <Input label="Grupo muscular" value={muscle} onChangeText={setMuscle} placeholder="Piernas" />
          <Input
            label="Equipo"
            value={equipment}
            onChangeText={setEquipment}
            placeholder="Mancuerna, polea o peso corporal"
          />

          <Text style={styles.blockLabel}>Tipo</Text>
          <View
            style={styles.pillRow}
            accessibilityRole="radiogroup"
            accessibilityLabel="Tipo de ejercicio"
          >
            {TYPE_OPTIONS.map((option) => (
              <SelectPill
                key={option}
                label={option}
                active={type === option}
                onPress={() => setType(option)}
              />
            ))}
          </View>

          <Input
            label="Descripcion corta"
            value={description}
            onChangeText={setDescription}
            placeholder="Para que sirve o cuando conviene usarlo"
            multiline
          />
          <Input
            label="Instrucciones"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Que debe sentir, como se mueve y que no hacer"
            multiline
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Soporte visual y tecnico</Text>
          <Input
            label="Video URL"
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="GIF URL"
            value={gifUrl}
            onChangeText={setGifUrl}
            placeholder="https://..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Cues"
            value={cuesInput}
            onChangeText={setCuesInput}
            placeholder="Una linea por cue o separado por comas"
            multiline
          />
          <Input
            label="Errores comunes"
            value={mistakesInput}
            onChangeText={setMistakesInput}
            placeholder="Que tiende a salir mal"
            multiline
          />
          <Input
            label="Aliases"
            value={aliasesInput}
            onChangeText={setAliasesInput}
            placeholder="Nombres alternativos separados por coma"
            multiline
          />
          <Input
            label="Variantes"
            value={variationsInput}
            onChangeText={setVariationsInput}
            placeholder="Goblet, talones elevados, tempo, etc."
            multiline
          />

          <Button
            onPress={() => void handleSave()}
            loading={saving}
            disabled={!formReady}
            fullWidth
            color={Colors.workout}
          >
            {seedExercise ? 'Guardar variante' : 'Guardar ejercicio'}
          </Button>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[2],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.workout,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    gap: Spacing[2],
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  blockLabel: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: Colors.surface2,
  },
  pillActive: {
    borderColor: Colors.workout,
    backgroundColor: Colors.workout,
  },
  pillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.workout,
  },
});
