import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import Card from '@/components/ui/Card';
import TimePicker from '@/components/ui/TimePicker';
import NoticeCard from '@/components/ui/NoticeCard';
import SectionHeader from '@/components/ui/SectionHeader';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';
import {
  loadFastingSettings,
  parseTimeInput,
  saveFastingSettings,
  type FastingSettings,
} from '@/lib/fasting-settings';
import { cancelNotifsByType, scheduleFastingStartReminder } from '@/lib/notifications';
import supabase, { getCurrentUserId } from '@/lib/supabase';
import { useUIStore } from '@/stores/uiStore';

// FIX #17: StartTimePreview now accepts fastingHours prop to show the
// real eating window instead of always assuming 16:8 (8h hardcoded).
function StartTimePreview({ timeValue: _timeValue, parsedTime, fastingHours = 16 }: {
  timeValue: string;
  parsedTime: { hour: number; minute: number } | null;
  fastingHours?: number;
}) {
  if (!parsedTime) return null;

  const startHour = parsedTime.hour + parsedTime.minute / 60;
  const eatingHours = 24 - fastingHours;
  const eatingEndHour = (startHour + eatingHours) % 24;
  const fastStartHour = eatingEndHour;

  const formatHour = (h: number) => {
    const hInt = Math.floor(h);
    const m = Math.round((h - hInt) * 60);
    return `${String(hInt).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <View style={previewStyles.container}>
      {/* FIX #17: Show actual protocol name in the preview title */}
      <Text style={previewStyles.title}>Preview ventana {fastingHours}:{eatingHours}</Text>
      <View style={previewStyles.timeline}>
        {/* Comida */}
        <View style={previewStyles.timelineBlock}>
          <View style={[previewStyles.block, previewStyles.eatingBlock]}>
            <Text style={previewStyles.blockLabel}>🍽 Comer</Text>
            <Text style={previewStyles.blockTime}>{formatHour(startHour)} – {formatHour(eatingEndHour)}</Text>
          </View>
        </View>
        {/* Ayuno */}
        <View style={previewStyles.timelineBlock}>
          <View style={[previewStyles.block, previewStyles.fastingBlock]}>
            <Text style={previewStyles.blockLabel}>🌙 Ayuno</Text>
            <Text style={previewStyles.blockTime}>{formatHour(fastStartHour)} – {formatHour(startHour)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    gap: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeline: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  timelineBlock: { flex: 1 },
  block: {
    borderRadius: Radius.lg,
    padding: Spacing[3],
    gap: 2,
    borderWidth: 1,
  },
  eatingBlock: {
    backgroundColor: withOpacity(Colors.success, 0.08),
    borderColor: withOpacity(Colors.success, 0.2),
  },
  fastingBlock: {
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.2),
  },
  blockLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  blockTime: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});

export default function FastingSettingsScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [settings, setSettings] = useState<FastingSettings | null>(null);
  // FIX #18: Added loadError state to surface settings load failures
  const [loadError, setLoadError] = useState(false);
  const [timeValue, setTimeValue] = useState('12:00');
  const [fiveTwoTimeValue, setFiveTwoTimeValue] = useState('12:00');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoadError(false);
    try {
      const value = await loadFastingSettings();
      setSettings(value);
      setTimeValue(value.defaultStartTime ?? '12:00');
      setFiveTwoTimeValue(value.fiveTwoStartTime ?? '12:00');
    } catch (e) {
      // FIX #18: Surface load failure instead of hanging on "Cargando ajustes..."
      // eslint-disable-next-line no-console
      console.warn('[Settings] loadFastingSettings failed', e);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const parsedTime = useMemo(() => parseTimeInput(timeValue), [timeValue]);

  // FIX #19: Memoize fiveTwoTime parse — was called inline on every render/keystroke
  const parsedFiveTwoTime = useMemo(() => parseTimeInput(fiveTwoTimeValue), [fiveTwoTimeValue]);

  const updateSetting = <K extends keyof FastingSettings>(key: K, value: FastingSettings[K]) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!settings || !parsedTime) return;
    setSaving(true);
    const payload = {
      ...settings,
      defaultStartTime: `${String(parsedTime.hour).padStart(2, '0')}:${String(parsedTime.minute).padStart(2, '0')}`,
      // FIX #19: use memoized parsedFiveTwoTime instead of re-parsing inline
      fiveTwoStartTime: parsedFiveTwoTime
        ? `${String(parsedFiveTwoTime.hour).padStart(2, '0')}:${String(parsedFiveTwoTime.minute).padStart(2, '0')}`
        : null,
    };
    // Validate 5:2 settings: if auto-start enabled, user must pick at least one day
    if (payload.fiveTwoAutoStart && (!payload.fiveTwoDays || payload.fiveTwoDays.length === 0)) {
      showToast('Si activás Auto-iniciar 5:2, elegí al menos un día.', 'warning');
      setSaving(false);
      return;
    }

    if (payload.fiveTwoAutoStart && !parsedFiveTwoTime) {
      showToast('Ingresá una hora válida para el auto-inicio 5:2.', 'warning');
      setSaving(false);
      return;
    }

    const next = await saveFastingSettings(payload);
    const eatingHours = Math.max(0, 24 - fastingHoursForPreview);
    const reminderTotalMinutes = (parsedTime.hour * 60 + parsedTime.minute + eatingHours * 60) % (24 * 60);
    const reminderHour = Math.floor(reminderTotalMinutes / 60);
    const reminderMinute = reminderTotalMinutes % 60;

    if (payload.notifyStart) {
      await scheduleFastingStartReminder(reminderHour, reminderMinute);
    } else {
      await cancelNotifsByType('fasting_start');
    }

    setSettings(next);

    // Persist 5:2 preferences server-side (profiles)
    try {
      const userId = await getCurrentUserId();
      let fiveTwoStartUtc: string | null = null;
      if (parsedFiveTwoTime) {
        const tmp = new Date();
        tmp.setHours(parsedFiveTwoTime.hour, parsedFiveTwoTime.minute, 0, 0);
        fiveTwoStartUtc = `${String(tmp.getUTCHours()).padStart(2, '0')}:${String(tmp.getUTCMinutes()).padStart(2, '0')}`;
      }

      let timeZone: string | null = null;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (typeof tz === 'string' && tz.length) timeZone = tz;
      } catch (e) {
        // If timezone resolution fails (very rare), log and continue without it.
        // Avoid empty catch blocks to satisfy lint rules.
        // eslint-disable-next-line no-console
        console.warn('[Settings] Could not detect timezone:', e);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          five_two_days: next.fiveTwoDays,
          five_two_start_time_utc: fiveTwoStartUtc,
          five_two_auto: next.fiveTwoAutoStart,
          five_two_time_zone: timeZone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.warn('[Settings] Failed saving 5:2 to profile:', updateError.message);
        // FIX #20: Surface remote save failure to the user instead of silently
        // showing "Ajustes guardados" when the server update actually failed.
        showToast('Ajustes locales guardados, pero no se sincronizaron al servidor.', 'warning');
        setSaving(false);
        setIsDirty(false);
        return;
      }
    } catch (e) {
      console.warn('[Settings] Could not persist 5:2 preferences:', e);
      showToast('Ajustes locales guardados, pero no se sincronizaron al servidor.', 'warning');
      setSaving(false);
      setIsDirty(false);
      return;
    }

    setSaving(false);
    setIsDirty(false);
    showToast('Ajustes de ayuno guardados.', 'success');
  };

  // FIX #17: Derive fastingHours from current protocol setting so the
  // preview shows the correct eating window. `activeProtocol` is now part
  // of `FastingSettings` so we can access it directly.
  const activeProtocolId: string = settings?.activeProtocol ?? '16:8';
  const fastingHoursForPreview = useMemo(() => {
    const match = activeProtocolId.match(/^(\d+):/);
    return match ? parseInt(match[1], 10) : 16;
  }, [activeProtocolId]);

  return (
    <ModuleScaffold
      title="Ajustes"
      subtitle="Ayuno, fases y avisos"
      color={Colors.fasting}
      tabs={<FastingModuleTabs active="settings" />}
    >
      {/* FIX #18: Show error state with retry option if settings load failed */}
      {loadError ? (
        <NoticeCard
          title="No se pudieron cargar los ajustes"
          body="Hubo un problema al cargar tu configuración. Tocá reintentar."
          tone="error"
          actionLabel="Reintentar"
          onAction={() => void loadSettings()}
        />
      ) : !settings ? (
        <NoticeCard
          title="Cargando ajustes"
          body="Preparando tu configuración base..."
          tone="info"
        />
      ) : (
        <>
          {/* ─── Notificaciones ─────────────────────────── */}
          <Card style={styles.card}>
            <SectionHeader
              eyebrow="Notificaciones"
              title="Avisos del protocolo"
              subtitle="Configurá cuándo querés recibir recordatorios durante el ayuno."
            />

            <SettingToggleRow
              title="Aviso de inicio"
              description="Te recuerda cuando empieza tu ventana elegida."
              value={settings.notifyStart}
              onValueChange={(value) => updateSetting('notifyStart', value)}
              accentColor={Colors.fasting}
            />

            <View style={styles.divider} />

            <SettingToggleRow
              title="Meta de horas"
              description="Avisa cuando cerraste el objetivo del protocolo."
              value={settings.notifyComplete}
              onValueChange={(value) => updateSetting('notifyComplete', value)}
              accentColor={Colors.fasting}
            />
          </Card>

          {/* ─── Experiencia del timer ──────────────────── */}
          <Card style={styles.card}>
            <SectionHeader
              eyebrow="Experiencia"
              title="Lectura del timer"
              subtitle="Qué información aparece mientras ayunás."
            />

            <SettingToggleRow
              title="Mostrar fases"
              description="Mantiene mensajes simples dentro del timer mientras ayunás."
              value={settings.showPhaseLabels}
              onValueChange={(value) => updateSetting('showPhaseLabels', value)}
              accentColor={Colors.fasting}
            />

            <View style={styles.divider} />

            <SettingToggleRow
              title="Predicciones"
              description='Muestra tips como: "En 2h entrás en quema máxima".'
              value={settings.showPredictions}
              onValueChange={(value) => updateSetting('showPredictions', value)}
              accentColor={Colors.fasting}
            />
          </Card>

          {/* ─── Hora base ──────────────────────────────── */}
          <Card style={styles.card}>
            <SectionHeader
              eyebrow="Hora base"
              title="Inicio sugerido"
              subtitle="Primera comida del día. Desde ahí parte la ventana por defecto."
            />

            <View style={styles.timeInputWrapper}>
              <TimePicker
                label="Hora de inicio"
                value={timeValue}
                onChange={(v) => { setTimeValue(v); setIsDirty(true); }}
                placeholder="12:00"
                error={timeValue.length > 0 && !parsedTime ? 'Usá formato HH:MM (ej: 12:00)' : null}
                inputStyle={styles.timeInput}
              />
              {parsedTime && (
                <View style={styles.timeValidBadge}>
                  <Text style={styles.timeValidText}>✓ Hora válida</Text>
                </View>
              )}
            </View>

            {/* FIX #17: Pass fastingHoursForPreview so the preview reflects
                the user's actual active protocol eating window */}
            <StartTimePreview
              timeValue={timeValue}
              parsedTime={parsedTime}
              fastingHours={fastingHoursForPreview}
            />

            <Text style={styles.baseHint}>
              Este valor solo deja sugerida tu ventana base. No inicia el ayuno por sí solo.
            </Text>
          </Card>

          {/* ─── Protocolo 5:2 ───────────────────────────── */}
          <Card style={styles.card}>
            <SectionHeader
              eyebrow="5:2"
              title="Programa 5:2"
              subtitle="Elegí dos días por semana para ayunar y una hora de inicio automática si querés."
            />

            <SettingToggleRow
              title="Auto-iniciar 5:2"
              description="Si está activado, VYRA usará esta hora como disparador principal del 5:2 y te lo sugerirá apenas vuelvas a la app si el sistema no puede arrancarlo solo."
              value={settings.fiveTwoAutoStart}
              onValueChange={(v) => {
                // Require at least one selected day when enabling auto-start
                if (v && (!settings.fiveTwoDays || settings.fiveTwoDays.length === 0)) {
                  showToast('Si activás Auto-iniciar 5:2, elegí al menos un día.', 'warning');
                  return;
                }
                updateSetting('fiveTwoAutoStart', v);
              }}
              accentColor={Colors.fasting}
            />

            <View style={styles.sectionSpacer} />

            <Text style={[previewStyles.title, { marginBottom: 8 }]}>Días de ayuno</Text>
            <View style={styles.daysRow}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((label, idx) => {
                const active = settings.fiveTwoDays.includes(idx);
                return (
                  <Button
                    key={label}
                    label={label}
                    onPress={() => {
                      const current = settings.fiveTwoDays ?? [];
                      if (current.includes(idx)) {
                        updateSetting('fiveTwoDays', current.filter((d) => d !== idx));
                        return;
                      }
                      if (current.length >= 2) {
                        showToast('Solo podés seleccionar hasta 2 días para el 5:2', 'info');
                        return;
                      }
                      updateSetting('fiveTwoDays', [...current, idx]);
                    }}
                    variant={active ? 'primary' : 'ghost'}
                    color={Colors.fasting}
                    style={styles.dayBtn}
                  />
                );
              })}
            </View>

            <Text style={styles.daysCount}>
              {settings.fiveTwoDays.length}/2 días seleccionados{settings.fiveTwoDays.length === 2 ? ' ✓' : ''}
            </Text>

            <View style={styles.sectionSpacer} />

            <TimePicker
              label="Hora de inicio 5:2"
              value={fiveTwoTimeValue}
              onChange={(v) => { setFiveTwoTimeValue(v); setIsDirty(true); }}
              placeholder="08:00"
              error={fiveTwoTimeValue.length > 0 && !parsedFiveTwoTime ? 'Usá formato HH:MM' : null}
              inputStyle={styles.timeInput}
            />
            <Text style={styles.baseHint}>Si el sistema no puede arrancarlo solo, te lo vamos a sugerir apenas vuelvas a abrir la app.</Text>
            <Text style={styles.baseHint}>VYRA intentará iniciar el ayuno en los días seleccionados a esta hora.</Text>
          </Card>

          {/* ─── Botón de guardado ──────────────────────── */}
          {isDirty && (
            <View style={styles.saveNotice}>
              <Text style={styles.saveNoticeText}>Tenés cambios sin guardar</Text>
            </View>
          )}

          <Button
            label={saving ? 'Guardando...' : 'Guardar ajustes'}
            onPress={() => void handleSave()}
            color={Colors.fasting}
            disabled={saving || !parsedTime || (fiveTwoTimeValue.length > 0 && !parsedFiveTwoTime)}
            loading={saving}
            fullWidth
          />
        </>
      )}
    </ModuleScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Spacing[4],
  },
  timeInputWrapper: {
    gap: Spacing[1],
  },
  timeInput: {
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    letterSpacing: 2,
  },
  timeValidBadge: {
    alignSelf: 'center',
    backgroundColor: withOpacity(Colors.success, 0.1),
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 2,
  },
  timeValidText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  baseHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  saveNotice: {
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.fasting, 0.2),
    borderStyle: 'dashed',
    paddingVertical: Spacing[2],
    alignItems: 'center',
  },
  saveNoticeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.fasting,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    flexWrap: 'wrap',
  },
  sectionSpacer: {
    height: Spacing[2],
  },
  dayBtn: {
    marginRight: 0,
    minWidth: 0,
    paddingHorizontal: Spacing[2],
  },
  daysCount: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
