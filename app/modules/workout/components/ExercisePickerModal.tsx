import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { Exercise } from '@/hooks/useWorkout';

const MUSCLE_GROUPS = [
  'Todos', 'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas', 'Core', 'Cardio',
];

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePickerModal({
  visible,
  exercises,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle =
        selectedMuscle === 'Todos' ||
        ex.muscle_group.toLowerCase() === selectedMuscle.toLowerCase();
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, selectedMuscle]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar ejercicio</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Búsqueda */}
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          {/* Filtro por músculo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.muscleScroll}
            contentContainerStyle={styles.muscleList}
          >
            {MUSCLE_GROUPS.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.musclePill,
                  selectedMuscle === muscle && styles.musclePillActive,
                ]}
                onPress={() => setSelectedMuscle(muscle)}
              >
                <Text
                  style={[
                    styles.musclePillText,
                    selectedMuscle === muscle && styles.musclePillTextActive,
                  ]}
                >
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista */}
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
                    {item.muscle_group} · {item.equipment}
                  </Text>
                </View>
                <Text style={styles.exerciseArrow}>→</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No encontré ejercicios con ese filtro
                </Text>
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
    height: '80%',
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
    fontSize: 20,
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
  muscleScroll: {
    marginBottom: Spacing[3],
  },
  muscleList: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  musclePill: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  musclePillActive: {
    backgroundColor: Colors.workout,
  },
  musclePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  musclePillTextActive: {
    color: '#fff',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
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