import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useReadiness } from '@/hooks/useReadiness';
import { supabase } from '@/lib/supabase';

type ScheduledNotificationRow = Record<string, unknown>;

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
	return (
		<View style={styles.metricCard}>
			<Text style={[styles.metricValue, { color: accent }]} numberOfLines={1}>
				{value}
			</Text>
			<Text style={styles.metricLabel}>{label}</Text>
		</View>
	);
}

function RouteStat({
	label,
	value,
	hint,
	accent,
}: {
	label: string;
	value: string;
	hint: string;
	accent: string;
}) {
	return (
		<View style={styles.routeStat}>
			<Text style={styles.routeStatLabel}>{label}</Text>
			<Text style={[styles.routeStatValue, { color: accent }]} numberOfLines={1}>
				{value}
			</Text>
			<Text style={styles.routeStatHint}>{hint}</Text>
		</View>
	);
}

function pickString(row: ScheduledNotificationRow, keys: string[], fallback: string) {
	for (const key of keys) {
		const value = row[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return fallback;
}

function formatStamp(value: string | null) {
	if (!value) return 'Sin fecha';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Sin fecha';
	return new Intl.DateTimeFormat('es-ES', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

function startOfTodayIso() {
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now.toISOString();
}

function rowDateValue(row: ScheduledNotificationRow) {
	const raw = pickString(row, ['scheduled_for', 'created_at', 'updated_at'], '');
	return raw || null;
}

export default function NotificationsHistoryScreen() {
	const profile = useAuthStore((state) => state.profile);
	const settings = useSettingsStore();
	const {
		permissionGranted,
		prefs,
		deliveryMode,
		smartNotifsSentToday,
	} = useNotifications();
	const {
		dailyScore,
		predictedScore,
		weeklyAverage,
		scoreColor,
		similarDayComparison,
		focusActions,
		morningNarrative,
	} = useReadiness();

	const [rows, setRows] = useState<ScheduledNotificationRow[]>([]);
	const [loadingRows, setLoadingRows] = useState(true);

	useEffect(() => {
		let alive = true;

		const load = async () => {
			if (!profile?.id) {
				if (alive) {
					setRows([]);
					setLoadingRows(false);
				}
				return;
			}

			setLoadingRows(true);
			try {
				const { data, error } = await supabase
					.from('scheduled_notifications')
					.select('*')
					.eq('user_id', profile.id)
					.order('scheduled_for', { ascending: false })
					.limit(14);

				if (error) throw error;
				if (alive) {
					setRows(Array.isArray(data) ? (data as ScheduledNotificationRow[]) : []);
				}
			} catch {
				if (alive) {
					setRows([]);
				}
			} finally {
				if (alive) {
					setLoadingRows(false);
				}
			}
		};

		void load();
		return () => {
			alive = false;
		};
	}, [profile?.id]);

	const focusAction = focusActions[0] ?? null;
	const coachName = profile?.coach_name_preference ?? 'Vyra';
	const enabledPrefsCount = Object.values(prefs).filter(Boolean).length;
	const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
	const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.brand;
	const scoreVsWeek =
		dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
	const historyTodayCount = useMemo(() => {
		const todayStart = startOfTodayIso();
		return rows.filter((row) => {
			const stamp = rowDateValue(row);
			return stamp ? stamp >= todayStart : false;
		}).length;
	}, [rows]);
	const latestRow = rows[0] ?? null;
	const latestStamp = latestRow ? rowDateValue(latestRow) : null;
	const latestType = latestRow
		? pickString(latestRow, ['notification_type', 'type', 'category', 'kind'], 'Ruta mixta')
		: 'Sin historial';
	const latestStatus = latestRow
		? pickString(latestRow, ['status', 'delivery_mode', 'channel'], 'programada')
		: 'pendiente';
	const fatigueMode = !permissionGranted
		? 'Permiso'
		: smartNotifsSentToday >= settings.maxNotifsPerDay
			? 'Alta'
			: enabledPrefsCount >= 5
				? 'Media'
				: 'Baja';
	const returnMode = !permissionGranted
		? 'Recuperar'
		: !settings.notificationsEnabled
			? 'Reconectar'
			: rows.length === 0
				? 'Construir'
				: smartNotifsSentToday >= settings.maxNotifsPerDay
					? 'Filtrar'
					: 'Sostener';

	const coachTitle = !permissionGranted
		? `${coachName} ve un hueco de permiso y quiere recuperar la capa base antes de leer el historial.`
		: !settings.notificationsEnabled
			? `${coachName} ve el sistema en pausa y quiere reactivar primero el retorno antes de sacar conclusiones del historial.`
			: rows.length === 0
				? `${coachName} todavia no ve memoria suficiente y quiere construir una primera semana de avisos util.`
				: smartNotifsSentToday >= settings.maxNotifsPerDay
					? `${coachName} detecta fatiga de avisos hoy y quiere limpiar ruido antes de seguir empujando.`
					: `${coachName} ya puede leer que rutas sostienen el dia y cuales se estan enfriando.`;

	const coachBody = !permissionGranted
		? 'Sin permiso del sistema, el historial pierde valor practico porque la capa que deberia volver al dia esta rota desde origen.'
		: !settings.notificationsEnabled
			? 'Si el sistema esta apagado, el historial solo cuenta una memoria vieja y ya no protege el retorno actual.'
			: similarDayComparison?.message ??
				morningNarrative ??
				`Hay ${rows.length} registros recientes, ${historyTodayCount} tocando hoy y el motor ${deliveryMode === 'remote' ? 'remoto' : 'local'} sigue ${settings.notificationsEnabled ? 'activo' : 'en pausa'}.`;

	const coachHint = !permissionGranted
		? 'Siguiente lectura util: recupera permisos antes de leer fatiga o cobertura.'
		: !settings.notificationsEnabled
			? 'Siguiente lectura util: vuelve a activar notificaciones y guarda para reconstruir la memoria viva del panel.'
			: rows.length === 0
				? 'Siguiente lectura util: construye una base minima con resumen, racha o mental antes de juzgar el ritmo.'
				: smartNotifsSentToday >= settings.maxNotifsPerDay
					? 'Siguiente lectura util: revisa el hub y apaga lo que no este moviendo el dia real.'
					: focusAction
						? `Siguiente lectura util: ${focusAction.title}.`
						: 'Siguiente lectura util: si el historial ya esta sano, coach y resumen te dicen si conviene sostener o corregir.';

	const routeActionTitle = !permissionGranted
		? 'Recuperar permiso del sistema'
		: !settings.notificationsEnabled
			? 'Reconectar el panel de avisos'
			: rows.length === 0
				? 'Construir memoria de la semana'
				: smartNotifsSentToday >= settings.maxNotifsPerDay
					? 'Limpiar fatiga del dia'
					: 'Sostener las rutas que ya funcionan';

	const primaryActionLabel = !permissionGranted
		? 'Abrir ajustes'
		: !settings.notificationsEnabled || rows.length === 0 || smartNotifsSentToday >= settings.maxNotifsPerDay
			? 'Abrir notificaciones'
			: focusAction
				? 'Seguir foco'
				: 'Abrir resumen';

	const handlePrimaryAction = () => {
		if (!permissionGranted || !settings.notificationsEnabled || rows.length === 0 || smartNotifsSentToday >= settings.maxNotifsPerDay) {
			router.push(Routes.settings.notificationsSettings as any);
			return;
		}
		if (focusAction) {
			router.push(focusAction.route as any);
			return;
		}
		router.push(Routes.dailySummary as any);
	};

	return (
		<SafeScreen padHorizontal={false} padBottom>
			<Header
				title="Historial de notificaciones"
				subtitle="Memoria, fatiga y retorno"
				showBack
				color={Colors.brand}
			/>

			<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
				<Card style={styles.routeCard} accentColor={Colors.brand}>
					<Text style={styles.routeEyebrow}>Coach contextual</Text>
					<Text style={styles.routeTitle}>{coachTitle}</Text>
					<Text style={styles.routeBody} numberOfLines={3}>{coachBody}</Text>

					<View style={styles.routeStatsRow}>
						<RouteStat
							label="Score"
							value={dayScore !== null ? `${dayScore}` : '--'}
							hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura'}
							accent={dayScoreAccent}
						/>
						<RouteStat
							label="Retorno"
							value={returnMode}
							hint={rows.length > 0 ? latestType : 'sin base'}
							accent={!permissionGranted ? Colors.warning : Colors.brand}
						/>
						<RouteStat
							label="Ritmo"
							value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : fatigueMode}
							hint={scoreVsWeek !== null ? 'vs semana' : 'fatiga'}
							accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
						/>
					</View>

					<View style={styles.routeActionRow}>
						<View style={styles.routeActionCopy}>
							<Text style={styles.routeActionLabel}>Siguiente lectura</Text>
							<Text style={styles.routeActionTitle}>{routeActionTitle}</Text>
							<Text style={styles.routeActionHint} numberOfLines={3}>{coachHint}</Text>
						</View>
					</View>

					<View style={styles.routeButtons}>
						<Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.brand} />
						{primaryActionLabel !== 'Abrir notificaciones' ? (
							<Button onPress={() => router.push(Routes.settings.notificationsSettings as any)} label="Abrir notificaciones" size="sm" variant="secondary" color={Colors.brand} />
						) : null}
						<Button onPress={() => router.push(Routes.settings.notificationsSettings as any)} label="Ajustes finos" size="sm" variant="secondary" color={Colors.brand} />
						<Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.brand} />
					</View>
				</Card>

				<Card style={styles.heroCard} accentColor={Colors.brand}>
					<View style={styles.heroHeader}>
						<View style={styles.heroCopy}>
							<Text style={styles.eyebrow}>Memoria viva</Text>
							<Text style={styles.heroTitle} numberOfLines={3}>
								El historial ya no es archivo pasivo: ahora dice si hoy toca limpiar ruido o sostener rutas.
							</Text>
							<Text style={styles.heroBody} numberOfLines={2}>
								Desde aqui leemos si el panel viene sano o si hay fatiga o si el retorno se enfrio.
							</Text>
						</View>
						<View style={styles.heroBadge}>
							<Ionicons name="time-outline" size={22} color={Colors.brand} />
						</View>
					</View>

					<View style={styles.metricRow}>
						<Metric label="Registros" value={loadingRows ? '...' : `${rows.length}`} accent={Colors.brand} />
						<Metric label="Hoy" value={loadingRows ? '...' : `${historyTodayCount}`} accent={Colors.coach} />
						<Metric label="Motor" value={deliveryMode === 'remote' ? 'Remoto' : 'Local'} accent={Colors.textPrimary} />
					</View>
				</Card>

				<Card>
					<Text style={styles.sectionTitle}>Ruta del historial</Text>
					<Text style={styles.sectionHint}>
						Lee rapido si el panel viene sano, si hay fatiga o si el retorno se enfrio.
					</Text>

					<View style={styles.summaryGrid}>
						<View style={styles.summaryBox}>
							<Text style={styles.summaryLabel}>Fatiga</Text>
							<Text style={styles.summaryValue}>{fatigueMode}</Text>
							<Text style={styles.summaryHint}>{smartNotifsSentToday}/{settings.maxNotifsPerDay} hoy</Text>
						</View>
						<View style={styles.summaryBox}>
							<Text style={styles.summaryLabel}>Cobertura</Text>
							<Text style={styles.summaryValue}>{enabledPrefsCount}/7</Text>
							<Text style={styles.summaryHint}>rutas activas</Text>
						</View>
						<View style={styles.summaryBox}>
							<Text style={styles.summaryLabel}>Ultima ruta</Text>
							<Text style={styles.summaryValue}>{rows.length > 0 ? latestType : 'Vacia'}</Text>
							<Text style={styles.summaryHint}>{rows.length > 0 ? latestStatus : 'sin registro'}</Text>
						</View>
						<View style={styles.summaryBox}>
							<Text style={styles.summaryLabel}>Ultimo toque</Text>
							<Text style={styles.summaryValue}>{rows.length > 0 ? formatStamp(latestStamp) : 'Sin fecha'}</Text>
							<Text style={styles.summaryHint}>{permissionGranted ? 'permiso OK' : 'permiso off'}</Text>
						</View>
					</View>
				</Card>

				<Card>
					<Text style={styles.sectionTitle}>Linea reciente</Text>
					<Text style={styles.sectionHint}>
						Lo ultimo que el sistema intento programar para devolverte al dia.
					</Text>

					<View style={styles.eventStack}>
						{loadingRows ? (
							<View style={styles.eventRow}>
								<Text style={styles.eventTitle}>Cargando historial...</Text>
								<Text style={styles.eventMeta}>Leyendo memoria reciente del panel.</Text>
							</View>
						) : rows.length === 0 ? (
							<View style={styles.eventRow}>
								<Text style={styles.eventTitle}>Todavia no hay memoria suficiente</Text>
								<Text style={styles.eventMeta}>
									En cuanto el sistema programe avisos, esta linea mostrara que ruta sostuvo o
									rompio el retorno de la semana.
								</Text>
							</View>
						) : (
							rows.map((row, index) => {
								const type = pickString(row, ['notification_type', 'type', 'category', 'kind'], 'Ruta mixta');
								const title = pickString(row, ['title', 'message_title', 'body', 'message_body'], 'Notificacion programada');
								const status = pickString(row, ['status', 'delivery_mode', 'channel'], 'programada');
								const stamp = formatStamp(rowDateValue(row));
								return (
									<View key={`${type}_${stamp}_${index}`} style={styles.eventRow}>
										<View style={styles.eventTopRow}>
											<Text style={styles.eventTitle}>{title}</Text>
											<View style={styles.eventPill}>
												<Text style={styles.eventPillText}>{type}</Text>
											</View>
										</View>
										<Text style={styles.eventMeta}>{stamp}</Text>
										<Text style={styles.eventBody}>{status}</Text>
									</View>
								);
							})
						)}
					</View>
				</Card>
			</ScrollView>
		</SafeScreen>
	);
}

const styles = StyleSheet.create({
	scroll: {
		paddingHorizontal: Spacing[5],
		paddingTop: Spacing[5],
		paddingBottom: Spacing[12],
		gap: Spacing[4],
	},
	heroCard: { gap: Spacing[4] },
	heroHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: Spacing[3],
	},
	heroCopy: { flex: 1, gap: 6 },
	eyebrow: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.xs,
		color: Colors.brand,
	},
	heroTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.xl,
		color: Colors.textPrimary,
		lineHeight: 28,
	},
	heroBody: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	heroBadge: {
		width: 46,
		height: 46,
		borderRadius: Radius.full,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: withOpacity(Colors.brand, 0.14),
	},
	metricRow: { flexDirection: 'row', gap: Spacing[2] },
	metricCard: {
		flex: 1,
		minWidth: 0,
		padding: Spacing[3],
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: withOpacity(Colors.white, 0.04),
		gap: 4,
	},
	metricValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
	metricLabel: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
	},
	routeCard: { gap: Spacing[4] },
	routeEyebrow: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.xs,
		color: Colors.brand,
	},
	routeTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.xl,
		color: Colors.textPrimary,
		lineHeight: 28,
	},
	routeBody: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	routeStatsRow: { flexDirection: 'row', gap: Spacing[2] },
	routeStat: {
		flex: 1,
		minWidth: 0,
		padding: Spacing[3],
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: withOpacity(Colors.white, 0.04),
		gap: 4,
	},
	routeStatLabel: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.textMuted,
	},
	routeStatValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
	routeStatHint: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
	},
	routeActionRow: {
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: withOpacity(Colors.brand, 0.24),
		backgroundColor: withOpacity(Colors.brand, 0.1),
		padding: Spacing[3],
	},
	routeActionCopy: { gap: 4 },
	routeActionLabel: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.brand,
	},
	routeActionTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.base,
		color: Colors.textPrimary,
	},
	routeActionHint: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	routeButtons: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },
	sectionTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.lg,
		color: Colors.textPrimary,
	},
	sectionHint: {
		marginTop: Spacing[2],
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	summaryGrid: {
		marginTop: Spacing[4],
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: Spacing[2],
	},
	summaryBox: {
		flexBasis: '48%',
		flexGrow: 1,
		minWidth: 130,
		padding: Spacing[3],
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: Colors.surface2,
		gap: 4,
	},
	summaryLabel: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.textMuted,
	},
	summaryValue: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.base,
		color: Colors.textPrimary,
	},
	summaryHint: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.xs,
		lineHeight: 18,
		color: Colors.textSecondary,
	},
	eventStack: { marginTop: Spacing[4], gap: Spacing[3] },
	eventRow: {
		borderRadius: Radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: Colors.surface2,
		padding: Spacing[3],
		gap: 6,
	},
	eventTopRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: Spacing[2],
	},
	eventTitle: {
		flex: 1,
		fontFamily: FontFamily.bold,
		fontSize: FontSize.base,
		color: Colors.textPrimary,
	},
	eventMeta: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.brand,
	},
	eventBody: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.xs,
		lineHeight: 18,
		color: Colors.textSecondary,
	},
	eventPill: {
		borderRadius: Radius.full,
		borderWidth: 1,
		borderColor: withOpacity(Colors.brand, 0.28),
		backgroundColor: withOpacity(Colors.brand, 0.12),
		paddingHorizontal: Spacing[2],
		paddingVertical: 4,
	},
	eventPillText: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.brand,
	},
});
