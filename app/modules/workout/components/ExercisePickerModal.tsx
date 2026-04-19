import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

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

export function ExercisePickerModal({
  visible,
  exercises,
  equipmentType,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] =
    useState<(typeof MAIN_GROUPS)[number]>('Todos');
  const [selectedSubtype, setSelectedSubtype] = useState('Todos');

  const subtypeOptions = useMemo(() => {
    const candidates = exercises
      .filter((exercise) => {
        if (selectedGroup === 'Todos') return true;
        return getWorkoutExerciseMainGroup(exercise.muscle_group) === selectedGroup;
      })
      .map((exercise) => getWorkoutExerciseSubtype(exercise.name))
      .filter((value) => value !== 'Todos');

    return ['Todos', ...Array.from(new Set(candidates)).sort((left, right) => left.localeCompare(right))];
  }, [exercises, selectedGroup]);

  const filtered = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
      const mainGroup = getWorkoutExerciseMainGroup(exercise.muscle_group);
      const subtype = getWorkoutExerciseSubtype(exercise.name);
      const matchGroup = selectedGroup === 'Todos' || mainGroup === selectedGroup;
      const matchSubtype = selectedSubtype === 'Todos' || subtype === selectedSubtype;
      const matchEquipment = matchesEquipment(exercise, equipmentType);
      return matchSearch && matchGroup && matchSubtype && matchEquipment;
    });
  }, [equipmentType, exercises, search, selectedGroup, selectedSubtype]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar ejercicio</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

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
                  <TouchableOpacity
                    key={group}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => {
                      setSelectedGroup(group);
                      setSelectedSubtype('Todos');
                    }}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{group}</Text>
                  </TouchableOpacity>
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
                  <TouchableOpacity
                    key={subtype}
                    style={[styles.pill, styles.subtypePill, active && styles.subtypePillActive]}
                    onPress={() => setSelectedSubtype(subtype)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        styles.subtypePillText,
                        active && styles.pillTextActive,
                      ]}
                    >
                      {subtype}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => onSelect(item)}
              >
                <View style={styles.exerciseLeft}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMuscle}>
                    {getWorkoutExerciseMainGroup(item.muscle_group)} · {getWorkoutExerciseSubtype(item.name)} ·{' '}
                    {item.equipment}
                  </Text>
                </View>
                <Text style={styles.exerciseArrow}>{'>'}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No encontre ejercicios con ese filtro.</Text>
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
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  closeBtn: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textSecondary,
    padding: Spacing[1],
  },
  searchInput: {
    marginHorizontal: Spacing[5],
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
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
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  subtypePill: {
    backgroundColor: Colors.bgSurface,
  },
  subtypePillActive: {
    backgroundColor: Colors.actionBg,
    borderColor: Colors.action,
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
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    minHeight: 56,
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
  exerciseArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textMuted,
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
