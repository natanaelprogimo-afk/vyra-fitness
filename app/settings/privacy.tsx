import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/user';

type ConsentKey = 'mental' | 'female' | 'journal';
type PrivacyKey = ConsentKey | 'strict_sensitive_mode';
type ConsentMap = Record<ConsentKey, boolean>;

const DEFAULT_CONSENTS: ConsentMap = {
  mental: false,
  female: false,
  journal: false,
};

function getMemory(profile: UserProfile | null): Record<string, unknown> {
  if (profile?.coach_memory_json && typeof profile.coach_memory_json === 'object') {
    return profile.coach_memory_json as Record<string, unknown>;
  }
  return {};
}

function getConsents(profile: UserProfile | null): ConsentMap {
  const raw = getMemory(profile).ai_sensitive_consents;
  if (!raw || typeof raw !== 'object') return DEFAULT_CONSENTS;

  return {
    mental: Boolean((raw as Record<string, unknown>).mental),
    female: Boolean((raw as Record<string, unknown>).female),
    journal: Boolean((raw as Record<string, unknown>).journal),
  };
}

function getStrictSensitiveMode(profile: UserProfile | null): boolean {
  return Boolean(getMemory(profile).privacy_strict_sensitive_mode);
}

export default function PrivacyCenterScreen() {
  const { profile, setProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [savingKey, setSavingKey] = useState<PrivacyKey | null>(null);

  const consents = useMemo(() => getConsents(profile), [profile]);
  const strictSensitiveMode = useMemo(() => getStrictSensitiveMode(profile), [profile]);

  const updatePrivacySetting = async (key: PrivacyKey, value: boolean) => {
    if (!profile?.id) return;

    setSavingKey(key);
    try {
      const currentMemory = getMemory(profile);
      const currentConsents =
        currentMemory.ai_sensitive_consents && typeof currentMemory.ai_sensitive_consents === 'object'
          ? (currentMemory.ai_sensitive_consents as Record<string, unknown>)
          : {};

      const nextMemory = {
        ...currentMemory,
        ai_sensitive_consents: {
          ...currentConsents,
          ...(key === 'strict_sensitive_mode' ? {} : { [key]: value }),
        },
        ...(key === 'strict_sensitive_mode'
          ? { privacy_strict_sensitive_mode: value }
          : {}),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update({
          coach_memory_json: nextMemory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;

      setProfile(data as any);
      showToast('Privacidad actualizada.', 'success');
    } catch {
      showToast('No se pudo actualizar la privacidad.', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Mis datos" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.cardTitle}>Que datos guarda Vyra</Text>
          <Text style={styles.item}>Metricas de salud: agua, pasos, sueno, nutricion, peso y entrenos.</Text>
          <Text style={styles.item}>Datos opcionales sensibles: salud mental, salud femenina y diario personal.</Text>
          <Text style={styles.item}>Historial del coach IA y preferencias para personalizacion.</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Donde y quien accede</Text>
          <Text style={styles.item}>Tus datos se almacenan en Supabase con politicas RLS por usuario.</Text>
          <Text style={styles.item}>Vyra no vende datos de salud a terceros ni a anunciantes.</Text>
          <Text style={styles.item}>El acceso queda limitado a tu cuenta y a procesos tecnicos del servicio.</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Consentimiento granular para IA</Text>
          <Text style={styles.hint}>
            Activa solo los datos sensibles que queres que el coach use para personalizar respuestas.
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Datos de salud mental</Text>
              <Text style={styles.toggleDesc}>Permite usar check-ins de animo y estres en el coach.</Text>
            </View>
            <Switch
              value={consents.mental}
              onValueChange={(value) => updatePrivacySetting('mental', value)}
              disabled={savingKey !== null}
              trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
              thumbColor={consents.mental ? Colors.brand : Colors.textMuted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Datos de salud femenina</Text>
              <Text style={styles.toggleDesc}>Permite usar fase de ciclo y sintomas en recomendaciones.</Text>
            </View>
            <Switch
              value={consents.female}
              onValueChange={(value) => updatePrivacySetting('female', value)}
              disabled={savingKey !== null}
              trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
              thumbColor={consents.female ? Colors.brand : Colors.textMuted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Diario personal</Text>
              <Text style={styles.toggleDesc}>Permite usar texto libre del diario para personalizacion IA.</Text>
            </View>
            <Switch
              value={consents.journal}
              onValueChange={(value) => updatePrivacySetting('journal', value)}
              disabled={savingKey !== null}
              trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
              thumbColor={consents.journal ? Colors.brand : Colors.textMuted}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Proteccion reforzada</Text>
          <Text style={styles.hint}>
            El modo estricto guarda peso, composicion, salud mental y fase femenina en formato cifrado. Algunas automatizaciones remotas, IA y analytics pueden reducirse.
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Modo estricto de datos sensibles</Text>
              <Text style={styles.toggleDesc}>Evita persistir en claro los datos sensibles de peso, composicion, salud mental y fase femenina.</Text>
            </View>
            <Switch
              value={strictSensitiveMode}
              onValueChange={(value) => updatePrivacySetting('strict_sensitive_mode', value)}
              disabled={savingKey !== null}
              trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
              thumbColor={strictSensitiveMode ? Colors.brand : Colors.textMuted}
            />
          </View>
        </Card>

        <Card style={styles.actionsCard}>
          <Pressable style={styles.action} onPress={() => router.push('/profile/export-data' as any)}>
            <Text style={styles.actionEmoji}>DB</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Exportar mis datos</Text>
              <Text style={styles.actionDesc}>Descarga un JSON completo con todo tu historial.</Text>
            </View>
            <Text style={styles.actionArrow}>{'>'}</Text>
          </Pressable>

          <Pressable style={styles.action} onPress={() => router.push('/settings/danger' as any)}>
            <Text style={styles.actionEmoji}>DEL</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Eliminar mi cuenta</Text>
              <Text style={styles.actionDesc}>Solicitud de borrado total en maximo 30 dias.</Text>
            </View>
            <Text style={styles.actionArrow}>{'>'}</Text>
          </Pressable>

          <Pressable style={styles.action} onPress={() => router.push('/legal/privacy' as any)}>
            <Text style={styles.actionEmoji}>TXT</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Politica de privacidad</Text>
              <Text style={styles.actionDesc}>Detalle legal completo y contacto de privacidad.</Text>
            </View>
            <Text style={styles.actionArrow}>{'>'}</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  item: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing[1.5],
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing[3],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  actionsCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: Radius.xl,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
  },
  actionEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    width: 28,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  actionDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  actionArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textMuted,
  },
});
