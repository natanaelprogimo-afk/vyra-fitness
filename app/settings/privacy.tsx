import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import LinkRow from '@/components/ui/LinkRow';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getAdConsent, setAdConsent } from '@/lib/ad-consent';
import { NativeModules } from 'react-native';
import { buildProfileContextUpdate, getProfileContextMemory } from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/user';

type VyraUnityAdsPrivacyModule = {
  setPersonalizedAdsAllowed?: (allowed: boolean) => Promise<void> | void;
};

type ConsentKey = 'mental' | 'female' | 'journal';
type PrivacyKey = ConsentKey | 'strict_sensitive_mode';
type ConsentMap = Record<ConsentKey, boolean>;
type DataVisibilityRow = {
  title: string;
  storage: string;
  hint: string;
  examples: string;
};

const DEFAULT_CONSENTS: ConsentMap = {
  mental: false,
  female: false,
  journal: false,
};

const CONSENT_ROWS: Array<{ key: ConsentKey; title: string; hint: string }> = [
  { key: 'mental', title: 'Salud mental', hint: 'Permite usar tu estado de ánimo en lecturas contextuales.' },
  { key: 'female', title: 'Salud femenina', hint: 'Permite usar fase y síntomas en sugerencias relacionadas.' },
  { key: 'journal', title: 'Diario personal', hint: 'Permite usar texto libre si quieres una lectura más contextual.' },
];

