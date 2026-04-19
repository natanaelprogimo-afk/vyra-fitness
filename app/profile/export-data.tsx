import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

type ExportTable = {
  key: string;
  label: string;
  matchColumn: 'id' | 'user_id';
  orderColumn?: string;
};

type ExportSection = {
  id: string;
  title: string;
  hint: string;
  tables: ExportTable[];
};

type ExportBundle = {
  exportedAt: string;
  userId: string;
  userEmail: string | null | undefined;
  data: Record<string, unknown[]>;
};

type WeightRow = {
  logged_at: string;
  weight_kg: number | null;
};

type SleepRow = {
  end_time: string;
  duration_min: number | null;
  quality_score: number | null;
  notes?: string | null;
};

type WorkoutSessionRow = {
  id: string;
  name?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_min?: number | null;
  total_volume_kg?: number | null;
};

const SECTIONS: ExportSection[] = [
  {
    id: 'identity',
    title: 'Cuenta e identidad',
    hint: 'Perfil, suscripcion y estados de cuenta.',
    tables: [
      { key: 'profiles', label: 'Perfil', matchColumn: 'id' },
      { key: 'user_subscriptions', label: 'Suscripciones', matchColumn: 'user_id', orderColumn: 'updated_at' },
      { key: 'deletion_requests', label: 'Solicitudes de borrado', matchColumn: 'user_id', orderColumn: 'created_at' },
    ],
  },
  {
    id: 'health',
    title: 'Salud y habitos',
    hint: 'Los logs diarios y la lectura de tu estado.',
    tables: [
      { key: 'water_logs', label: 'Agua', matchColumn: 'user_id', orderColumn: 'logged_at' },
      { key: 'step_logs', label: 'Pasos', matchColumn: 'user_id', orderColumn: 'logged_date' },
      { key: 'fasting_logs', label: 'Ayuno', matchColumn: 'user_id', orderColumn: 'start_time' },
      { key: 'sleep_logs', label: 'Sueño', matchColumn: 'user_id', orderColumn: 'end_time' },
      { key: 'meals', label: 'Comidas', matchColumn: 'user_id', orderColumn: 'logged_at' },
      { key: 'weight_logs', label: 'Peso', matchColumn: 'user_id', orderColumn: 'logged_at' },
      { key: 'mental_checkins', label: 'Check-ins mentales', matchColumn: 'user_id', orderColumn: 'check_date' },
      { key: 'female_health_logs', label: 'Salud femenina', matchColumn: 'user_id', orderColumn: 'logged_at' },
    ],
  },
  {
    id: 'progress',
    title: 'Progreso e historial',
    hint: 'Entrenos, suplementos y trazas utiles del avance personal.',
    tables: [
      { key: 'workout_sessions', label: 'Sesiones de entreno', matchColumn: 'user_id', orderColumn: 'started_at' },
      { key: 'daily_scores', label: 'Daily scores', matchColumn: 'user_id', orderColumn: 'date' },
      { key: 'supplements', label: 'Suplementos', matchColumn: 'user_id', orderColumn: 'created_at' },
      { key: 'supplement_logs', label: 'Tomas de suplementos', matchColumn: 'user_id', orderColumn: 'taken_at' },
    ],
  },
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}

function rowsToCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(','));
  }
  return lines.join('\n');
}

