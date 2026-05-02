import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { GOAL_OPTIONS } from '@/lib/onboarding-v2';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export default function EditProfileScreen() {
  const { profile, setProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);

  const initialName = profile?.name ?? '';
  const initialGoal = profile?.primary_goal ?? profile?.goal ?? 'general_health';

  const [name, setName] = useState(initialName);
  const [goal, setGoal] = useState(initialGoal);
  const [saving, setSaving] = useState(false);

  const trimmedName = normalizeText(name);

  const hasChanges = useMemo(() => {
    return (
      trimmedName !== normalizeText(initialName) ||
      goal !== initialGoal
    );
  }, [goal, initialGoal, initialName, trimmedName]);

  const canSave = Boolean(profile?.id) && trimmedName.length > 0 && hasChanges && !saving;

  async function handleSave() {
    if (!profile?.id || !trimmedName) return;
    setSaving(true);

    try {
      const payload = {
        name: trimmedName,
        goal,
        primary_goal: goal,
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      showToast('Perfil actualizado.', 'success');
      router.back();
    } catch {
      showToast('No se pudo guardar el perfil.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Editar perfil" showBack color={Colors.action} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.action}>
          <Text style={styles.eyebrow}>Identidad</Text>
          <Text style={styles.title}>Así quieres que VYRA te lea.</Text>
          <Text style={styles.body}>
            Cambia solo lo necesario. Inicio, Progreso y el resto del sistema usan esto para ajustar
            mejor el contexto del día.
          </Text>
        </Card>

        <Card>
          <Input
            label="Tu nombre"
            value={name}
            onChangeText={setName}
            placeholder="Como quieres verte en la app"
            maxLength={50}
            autoCapitalize="words"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Objetivo principal</Text>
          <Text style={styles.sectionHint}>
            No cambia quien eres: solo mueve la forma en que la app te ordena las prioridades.
          </Text>

          <View style={styles.goalStack}>
            {GOAL_OPTIONS.map((option) => {
              const active = goal === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setGoal(option.id)}
                  style={[
                    styles.goalCard,
                    active && {
                      borderColor: withOpacity(Colors.action, 0.5),
                      backgroundColor: withOpacity(Colors.action, 0.12),
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityHint={option.subtitle}
                  accessibilityState={{ selected: active }}
                  hitSlop={8}
                >
                  <View
                    style={[
                      styles.goalRail,
                      { backgroundColor: active ? Colors.action : withOpacity(Colors.white, 0.08) },
                    ]}
                  />
                  <View style={styles.goalCopy}>
                    <Text style={styles.goalLabel}>{option.label}</Text>
                    <Text style={styles.goalSubtitle}>{option.subtitle}</Text>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={18} color={Colors.action} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {hasChanges ? (
          <Button
            onPress={() => void handleSave()}
            loading={saving}
            disabled={!canSave}
            fullWidth
            color={Colors.action}
          >
            Guardar cambios
          </Button>
        ) : (
          <Text style={styles.idleHint}>No hay cambios pendientes.</Text>
        )}

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.action,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 30,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 19,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  goalStack: {
    gap: Spacing[2],
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  goalRail: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: Radius.full,
  },
  goalCopy: {
    flex: 1,
    gap: 2,
  },
  goalLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  goalSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  idleHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
