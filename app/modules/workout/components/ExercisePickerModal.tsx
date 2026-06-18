import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { type Exercise } from '@/hooks/useWorkout';
import {
  getWorkoutExerciseMainGroup,
  getWorkoutExerciseSubtype,
} from '@/lib/workout-session';

const MAIN_GROUPS = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'] as const;

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  equipmentType?: string | null;
  currentExerciseId?: string | null;
  currentMuscleGroup?: string | null;
  activeExerciseIds?: string[];
  favoriteExerciseIds?: string[];
  recentExerciseIds?: string[];
  activeLabel?: string;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

type QuickSection = {
  key: string;
  title: string;
  body: string;
  items: Exercise[];
};

function matchesEquipment(exercise: Exercise, equipmentType?: string | null) {
  if (!equipmentType) return true;

  const normalized = equipmentType.toLowerCase();
  const equipment = exercise.equipment.toLowerCase();

  if (normalized.includes('gym')) return true;
  if (normalized.includes('bodyweight')) {
    return (
      equipment.includes('peso corporal') ||
      equipment.includes('colchoneta') ||
      equipment.includes('pared') ||
      equipment.includes('silla') ||
      equipment.includes('step')
    );
  }
  if (normalized.includes('home')) {
    return (
      equipment.includes('mancuer') ||
      equipment.includes('banda') ||
      equipment.includes('peso corporal') ||
      equipment.includes('colchoneta') ||
      equipment.includes('silla') ||
      equipment.includes('kettlebell')
    );
  }
  return true;
}

function uniqueExercisesFromIds(ids: string[] | undefined, exercises: Exercise[]) {
  if (!ids?.length) return [];
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const seen = new Set<string>();

  return ids.flatMap((id) => {
    if (seen.has(id)) return [];
    seen.add(id);
    const match = byId.get(id);
    return match ? [match] : [];
  });
}