function getString(record: unknown, key: string): string {
  if (!record || typeof record !== 'object') return '';
  const value = (record as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

function getNumber(record: unknown, key: string): number | null {
  if (!record || typeof record !== 'object') return null;
  const value = (record as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function fetchTable(table: ExportTable, userId: string) {
  let query = supabase.from(table.key).select('*').eq(table.matchColumn, userId);

  if (table.orderColumn) {
    query = query.order(table.orderColumn, { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function ensureExportsDir() {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!base) {
    throw new Error('No file system directory available');
  }
  const dir = `${base}vyra-exports/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  return dir;
}

async function writeAndShareTextFile(
  filename: string,
  contents: string,
  mimeType: string,
  dialogTitle: string,
) {
  const dir = await ensureExportsDir();
  const uri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(uri, contents, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    await Share.share({ message: contents, title: dialogTitle });
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType,
    dialogTitle,
    UTI: mimeType,
  });
}

async function loadExportBundle(userId: string, userEmail?: string | null): Promise<ExportBundle> {
  const exportData: Record<string, unknown[]> = {};
  let workoutSessionIds: string[] = [];

  for (const table of SECTIONS.flatMap((section) => section.tables)) {
    const rows = await fetchTable(table, userId);
    exportData[table.key] = rows;

    if (table.key === 'workout_sessions') {
      workoutSessionIds = rows
        .map((row) => {
          const id = getString(row, 'id');
          return id || null;
        })
        .filter((value): value is string => Boolean(value));
    }
  }

  if (workoutSessionIds.length > 0) {
    const { data: workoutSets, error: workoutSetsError } = await supabase
      .from('workout_sets')
      .select('*')
      .in('session_id', workoutSessionIds)
      .order('set_number', { ascending: true });

    if (workoutSetsError) throw workoutSetsError;
    exportData.workout_sets = workoutSets ?? [];
  } else {
    exportData.workout_sets = [];
  }

  return {
    exportedAt: new Date().toISOString(),
    userId,
    userEmail,
    data: exportData,
  };
}

function buildWeightCsv(bundle: ExportBundle) {
  const rows = (bundle.data.weight_logs ?? []) as WeightRow[];
  return rowsToCsv(
    ['fecha', 'peso_kg'],
    rows.map((row) => [row.logged_at, row.weight_kg ?? '']),
  );
}

function buildSleepCsv(bundle: ExportBundle) {
  const rows = (bundle.data.sleep_logs ?? []) as SleepRow[];
  return rowsToCsv(
    ['fecha_fin', 'horas', 'calidad', 'notas'],
    rows.map((row) => [
      row.end_time,
      row.duration_min != null ? (row.duration_min / 60).toFixed(2) : '',
      row.quality_score ?? '',
      row.notes ?? '',
    ]),
  );
}

function buildCaloriesCsv(bundle: ExportBundle) {
  const meals = (bundle.data.meals ?? []) as Array<Record<string, unknown>>;
  const grouped = new Map<string, number>();

  for (const meal of meals) {
    const loggedAt = getString(meal, 'logged_at');
    const day = loggedAt.split('T')[0] ?? loggedAt;
    const calories = getNumber(meal, 'calories') ?? 0;
    grouped.set(day, (grouped.get(day) ?? 0) + calories);
  }

  return rowsToCsv(
    ['fecha', 'calorias'],
    [...grouped.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([day, calories]) => [day, Math.round(calories)]),
  );
}

function buildWorkoutCsv(bundle: ExportBundle) {
  const sessions = (bundle.data.workout_sessions ?? []) as WorkoutSessionRow[];
  const sets = (bundle.data.workout_sets ?? []) as Array<Record<string, unknown>>;
  const prsBySession = new Map<string, number>();

  for (const set of sets) {
    const sessionId = getString(set, 'session_id');
    if (!sessionId) continue;
    const isPr = Boolean((set as Record<string, unknown>).is_pr);
    if (!isPr) continue;
    prsBySession.set(sessionId, (prsBySession.get(sessionId) ?? 0) + 1);
  }

  return rowsToCsv(
    ['fecha', 'nombre', 'duracion_min', 'volumen_kg', 'prs'],
    sessions.map((session) => [
      session.started_at,
      session.name ?? 'Sesion de entreno',
      session.duration_min ?? '',
      session.total_volume_kg ?? '',
      prsBySession.get(session.id) ?? 0,
    ]),
  );
}

function buildMonthlyPdfHtml(bundle: ExportBundle) {
  const today = new Date();
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthAgoIso = monthAgo.toISOString();

  const weights = ((bundle.data.weight_logs ?? []) as WeightRow[])
    .filter((row) => row.logged_at >= monthAgoIso && row.weight_kg != null)
    .slice(-6);
  const sleeps = ((bundle.data.sleep_logs ?? []) as SleepRow[])
    .filter((row) => row.end_time >= monthAgoIso);
  const workouts = ((bundle.data.workout_sessions ?? []) as WorkoutSessionRow[])
    .filter((row) => row.started_at >= monthAgoIso);
  const meals = ((bundle.data.meals ?? []) as Array<Record<string, unknown>>)
    .filter((row) => getString(row, 'logged_at') >= monthAgoIso);

  const avgSleep =
    sleeps.length > 0
      ? sleeps.reduce((sum, row) => sum + (row.duration_min ?? 0), 0) / sleeps.length / 60
      : 0;
  const avgCalories =
    meals.length > 0
      ? meals.reduce((sum, row) => sum + (getNumber(row, 'calories') ?? 0), 0) / 30
      : 0;
  const latestWeight = weights[weights.length - 1]?.weight_kg ?? null;
  const firstWeight = weights[0]?.weight_kg ?? null;
  const weightDelta =
    latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null;

  const sleepBars = sleeps
    .slice(-7)
    .map((row) => {
      const hours = (row.duration_min ?? 0) / 60;
      const height = Math.max(12, Math.min(96, hours * 12));
      const day = new Date(row.end_time).toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
      return `<div class="barWrap"><div class="bar" style="height:${height}px"></div><span>${day}</span></div>`;
    })
    .join('');

  const weightLines = weights
    .map((row) => {
      const date = new Date(row.logged_at).toLocaleDateString('es', { day: '2-digit', month: 'short' });
      return `<li><strong>${date}</strong> · ${row.weight_kg?.toFixed(1) ?? '--'} kg</li>`;
    })
    .join('');

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background:#0b0f1a; color:#f4f7fb; padding:32px; }
        .title { font-size:28px; font-weight:700; margin:0 0 8px; }
        .subtitle { font-size:14px; color:#98a2b3; margin:0 0 24px; }
        .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:24px; }
        .card { background:#121826; border:1px solid #243042; border-radius:18px; padding:16px; }
        .eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#69c4ff; margin-bottom:8px; }
        .value { font-size:26px; font-weight:700; margin-bottom:4px; }
        .hint { font-size:12px; color:#98a2b3; line-height:1.4; }
        .bars { display:flex; align-items:flex-end; gap:10px; height:120px; margin-top:14px; }
        .barWrap { display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:6px; flex:1; }
        .bar { width:24px; background:#3fb6ff; border-radius:999px 999px 8px 8px; }
        h2 { font-size:18px; margin:0 0 12px; }
        ul { padding-left:18px; margin:0; }
        li { margin-bottom:8px; font-size:13px; color:#d8e0ea; }
      </style>
    </head>
    <body>
      <div class="title">Resumen mensual VYRA</div>
      <div class="subtitle">Generado el ${new Date(bundle.exportedAt).toLocaleString('es')}</div>

      <div class="grid">
        <div class="card">
          <div class="eyebrow">Peso</div>
          <div class="value">${latestWeight != null ? `${latestWeight.toFixed(1)} kg` : '--'}</div>
          <div class="hint">${weightDelta != null ? `Cambio de ${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} kg en 30 dias.` : 'Sin suficientes lecturas para tendencia.'}</div>
        </div>
        <div class="card">
          <div class="eyebrow">Sueño</div>
          <div class="value">${avgSleep ? `${avgSleep.toFixed(1)} h` : '--'}</div>
          <div class="hint">Promedio de las noches registradas en el ultimo mes.</div>
        </div>
        <div class="card">
          <div class="eyebrow">Entreno</div>
          <div class="value">${workouts.length}</div>
          <div class="hint">Sesiones guardadas en los ultimos 30 dias.</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2>Sueño reciente</h2>
        <div class="hint">Ultimas noches registradas.</div>
        <div class="bars">${sleepBars || '<div class="hint">Sin datos suficientes.</div>'}</div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2>Calorias promedio por dia</h2>
        <div class="value">${Math.round(avgCalories)}</div>
        <div class="hint">Promedio diario estimado con las comidas registradas del ultimo mes.</div>
      </div>

      <div class="card">
        <h2>Linea de peso</h2>
        <ul>${weightLines || '<li>Sin lecturas suficientes.</li>'}</ul>
      </div>
    </body>
  </html>`;
}

export default function ExportDataScreen() {
  const { profile } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [openSection, setOpenSection] = useState<string>('identity');

  const allTables = useMemo(() => SECTIONS.flatMap((section) => section.tables), []);

  async function withBundle<T>(
    label: string,
    fn: (bundle: ExportBundle) => Promise<T>,
  ) {
    if (!profile?.id) return null;
    setIsExporting(true);
    setProgress(label);
    try {
      const bundle = await loadExportBundle(profile.id, profile.email);
      return await fn(bundle);
    } catch (error) {
      console.error('[export-data] failed', error);
      Alert.alert('No se pudo exportar', 'Intenta de nuevo en unos segundos.');
      return null;
    } finally {
      setProgress('');
      setIsExporting(false);
    }
  }

  async function handleExportJson() {
    await withBundle('Preparando JSON...', async (bundle) => {
      const jsonString = JSON.stringify(
        {
          exported_at: bundle.exportedAt,
          user_id: bundle.userId,
          user_email: bundle.userEmail,
          vyra_version: '1.0.0',
          data: bundle.data,
        },
        null,
        2,
      );

      await writeAndShareTextFile(
        `vyra-export-${bundle.userId}.json`,
        jsonString,
        'application/json',
        'Mis datos de VYRA',
      );
    });
  }

  async function handleExportCsv(type: 'weight' | 'sleep' | 'calories' | 'workout') {
    const labelMap = {
      weight: 'Generando CSV de peso...',
      sleep: 'Generando CSV de sueno...',
      calories: 'Generando CSV de calorias...',
      workout: 'Generando CSV de entrenos...',
    } as const;

    await withBundle(labelMap[type], async (bundle) => {
      const csv =
        type === 'weight'
          ? buildWeightCsv(bundle)
          : type === 'sleep'
            ? buildSleepCsv(bundle)
            : type === 'calories'
              ? buildCaloriesCsv(bundle)
              : buildWorkoutCsv(bundle);

      const filename =
        type === 'weight'
          ? 'vyra-peso.csv'
          : type === 'sleep'
            ? 'vyra-sueno.csv'
            : type === 'calories'
              ? 'vyra-calorias.csv'
              : 'vyra-entrenos.csv';

      await writeAndShareTextFile(filename, csv, 'text/csv', 'Exportar CSV');
    });
  }

  async function handleExportPdf() {
    await withBundle('Generando PDF mensual...', async (bundle) => {
      const html = buildMonthlyPdfHtml(bundle);
      const result = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('PDF creado', `Se genero en ${result.uri}`);
        return;
      }
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Resumen mensual VYRA',
        UTI: 'com.adobe.pdf',
      });
    });
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Exportar datos" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Tus datos, tuyos</Text>
          <Text style={styles.title}>Llevatelos cuando quieras.</Text>
          <Text style={styles.body}>
            Puedes sacar un JSON completo, CSV utiles por categoria y un PDF mensual visual
            para compartir con medico, nutricionista o entrenador.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Que entra en el export</Text>
          <Text style={styles.sectionHint}>
            Toca cada bloque si quieres ver el detalle. Si no, puedes exportar directo.
          </Text>

          <View style={styles.sectionStack}>
            {SECTIONS.map((section) => {
              const open = openSection === section.id;
              return (
                <View key={section.id} style={styles.accordion}>
                  <Pressable
                    onPress={() => setOpenSection(open ? '' : section.id)}
                    style={styles.accordionHeader}
                  >
                    <View style={styles.accordionCopy}>
                      <Text style={styles.accordionTitle}>{section.title}</Text>
                      <Text style={styles.accordionHint}>{section.hint}</Text>
                    </View>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={Colors.textMuted}
                    />
                  </Pressable>

                  {open ? (
                    <View style={styles.accordionBody}>
                      {section.tables.map((table) => (
                        <View key={table.key} style={styles.tableRow}>
                          <View style={styles.tableDot} />
                          <Text style={styles.tableLabel}>{table.label}</Text>
                        </View>
                      ))}
                      {section.id === 'progress' ? (
                        <View style={styles.tableRow}>
                          <View style={styles.tableDot} />
                          <Text style={styles.tableLabel}>Sets vinculados a tus sesiones</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Formatos utiles</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaStat}>
              <Text style={styles.metaValue}>{allTables.length + 1}</Text>
              <Text style={styles.metaLabel}>bloques base</Text>
            </View>
            <View style={styles.metaStat}>
              <Text style={styles.metaValue}>CSV</Text>
              <Text style={styles.metaLabel}>peso, sueno, calorias, entrenos</Text>
            </View>
            <View style={styles.metaStat}>
              <Text style={styles.metaValue}>PDF</Text>
              <Text style={styles.metaLabel}>resumen visual del ultimo mes</Text>
            </View>
          </View>
          <Text style={styles.mutedNote}>
            El JSON conserva casi todo tu historial. Los CSV y el PDF sirven cuando quieres
            usar o compartir solo la parte importante.
          </Text>
        </Card>

        <View style={styles.buttonStack}>
          <Button onPress={() => void handleExportJson()} loading={isExporting && progress.includes('JSON')} fullWidth color={Colors.brand}>
            {isExporting && progress.includes('JSON') ? progress : 'Exportar JSON completo'}
          </Button>
          <Button onPress={() => void handleExportCsv('weight')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de peso
          </Button>
          <Button onPress={() => void handleExportCsv('sleep')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de sueno
          </Button>
          <Button onPress={() => void handleExportCsv('calories')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de calorias
          </Button>
          <Button onPress={() => void handleExportCsv('workout')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de entrenos
          </Button>
          <Button onPress={() => void handleExportPdf()} fullWidth color={Colors.premium}>
            {isExporting && progress.includes('PDF') ? progress : 'PDF visual del ultimo mes'}
          </Button>
        </View>

        {progress ? <Text style={styles.progressText}>{progress}</Text> : null}

        <Pressable onPress={() => router.push('/legal/privacy' as never)}>
          <Text style={styles.link}>Ver politica de privacidad completa</Text>
        </Pressable>
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
  sectionStack: {
    gap: Spacing[2],
  },
  accordion: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  accordionCopy: {
    flex: 1,
    gap: 2,
  },
  accordionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  accordionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  accordionBody: {
    paddingHorizontal: Spacing[3],
    paddingBottom: Spacing[3],
    gap: Spacing[2],
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  tableDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.brand, 0.55),
  },
  tableLabel: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  metaStat: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  metaValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  metaLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  mutedNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  buttonStack: {
    gap: Spacing[2],
  },
  progressText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  link: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.brand,
    textAlign: 'center',
  },
});