const DATA_VISIBILITY_ROWS: DataVisibilityRow[] = [
  {
    title: 'Cuenta y preferencias',
    storage: 'Cuenta',
    hint: 'Lo básico para que la app abra con tu idioma, unidades, widgets y notificaciones como las dejaste.',
    examples: 'Nombre, email, idioma, tema, unidades, tipo de notificaciones y ajustes de widgets.',
  },
  {
    title: 'Historial de salud y fitness',
    storage: 'Cuenta',
    hint: 'Tus registros principales se guardan para mantener continuidad aunque cierres sesión o cambies de plan.',
    examples: 'Agua, pasos, sueño, peso, comidas, ayuno, entrenos y resúmenes diarios.',
  },
  {
    title: 'Datos sensibles opcionales',
    storage: 'Solo si activas módulos',
    hint: 'Nunca se usan para personalización profunda si no diste consentimiento o si activaste modo estricto.',
    examples: 'Estado de ánimo, datos de salud femenina y texto libre del diario.',
  },
  {
    title: 'Datos locales del dispositivo',
    storage: 'Solo en tu teléfono',
    hint: 'Sirven para que la app siga usable con soporte offline parcial y para proteger reingreso y accesos rápidos.',
    examples: 'Caches por módulo, historial local de workout, bloqueo biométrico y estado de widgets.',
  },
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

export default function PrivacyCenterScreen() {
  const { profile, setProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [savingKey, setSavingKey] = useState<PrivacyKey | null>(null);

  const consents = useMemo(() => getConsents(profile), [profile]);
  const strictSensitiveMode = useMemo(() => getStrictSensitiveMode(profile), [profile]);
  const [adPersonalized, setAdPersonalized] = React.useState<boolean | null>(null);
  const [savingAdConsent, setSavingAdConsent] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const c = await getAdConsent();
        if (!mounted) return;
        setAdPersonalized(c === 'personalized');
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
        <NoticeCard
          title="Transparencia clara"
          body="Las decisiones sensibles ahora viven en filas reutilizables y con feedback inline, no escondidas entre bloques largos sin semántica."
          tone="info"
        />

        <Card>
          <SectionHeader
            eyebrow="Datos"
            title="Qué guarda Vyra"
            subtitle="Una lectura útil de lo que hoy puede vivir en la cuenta, el dispositivo o módulos sensibles."
          />

          <View style={styles.dataStack}>
            {DATA_VISIBILITY_ROWS.map((row) => (
              <View key={row.title} style={styles.dataRow}>
                <View style={styles.dataRowHeader}>
                  <Text style={styles.dataRowTitle}>{row.title}</Text>
                  <View style={styles.dataBadge}>
                    <Text style={styles.dataBadgeText}>{row.storage}</Text>
                  </View>
                </View>
                <Text style={styles.dataRowHint}>{row.hint}</Text>
                <Text style={styles.dataRowExamples}>Incluye: {row.examples}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Consentimientos"
            title="Capas sensibles"
            subtitle="Cada permiso vive como un control explícito y no como una suposición escondida en el sistema."
          />

          <View style={styles.stack}>
            {CONSENT_ROWS.map((row) => (
              <SettingToggleRow
                key={row.key}
                title={row.title}
                description={row.hint}
                value={consents[row.key]}
                onValueChange={(value) => void updatePrivacySetting(row.key, value)}
                disabled={savingKey !== null}
              />
            ))}
            <SettingToggleRow
              title="Anuncios personalizados"
              description="Permitir anuncios personalizados (mejores recomendaciones). Requerido para personalizar anuncios."
              value={adPersonalized ?? false}
              onValueChange={async (value) => {
                setSavingAdConsent(true);
                try {
                  await setAdConsent(value ? 'personalized' : 'non_personalized');
                  // Inform native runtime (best-effort)
                  try {
                    await (NativeModules.VyraUnityAds as VyraUnityAdsPrivacyModule | undefined)?.setPersonalizedAdsAllowed?.(value);
                  } catch {
                    // ignore native failures
                  }
                  setAdPersonalized(value);
                  showToast('Preferencia de anuncios actualizada.', 'success');
                } catch {
                  showToast('No se pudo actualizar la preferencia de anuncios.', 'error');
                } finally {
                  setSavingAdConsent(false);
                }
              }}
              disabled={savingKey !== null || savingAdConsent}
            />
          </View>
        </Card>

        <Card style={styles.strictCard}>
          <SectionHeader
            eyebrow="Protección"
            title="Modo estricto"
            subtitle="Reduce cuánto se conserva en claro sobre peso, salud mental y salud femenina."
          />

          <SettingToggleRow
            title="Activar modo estricto"
            description="La experiencia sigue funcionando, pero algunas automatizaciones y lecturas remotas se vuelven más conservadoras."
            value={strictSensitiveMode}
            onValueChange={(value) => void updatePrivacySetting('strict_sensitive_mode', value)}
            disabled={savingKey !== null}
          />

          {strictSensitiveMode ? (
            <View style={styles.strictInfo}>
              <Text style={styles.strictInfoTitle}>Qué cambia cuando está activo</Text>
              <Text style={styles.strictInfoBody}>
                Las lecturas contextuales y algunos análisis profundos tendrán menos contexto. La app sigue usable, solo baja el nivel de exposición.
              </Text>
            </View>
          ) : null}
        </Card>

        <Card style={styles.linksCard}>
          <SectionHeader
            eyebrow="Acciones"
            title="Controles de cuenta"
            subtitle="Exportar, borrar y leer la política con una sola gramática de navegación."
          />

          <LinkRow
            label="Exportar mis datos"
            description="Genera y revisa la salida disponible desde tu cuenta."
            onPress={() => router.push('/profile/export-data' as never)}
          />
          <View style={styles.divider} />
          <LinkRow
            label="Eliminar mi cuenta"
            description="Acción irreversible con fricción deliberada y contexto visible."
            onPress={() => router.push('/profile/delete-account' as never)}
            accentColor={Colors.error}
          />
          <View style={styles.divider} />
          <LinkRow
            label="Política de privacidad"
            description="Documento legal con el detalle completo del tratamiento de datos."
            onPress={() => router.push('/legal/privacy' as never)}
          />
        </Card>

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
  stack: {
    gap: Spacing[2],
  },
  dataStack: {
    marginTop: Spacing[4],
    gap: Spacing[3],
  },
  dataRow: {
    gap: 6,
  },
  dataRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  dataRowTitle: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  dataBadge: {
    minHeight: 28,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.18),
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  dataBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  dataRowHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  dataRowExamples: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
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
    gap: Spacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
});