export function ExercisePickerModal({
  visible,
  exercises,
  equipmentType,
  currentExerciseId,
  currentMuscleGroup,
  activeExerciseIds = [],
  favoriteExerciseIds = [],
  recentExerciseIds = [],
  activeLabel = 'Ya agregado',
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] =
    useState<(typeof MAIN_GROUPS)[number]>('Todos');
  const [selectedSubtype, setSelectedSubtype] = useState('Todos');

  const activeIdSet = useMemo(() => new Set(activeExerciseIds), [activeExerciseIds]);
  const favoriteIdSet = useMemo(() => new Set(favoriteExerciseIds), [favoriteExerciseIds]);
  const recentIdSet = useMemo(() => new Set(recentExerciseIds), [recentExerciseIds]);
  const currentMainGroup = useMemo(
    () => (currentMuscleGroup ? getWorkoutExerciseMainGroup(currentMuscleGroup) : null),
    [currentMuscleGroup],
  );
  const equipmentReadyExercises = useMemo(
    () => exercises.filter((exercise) => matchesEquipment(exercise, equipmentType)),
    [equipmentType, exercises],
  );

  const getPriorityScore = (exercise: Exercise) =>
    (activeIdSet.has(exercise.id) ? 6 : 0) +
    (favoriteIdSet.has(exercise.id) ? 4 : 0) +
    (recentIdSet.has(exercise.id) ? 2 : 0);

  const subtypeOptions = useMemo(() => {
    const candidates = equipmentReadyExercises
      .filter((exercise) => {
        if (selectedGroup === 'Todos') return true;
        return getWorkoutExerciseMainGroup(exercise.muscle_group) === selectedGroup;
      })
      .map((exercise) => getWorkoutExerciseSubtype(exercise.name))
      .filter((value) => value !== 'Todos');

    return ['Todos', ...Array.from(new Set(candidates)).sort((left, right) => left.localeCompare(right))];
  }, [equipmentReadyExercises, selectedGroup]);

  const recentQuickAdds = useMemo(
    () => uniqueExercisesFromIds(recentExerciseIds, equipmentReadyExercises).slice(0, 6),
    [equipmentReadyExercises, recentExerciseIds],
  );

  const favoriteQuickAdds = useMemo(
    () =>
      uniqueExercisesFromIds(favoriteExerciseIds, equipmentReadyExercises)
        .filter((exercise) => !recentIdSet.has(exercise.id))
        .slice(0, 6),
    [equipmentReadyExercises, favoriteExerciseIds, recentIdSet],
  );

  const focusQuickAdds = useMemo(() => {
    const filtered = equipmentReadyExercises.filter((exercise) => {
      if (exercise.id === currentExerciseId) return false;
      if (!currentMainGroup) return true;
      return getWorkoutExerciseMainGroup(exercise.muscle_group) === currentMainGroup;
    });

    return [...filtered]
      .sort((left, right) => {
        const scoreDiff = getPriorityScore(right) - getPriorityScore(left);
        if (scoreDiff !== 0) return scoreDiff;
        return left.name.localeCompare(right.name);
      })
      .slice(0, 6);
  }, [activeIdSet, currentExerciseId, currentMainGroup, equipmentReadyExercises, favoriteIdSet, recentIdSet]);

  const quickSections = useMemo<QuickSection[]>(() => {
    const sections: QuickSection[] = [];

    if (focusQuickAdds.length) {
      sections.push({
        key: 'focus',
        title: currentMainGroup ? `Atajos de ${currentMainGroup}` : 'Atajos sugeridos',
        body: currentMainGroup
          ? 'Opciones rápidas para seguir el mismo estímulo sin rebuscar.'
          : 'Sugerencias rápidas según tu equipo y tu historial.',
        items: focusQuickAdds,
      });
    }

    if (recentQuickAdds.length) {
      sections.push({
        key: 'recent',
        title: 'Usados hace poco',
        body: 'Para repetir patrones que ya vienes trabajando.',
        items: recentQuickAdds,
      });
    }

    if (favoriteQuickAdds.length) {
      sections.push({
        key: 'favorites',
        title: 'Favoritos',
        body: 'Tus ejercicios más confiables para sumar en segundos.',
        items: favoriteQuickAdds,
      });
    }

    return sections;
  }, [currentMainGroup, favoriteQuickAdds, focusQuickAdds, recentQuickAdds]);

  const filtered = useMemo(() => {
    return equipmentReadyExercises.filter((exercise) => {
      const matchSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
      const mainGroup = getWorkoutExerciseMainGroup(exercise.muscle_group);
      const subtype = getWorkoutExerciseSubtype(exercise.name);
      const matchGroup = selectedGroup === 'Todos' || mainGroup === selectedGroup;
      const matchSubtype = selectedSubtype === 'Todos' || subtype === selectedSubtype;
      return matchSearch && matchGroup && matchSubtype;
    });
  }, [equipmentReadyExercises, search, selectedGroup, selectedSubtype]);

  const showQuickSections = search.trim().length === 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Agregar ejercicio</Text>
              <Text style={styles.headerBody}>Usa atajos arriba o busca en todo el catálogo.</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector de ejercicios"
              accessibilityHint="Vuelve a la sesión sin agregar un ejercicio."
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressablePressed]}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          {showQuickSections && quickSections.length ? (
            <View style={styles.quickBlock}>
              {quickSections.map((section) => (
                <View key={section.key} style={styles.quickSection}>
                  <View style={styles.quickSectionCopy}>
                    <Text style={styles.quickSectionTitle}>{section.title}</Text>
                    <Text style={styles.quickSectionBody}>{section.body}</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickScroll}
                  >
                    {section.items.map((exercise) => {
                      const alreadyActive = activeIdSet.has(exercise.id);
                      return (
                        <Pressable
                          key={`${section.key}-${exercise.id}`}
                          onPress={() => onSelect(exercise)}
                          style={({ pressed }) => [
                            styles.quickCard,
                            alreadyActive && styles.quickCardActive,
                            pressed && styles.pressablePressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={exercise.name}
                          accessibilityHint="Agrega este ejercicio con un solo toque."
                        >
                          <Text style={styles.quickCardTitle} numberOfLines={2}>
                            {exercise.name}
                          </Text>
                          <Text style={styles.quickCardMeta} numberOfLines={2}>
                            {getWorkoutExerciseMainGroup(exercise.muscle_group)} · {getWorkoutExerciseSubtype(exercise.name)}
                          </Text>
                          <Text style={styles.quickCardEquipment} numberOfLines={1}>
                            {exercise.equipment}
                          </Text>
                          {alreadyActive ? (
                            <View style={styles.quickCardBadge}>
                              <Text style={styles.quickCardBadgeText}>{activeLabel}</Text>
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.filterBlock}>
            <Text style={styles.filterLabel}>Grupo principal</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillList}
            >
              {MAIN_GROUPS.map((group) => {
                const active = selectedGroup === group;
                return (
                  <Pressable
                    key={group}
                    style={({ pressed }) => [
                      styles.pill,
                      active && styles.pillActive,
                      pressed && styles.pressablePressed,
                    ]}
                    onPress={() => {
                      setSelectedGroup(group);
                      setSelectedSubtype('Todos');
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={`Grupo ${group}`}
                    accessibilityState={{ selected: active }}
                    hitSlop={8}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{group}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterBlock}>
            <Text style={styles.filterLabel}>Subtipo</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillList}
            >
              {subtypeOptions.map((subtype) => {
                const active = selectedSubtype === subtype;
                return (
                  <Pressable
                    key={subtype}
                    style={({ pressed }) => [
                      styles.pill,
                      styles.subtypePill,
                      active && styles.subtypePillActive,
                      pressed && styles.pressablePressed,
                    ]}
                    onPress={() => setSelectedSubtype(subtype)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Subtipo ${subtype}`}
                    accessibilityState={{ selected: active }}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        styles.subtypePillText,
                        active && styles.subtypePillTextActive,
                      ]}
                    >
                      {subtype}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const alreadyActive = activeIdSet.has(item.id);
              return (
                <Pressable
                  style={({ pressed }) => [styles.exerciseItem, pressed && styles.exerciseItemPressed]}
                  onPress={() => onSelect(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  accessibilityHint="Agrega este ejercicio a la sesión."
                >
                  <View style={styles.exerciseLeft}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseMuscle}>
                      {getWorkoutExerciseMainGroup(item.muscle_group)} · {getWorkoutExerciseSubtype(item.name)} · {item.equipment}
                    </Text>
                    {alreadyActive ? (
                      <View style={styles.exerciseStatePill}>
                        <Text style={styles.exerciseStateText}>{activeLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No encontré ejercicios con ese filtro.</Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingTop: Spacing[5],
    height: '84%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    gap: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  headerBody: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    marginHorizontal: Spacing[5],
    backgroundColor: Colors.elevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  quickBlock: {
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  quickSection: {
    gap: Spacing[2],
  },
  quickSectionCopy: {
    paddingHorizontal: Spacing[5],
    gap: 4,
  },
  quickSectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  quickSectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  quickScroll: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  quickCard: {
    width: 188,
    minHeight: 126,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 6,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickCardActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryBg,
  },
  quickCardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  quickCardMeta: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  quickCardEquipment: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  quickCardBadge: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
  },
  quickCardBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  filterBlock: {
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  filterLabel: {
    paddingHorizontal: Spacing[5],
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pillList: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  pill: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: Colors.elevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  subtypePill: {
    backgroundColor: Colors.bgSurface,
  },
  subtypePillActive: {
    backgroundColor: Colors.secondaryBg,
    borderColor: Colors.secondary,
  },
  pillText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  subtypePillText: {
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: '#fff',
  },
  subtypePillTextActive: {
    color: Colors.textPrimary,
  },
  pressablePressed: {
    opacity: 0.88,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    minHeight: 56,
  },
  exerciseItemPressed: {
    backgroundColor: Colors.elevated,
  },
  exerciseLeft: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  exerciseMuscle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exerciseStatePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    backgroundColor: Colors.secondaryBg,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  exerciseStateText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[5],
  },
  emptyContainer: {
    padding: Spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default ExercisePickerModal;

