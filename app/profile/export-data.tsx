import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { loadRecentExportHistory, recordExportHistory, type ExportHistoryEntry } from '@/lib/export-history';
import { hydrateSensitiveExportData } from '@/lib/export-sensitive';
import { mergeWorkoutExportData } from '@/lib/workout-local-data';
import { supabase } from '@/lib/supabase';
import { useUIStore } from '@/stores/uiStore';

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

type FetchTableOptions = {
  select?: string;
  fromColumn?: string;
  fromValue?: string;
  limit?: number;
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
    hint: 'Perfil, consentimientos y estados de cuenta.',
    tables: [
      { key: 'profiles', label: 'Perfil', matchColumn: 'id' },
      { key: 'deletion_requests', label: 'Solicitudes de borrado', matchColumn: 'user_id', orderColumn: 'created_at' },
    ],
  },
  {
    id: 'health',
    title: 'Salud y hábitos',
    hint: 'Los logs diarios y la lectura de tu estado.',
    tables: [
      { key: 'water_logs', label: 'Agua', matchColumn: 'user_id', orderColumn: 'logged_at' },
      { key: 'step_logs', label: 'Pasos', matchColumn: 'user_id', orderColumn: 'logged_date' },
      { key: 'fasting_sessions', label: 'Ayuno', matchColumn: 'user_id', orderColumn: 'start_time' },
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
    hint: 'Entrenos, suplementos y trazas útiles del avance personal.',
    tables: [
      { key: 'workout_sessions', label: 'Sesiones de entreno', matchColumn: 'user_id', orderColumn: 'started_at' },
      { key: 'daily_scores', label: 'Scores diarios', matchColumn: 'user_id', orderColumn: 'date' },
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

function getExportTable(key: string): ExportTable {
  const table = SECTIONS.flatMap((section) => section.tables).find((item) => item.key === key);
  if (!table) {
    throw new Error(`Unknown export table: ${key}`);
  }
  return table;
}

function buildExportBundle(
  userId: string,
  userEmail: string | null | undefined,
  data: Record<string, unknown[]>,
): ExportBundle {
  return {
    exportedAt: new Date().toISOString(),
    userId,
    userEmail,
    data,
  };
}

async function fetchTable(table: ExportTable, userId: string, options: FetchTableOptions = {}) {
  let query = supabase
    .from(table.key)
    .select(options.select ?? '*')
    .eq(table.matchColumn, userId);

  if (options.fromColumn && options.fromValue) {
    query = query.gte(options.fromColumn, options.fromValue);
  }

  if (table.orderColumn) {
    query = query.order(table.orderColumn, { ascending: true });
  }

  if (Number.isFinite(options.limit)) {
    query = query.limit(Number(options.limit));
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function loadExportData(
  userId: string,
  tables: ExportTable[],
  options: {
    tableOptions?: Record<string, FetchTableOptions>;
    workoutSetsSelect?: string | null;
  } = {},
) {
  const exportData: Record<string, unknown[]> = {};
  let workoutSessionIds: string[] = [];

  for (const table of tables) {
    const rows = await fetchTable(table, userId, options.tableOptions?.[table.key]);
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

  if (options.workoutSetsSelect) {
    if (workoutSessionIds.length > 0) {
      const { data: workoutSets, error: workoutSetsError } = await supabase
        .from('workout_sets')
        .select(options.workoutSetsSelect)
        .in('session_id', workoutSessionIds)
        .order('set_number', { ascending: true });

      if (workoutSetsError) throw workoutSetsError;
      exportData.workout_sets = workoutSets ?? [];
    } else {
      exportData.workout_sets = [];
    }
  }

  return hydrateSensitiveExportData(mergeWorkoutExportData(exportData));
}

async function ensureExportsDir() {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!base) {
    throw new Error('No file system directory available');
  }
  const dir = `${base}vyra-exports/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch((e) => {
    console.debug?.('[export-data] makeDirectoryAsync failed', e);
  });
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
  const exportData = await loadExportData(
    userId,
    SECTIONS.flatMap((section) => section.tables),
    { workoutSetsSelect: '*' },
  );

  return buildExportBundle(userId, userEmail, exportData);
}

async function loadCsvBundle(
  userId: string,
  userEmail: string | null | undefined,
  type: 'weight' | 'sleep' | 'calories' | 'workout',
): Promise<ExportBundle> {
  if (type === 'weight') {
    const data = await loadExportData(userId, [getExportTable('weight_logs')]);
    return buildExportBundle(userId, userEmail, data);
  }

  if (type === 'sleep') {
    const data = await loadExportData(userId, [getExportTable('sleep_logs')]);
    return buildExportBundle(userId, userEmail, data);
  }

  if (type === 'calories') {
    const data = await loadExportData(userId, [getExportTable('meals')], {
      tableOptions: {
        meals: { select: 'logged_at, calories' },
      },
    });
    return buildExportBundle(userId, userEmail, data);
  }

  const data = await loadExportData(userId, [getExportTable('workout_sessions')], {
    tableOptions: {
      workout_sessions: { select: 'id, name, started_at, ended_at, duration_min, total_volume_kg' },
    },
    workoutSetsSelect: 'session_id, is_pr, set_number',
  });
  return buildExportBundle(userId, userEmail, data);
}

async function loadMonthlyPdfBundle(
  userId: string,
  userEmail: string | null | undefined,
): Promise<ExportBundle> {
  const monthAgoIso = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
  const data = await loadExportData(
    userId,
    [
      getExportTable('weight_logs'),
      getExportTable('sleep_logs'),
      getExportTable('workout_sessions'),
      getExportTable('meals'),
    ],
    {
      tableOptions: {
        weight_logs: {
          select: 'logged_at, weight_kg',
          fromColumn: 'logged_at',
          fromValue: monthAgoIso,
        },
        sleep_logs: {
          select: 'end_time, duration_min, quality_score, notes',
          fromColumn: 'end_time',
          fromValue: monthAgoIso,
        },
        workout_sessions: {
          select: 'id, name, started_at, ended_at, duration_min, total_volume_kg',
          fromColumn: 'started_at',
          fromValue: monthAgoIso,
        },
        meals: {
          select: 'logged_at, calories',
          fromColumn: 'logged_at',
          fromValue: monthAgoIso,
        },
      },
    },
  );

  return buildExportBundle(userId, userEmail, data);
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
    ['fecha', 'calorías'],
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
      session.name ?? 'Sesión de entreno',
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
          <div class="hint">${weightDelta != null ? `Cambio de ${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} kg en 30 días.` : 'Sin suficientes lecturas para tendencia.'}</div>
        </div>
        <div class="card">
          <div class="eyebrow">Sueño</div>
          <div class="value">${avgSleep ? `${avgSleep.toFixed(1)} h` : '--'}</div>
          <div class="hint">Promedio de las noches registradas en el último mes.</div>
        </div>
        <div class="card">
          <div class="eyebrow">Entreno</div>
          <div class="value">${workouts.length}</div>
          <div class="hint">Sesiones guardadas en los últimos 30 días.</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2>Sueño reciente</h2>
        <div class="hint">Ultimas noches registradas.</div>
        <div class="bars">${sleepBars || '<div class="hint">Sin datos suficientes.</div>'}</div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2>Calorías promedio por día</h2>
        <div class="value">${Math.round(avgCalories)}</div>
        <div class="hint">Promedio diario estimado con las comidas registradas del último mes.</div>
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
  const showToast = useUIStore((state) => state.showToast);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [openSection, setOpenSection] = useState<string>('identity');
  const [exportHistory, setExportHistory] = useState<ExportHistoryEntry[]>([]);
  const [localExportMessage, setLocalExportMessage] = useState<string | null>(null);

  const allTables = useMemo(() => SECTIONS.flatMap((section) => section.tables), []);

  useEffect(() => {
    let mounted = true;

    void loadRecentExportHistory().then((entries) => {
      if (!mounted) return;
      setExportHistory(entries);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function rememberExport(
    format: ExportHistoryEntry['format'],
    label: string,
    detail?: string | null,
  ) {
    const next = await recordExportHistory({ format, label, detail });
    setExportHistory(next);
  }

  async function withBundle<T>(
    label: string,
    load: () => Promise<ExportBundle>,
    fn: (bundle: ExportBundle) => Promise<T>,
  ) {
    if (!profile?.id) return null;
    setIsExporting(true);
    setProgress(label);
    setLocalExportMessage(null);
    try {
      const bundle = await load();
      return await fn(bundle);
    } catch (error) {
      console.error('[export-data] failed', error);
      showToast('No se pudo exportar en este momento.', 'error');
      return null;
    } finally {
      setProgress('');
      setIsExporting(false);
    }
  }

  async function handleExportJson() {
    if (!profile?.id) return;
    await withBundle(
      'Preparando JSON...',
      () => loadExportBundle(profile.id, profile.email),
      async (bundle) => {
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
      await rememberExport('json', 'JSON completo', `${allTables.length + 1} bloques base`);
      showToast('JSON listo para compartir.', 'success');
      },
    );
  }

  async function handleExportCsv(type: 'weight' | 'sleep' | 'calories' | 'workout') {
    const labelMap = {
      weight: 'Generando CSV de peso...',
      sleep: 'Generando CSV de sueño...',
      calories: 'Generando CSV de calorías...',
      workout: 'Generando CSV de entrenos...',
    } as const;

    if (!profile?.id) return;
    await withBundle(
      labelMap[type],
      () => loadCsvBundle(profile.id, profile.email, type),
      async (bundle) => {
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
      const csvLabels = {
        weight: 'CSV de peso',
        sleep: 'CSV de sueno',
        calories: 'CSV de calorias',
        workout: 'CSV de entrenos',
      } as const;
      await rememberExport('csv', csvLabels[type], filename);
      showToast(`${csvLabels[type]} listo para compartir.`, 'success');
      },
    );
  }

  async function handleExportPdf() {
    if (!profile?.id) return;
    await withBundle(
      'Generando PDF mensual...',
      () => loadMonthlyPdfBundle(profile.id, profile.email),
      async (bundle) => {
      const html = buildMonthlyPdfHtml(bundle);
      const result = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setLocalExportMessage(`PDF generado localmente en ${result.uri}`);
        await rememberExport('pdf', 'PDF mensual', result.uri);
        showToast('PDF generado en el dispositivo.', 'success');
        return;
      }
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Resumen mensual VYRA',
        UTI: 'com.adobe.pdf',
      });
      await rememberExport('pdf', 'PDF mensual', result.uri);
      showToast('PDF mensual listo para compartir.', 'success');
      },
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Exportar datos" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Tus datos, tuyos</Text>
          <Text style={styles.title}>Llevatelos cuando quieras.</Text>
          <Text style={styles.body}>
            Puedes sacar un JSON completo, CSV útiles por categoria y un PDF mensual visual
            para compartir con médico, nutricionista o entrenador.
          </Text>
        </Card>

        <NoticeCard
          title="Alcance actual del export"
          body="El export mezcla tu cuenta remota con el historial local de workout guardado para esta cuenta en este dispositivo. Si activaste modo estricto, Vyra rehidrata tambien los campos cifrados para que el archivo siga siendo legible para ti. La sync global sigue siendo parcial, asi que otros modulos con guardado local pueden tardar mas en alinearse por completo con backend."
          tone="warning"
        />

        {localExportMessage ? (
          <NoticeCard
            title="Archivo generado localmente"
            body={localExportMessage}
            tone="info"
          />
        ) : null}

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
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={section.title}
                    accessibilityHint={section.hint}
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
          <Text style={styles.sectionTitle}>Formatos útiles</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaStat}>
              <Text style={styles.metaValue}>{allTables.length + 1}</Text>
              <Text style={styles.metaLabel}>bloques base</Text>
            </View>
            <View style={styles.metaStat}>
              <Text style={styles.metaValue}>CSV</Text>
              <Text style={styles.metaLabel}>peso, sueño, calorías, entrenos</Text>
            </View>
            <View style={styles.metaStat}>
              <Text style={styles.metaValue}>PDF</Text>
              <Text style={styles.metaLabel}>resumen visual del último mes</Text>
            </View>
          </View>
          <Text style={styles.mutedNote}>
            El JSON conserva casi todo tu historial. Los CSV y el PDF sirven cuando quieres
            usar o compartir solo la parte importante.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Ultimas exportaciones</Text>
          <Text style={styles.sectionHint}>
            La app ya deja una traza visible de lo ultimo que generaste, incluso si el archivo quedo local.
          </Text>

          {exportHistory.length ? (
            <View style={styles.historyStack}>
              {exportHistory.map((entry, index) => (
                <View key={entry.id}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyCopy}>
                      <Text style={styles.historyTitle}>{entry.label}</Text>
                      <Text style={styles.historyMeta}>
                        {new Date(entry.createdAt).toLocaleString('es-UY')}
                      </Text>
                      {entry.detail ? <Text style={styles.historyDetail}>{entry.detail}</Text> : null}
                    </View>
                    <View style={styles.historyPill}>
                      <Text style={styles.historyPillText}>{entry.format.toUpperCase()}</Text>
                    </View>
                  </View>
                  {index < exportHistory.length - 1 ? <View style={styles.historyDivider} /> : null}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedNote}>
              Todavia no generaste exportaciones desde este dispositivo.
            </Text>
          )}
        </Card>

        <View style={styles.buttonStack}>
          <Button onPress={() => void handleExportJson()} loading={isExporting && progress.includes('JSON')} fullWidth color={Colors.brand}>
            {isExporting && progress.includes('JSON') ? progress : 'Exportar JSON completo'}
          </Button>
          <Button onPress={() => void handleExportCsv('weight')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de peso
          </Button>
          <Button onPress={() => void handleExportCsv('sleep')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de sueño
          </Button>
          <Button onPress={() => void handleExportCsv('calories')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de calorías
          </Button>
          <Button onPress={() => void handleExportCsv('workout')} variant="secondary" fullWidth color={Colors.brand}>
            CSV de entrenos
          </Button>
          <Button onPress={() => void handleExportPdf()} fullWidth color={Colors.info}>
            {isExporting && progress.includes('PDF') ? progress : 'PDF visual del último mes'}
          </Button>
        </View>

        {progress ? <Text style={styles.progressText}>{progress}</Text> : null}

        <Pressable
          onPress={() => router.push('/legal/privacy' as never)}
          accessibilityRole="button"
          accessibilityLabel="Ver politica de privacidad completa"
          accessibilityHint="Abre el documento legal completo sobre uso y tratamiento de tus datos."
        >
          <Text style={styles.link}>Ver politica de privacidad completa</Text>
        </Pressable>

        <ScreenFooterSpacer extra={Spacing[2]} />
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
  historyStack: {
    gap: Spacing[2],
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  historyCopy: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  historyDetail: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  historyPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: 5,
  },
  historyPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  historyDivider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
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
