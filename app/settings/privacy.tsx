import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { buildProfileContextUpdate, getProfileContextMemory } from '@/lib/profile-context';
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

const CONSENT_ROWS: Array<{ key: ConsentKey; title: string; hint: string }> = [
  { key: 'mental', title: 'Salud mental', hint: 'Permite usar tu estado de animo en lecturas contextuales.' },
  { key: 'female', title: 'Salud femenina', hint: 'Permite usar fase y sintomas en sugerencias relacionadas.' },
  { key: 'journal', title: 'Diario personal', hint: 'Permite usar texto libre si quieres una lectura mas contextual.' },
];

function getMemory(profile: UserProfile | null): Record<string, unknown> {
  return getProfileContextMemory(profile);
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

function ToggleRow({
  title,
  hint,
  value,
  onChange,
  disabled,
}: {
  title: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
        thumbColor={value ? Colors.brand : Colors.textMuted}
      />
    </View>
  );
}

export default function PrivacyCenterScreen() {
  const { profile, setProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [savingKey, setSavingKey] = useState<PrivacyKey | null>(null);

  const consents = useMemo(() => getConsents(profile), [profile]);
  const strictSensitiveMode = useMemo(() => getStrictSensitiveMode(profile), [profile]);

  async function updatePrivacySetting(key: PrivacyKey, value: boolean) {
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
        ...(key === 'strict_sensitive_mode' ? { privacy_strict_sensitive_mode: value } : {}),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...buildProfileContextUpdate({ memory: nextMemory }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;

      setProfile(data);
      showToast('Privacidad actualizada.', 'success');
    } catch {
      showToast('No se pudo actualizar la privacidad.', 'error');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Privacidad" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Transparencia</Text>
          <Text style={styles.title}>VYRA no deberia sentirse opaca.</Text>
          <Text style={styles.body}>
            Aqui decides que capas sensibles puede usar el sistema para personalizarse. Lo importante
            esta en una linea; el detalle legal vive en los enlaces, no en saturar esta pantalla.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Consentimientos sensibles</Text>
          <View style={styles.stack}>
            {CONSENT_ROWS.map((row, index) => (
              <View key={row.key}>
                <ToggleRow
                  title={row.title}
                  hint={row.hint}
                  value={consents[row.key]}
                  onChange={(value) => void updatePrivacySetting(row.key, value)}
                  disabled={savingKey !== null}
                />
                {index < CONSENT_ROWS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.strictCard}>
          <Text style={styles.sectionTitle}>Modo estricto</Text>
          <Text style={styles.sectionHint}>
            Reduce cuanto se conserva en claro sobre peso, salud mental y salud femenina.
          </Text>

          <ToggleRow
            title="Activar modo estricto"
            hint="La experiencia sigue funcionando, pero algunas automatizaciones y lecturas remotas se reducen."
            value={strictSensitiveMode}
            onChange={(value) => void updatePrivacySetting('strict_sensitive_mode', value)}
            disabled={savingKey !== null}
          />

          {strictSensitiveMode ? (
            <View style={styles.strictInfo}>
              <Text style={styles.strictInfoTitle}>Que cambia cuando esta activo</Text>
              <Text style={styles.strictInfoBody}>
                Las lecturas contextuales y algunos analisis profundos tendran menos contexto. La app sigue usable, solo
                se vuelve mas conservadora con esos datos.
              </Text>
            </View>
          ) : null}
        </Card>

        <Card style={styles.linksCard}>
          <Pressable style={styles.linkRow} onPress={() => router.push('/profile/export-data' as never)}>
            <Text style={styles.linkTitle}>Exportar mis datos</Text>
            <Text style={styles.linkArrow}>{'>'}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.linkRow} onPress={() => router.push('/profile/delete-account' as never)}>
            <Text style={styles.linkTitle}>Eliminar mi cuenta</Text>
            <Text style={styles.linkArrow}>{'>'}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.linkRow} onPress={() => router.push('/legal/privacy' as never)}>
            <Text style={styles.linkTitle}>Politica de privacidad</Text>
            <Text style={styles.linkArrow}>{'>'}</Text>
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
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
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
  stack: {
    gap: Spacing[2],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  toggleHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  strictCard: {
    borderColor: withOpacity(Colors.brand, 0.16),
  },
  strictInfo: {
    marginTop: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    padding: Spacing[3],
    gap: 4,
  },
  strictInfoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  strictInfoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  linksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  linkTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  linkArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textMuted,
  },
});
