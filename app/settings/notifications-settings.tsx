import React from 'react';
import {
	Alert,
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useNotifications, type NotifPreferences } from '@/hooks/useNotifications';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useReadiness } from '@/hooks/useReadiness';

type RouteKey =
	| 'notifSummary'
	| 'notifCoach'
	| 'notifStreak'
	| 'notifWater'
	| 'notifSteps'
	| 'notifFasting';

const ROUTE_ROWS: Array<{ key: RouteKey; label: string; hint: string }> = [
	{ key: 'notifSummary', label: 'Resumen diario', hint: 'Protege el cierre y el score del dia.' },
	{ key: 'notifCoach', label: 'Coach proactivo', hint: 'Empuja cuando detecta huecos reales.' },
	{ key: 'notifStreak', label: 'Racha', hint: 'Evita perder continuidad por olvido.' },
	{ key: 'notifWater', label: 'Agua', hint: 'Sostiene la base fisica del retorno.' },
	{ key: 'notifSteps', label: 'Pasos', hint: 'Recuerda mover el dia cuando se enfria.' },
	{ key: 'notifFasting', label: 'Ayuno', hint: 'Protege ventanas, fases y cierres.' },
];

const PREF_ROWS: Array<{ key: keyof NotifPreferences; label: string; hint: string; icon: keyof typeof Ionicons.glyphMap }> = [
	{ key: 'water', label: 'Agua', hint: 'Recordatorios segun ritmo real.', icon: 'water-outline' },
	{ key: 'mental', label: 'Mental', hint: 'Check-in temprano y simple.', icon: 'sparkles-outline' },
	{ key: 'sleep', label: 'Sueno', hint: 'Cierre antes de dormir.', icon: 'moon-outline' },
	{ key: 'dailySummary', label: 'Resumen', hint: 'Lectura final del dia.', icon: 'analytics-outline' },
	{ key: 'streakAtRisk', label: 'Racha', hint: 'Ultimo empujon cuando falta volver.', icon: 'flame-outline' },
	{ key: 'supplements', label: 'Suplementos', hint: 'Tomas pendientes del stack.', icon: 'medical-outline' },
	{ key: 'workout', label: 'Entreno', hint: 'Aviso cuando el bloque se enfria.', icon: 'barbell-outline' },
];

function SectionHeader({ title, hint }: { title: string; hint: string }) {
	return (
		<View style={styles.sectionHeader}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<Text style={styles.sectionHint}>{hint}</Text>
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

function SwitchRow({
	title,
	hint,
	value,
	onValueChange,
	accent,
}: {
	title: string;
	hint: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
	accent: string;
}) {
	return (
		<View style={styles.switchRow}>
			<View style={styles.switchCopy}>
				<Text style={styles.switchLabel}>{title}</Text>
				<Text style={styles.switchHint}>{hint}</Text>
			</View>
			<Switch
				value={value}
				onValueChange={onValueChange}
				trackColor={{ false: Colors.border, true: `${accent}66` }}
				thumbColor={value ? accent : Colors.textMuted}
			/>
		</View>
	);
}

export default function NotificationsSettingsScreen() {
	const {
		permissionGranted,
		prefs,
		updatePref,
		savePrefs,
		requestPermissions,
		smartNotifsSentToday,
		deliveryMode,
	} = useNotifications();
	const settings = useSettingsStore();
	const profile = useAuthStore((state) => state.profile);
	const {
		dailyScore,
		predictedScore,
		weeklyAverage,
		scoreColor,
		similarDayComparison,
		focusActions,
		morningNarrative,
	} = useReadiness();
	const [saving, setSaving] = React.useState(false);

	const coachName = profile?.coach_name_preference ?? 'Vyra';
	const focusAction = focusActions[0] ?? null;
	const enabledRouteCount = ROUTE_ROWS.reduce((sum, row) => sum + Number(Boolean(settings[row.key])), 0);
	const enabledPrefCount = PREF_ROWS.reduce((sum, row) => sum + Number(Boolean(prefs[row.key])), 0);
	const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
	const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.brand;
	const scoreVsWeek =
		dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
	const noisyMode = settings.maxNotifsPerDay >= 3 && enabledPrefCount >= 5;
	const returnMode = !permissionGranted
		? 'Permiso'
		: !settings.notificationsEnabled
			? 'Activar'
			: !settings.notifSummary || !settings.notifCoach
				? 'Proteger'
				: noisyMode
					? 'Limpiar'
					: 'Sostener';
	const cadenceMode =
		settings.maxNotifsPerDay <= 1 ? 'Fino' : settings.maxNotifsPerDay === 2 ? 'Balance' : 'Amplio';

	const coachTitle = !permissionGranted
		? `${coachName} necesita recuperar permisos antes de prometer retorno real desde fuera de la app.`
		: !settings.notificationsEnabled
			? `${coachName} ve el sistema en pausa y quiere reactivar la capa de avisos sin volver al ruido.`
			: !settings.notifSummary
				? `${coachName} quiere recuperar el cierre del dia antes de seguir afinando el resto del panel.`
				: !settings.notifCoach
					? `${coachName} quiere devolverle proactividad al sistema para no depender de abrir la app por memoria.`
					: noisyMode
						? `${coachName} detecta demasiada cobertura para un dia que pide mas precision que empuje.`
						: `${coachName} ve un panel bastante sano y ahora conviene sostener solo lo que realmente mueve el dia.`;

	const coachBody =
		similarDayComparison?.message ??
		morningNarrative ??
		(!permissionGranted
			? 'Sin permiso del sistema, el panel puede verse fino pero no reaparece cuando el dia se enfria.'
			: !settings.notificationsEnabled
				? 'Si el switch maestro esta apagado, la app pierde la capa mas visible para proteger score, racha y resumen.'
				: `Hoy tienes ${enabledRouteCount} rutas clave activas, ${enabledPrefCount}/${PREF_ROWS.length} canales programables vivos y ${smartNotifsSentToday}/${settings.maxNotifsPerDay} empujes inteligentes usados.`);

	const coachHint = !permissionGranted
		? 'Siguiente lectura util: abre ajustes del sistema y recupera el permiso antes de seguir filtrando.'
		: !settings.notificationsEnabled
			? 'Siguiente lectura util: reactiva el panel maestro y guarda para reconstruir la capa de retorno.'
			: !settings.notifSummary
				? 'Siguiente lectura util: el resumen diario suele ser la forma mas limpia de no perder el hilo al cerrar.'
				: !settings.notifCoach
					? 'Siguiente lectura util: sin coach proactivo el sistema se vuelve correcto, pero demasiado silencioso cuando el dia se cae.'
					: noisyMode
						? 'Siguiente lectura util: baja el cap o limpia rutas antes de meter mas empujes a una semana ya cargada.'
						: focusAction
							? `Siguiente lectura util: ${focusAction.title}.`
							: 'Siguiente lectura util: el panel ya esta bastante limpio; ahora vale mas sostener que seguir tocando switches.';

	const primaryActionLabel = !permissionGranted
		? 'Abrir ajustes'
		: !settings.notificationsEnabled
			? 'Activar avisos'
			: !settings.notifSummary
				? 'Proteger resumen'
				: !settings.notifCoach
					? 'Activar coach'
					: noisyMode
						? 'Bajar ruido'
						: 'Guardar panel';

	const handlePermissionRecovery = async () => {
		const granted = await requestPermissions();
		if (!granted) {
			await Linking.openSettings();
		}
	};

	const persistPanel = async () => {
		setSaving(true);
		try {
			await savePrefs();
		} finally {
			setSaving(false);
		}
	};

	const handlePrimaryAction = async () => {
		if (!permissionGranted) {
			await handlePermissionRecovery();
			return;
		}
		if (!settings.notificationsEnabled) {
			settings.setNotificationsEnabled(true);
			await persistPanel();
			return;
		}
		if (!settings.notifSummary) {
			settings.toggleNotif('notifSummary');
			await persistPanel();
			return;
		}
		if (!settings.notifCoach) {
			settings.toggleNotif('notifCoach');
			await persistPanel();
			return;
		}
		if (noisyMode) {
			settings.setMaxNotifsPerDay(2);
			await persistPanel();
			return;
		}
		await persistPanel();
		if (focusAction) {
			router.push(focusAction.route as any);
			return;
		}
		router.push(Routes.dailySummary as any);
	};

	const handleMasterToggle = (value: boolean) => {
		if (!value) {
			Alert.alert(
				'Pausar panel',
				'Pausaras la capa de avisos del sistema. Puedes volver a activarla cuando quieras.',
				[
					{ text: 'Cancelar', style: 'cancel' },
					{ text: 'Pausar', style: 'destructive', onPress: () => settings.setNotificationsEnabled(false) },
				],
			);
			return;
		}
		settings.setNotificationsEnabled(true);
	};

	const openTarget = (route: string) => {
		router.push(route as any);
	};

	return (
		<SafeScreen padHorizontal={false} padBottom>
			<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
				<Header
					color={Colors.brand}
					eyebrow="Notificaciones"
					title="Ajustes finos"
					subtitle={settings.notificationsEnabled ? 'Ruido, ventanas y rutas clave' : 'Panel maestro en pausa'}
					rightElement={
						<Pressable
							style={[styles.headerIconButton, { borderColor: withOpacity(Colors.brand, 0.24) }]}
							onPress={() => router.push(Routes.settings.notificationsHistory as any)}
						>
							<Ionicons name="time-outline" size={18} color={Colors.textPrimary} />
						</Pressable>
					}
				/>

				<Card style={styles.coachCard}>
					<View style={styles.sectionHeader}>
						<Text style={styles.coachEyebrow}>Coach contextual</Text>
						<Text style={styles.coachTitle}>{coachTitle}</Text>
						<Text style={styles.coachBody} numberOfLines={3}>{coachBody}</Text>
					</View>

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
							hint={`${enabledRouteCount} rutas clave`}
							accent={!permissionGranted ? Colors.warning : Colors.brand}
						/>
						<RouteStat
							label="Ritmo"
							value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : cadenceMode}
							hint={scoreVsWeek !== null ? 'vs semana' : `${smartNotifsSentToday}/${settings.maxNotifsPerDay} hoy`}
							accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
						/>
					</View>

					<View style={styles.routeActionRow}>
						<View style={styles.routeActionCopy}>
							<Text style={styles.routeActionLabel}>Siguiente lectura</Text>
							<Text style={styles.routeActionTitle}>
								{!permissionGranted
									? 'Recupera el permiso del sistema'
									: !settings.notificationsEnabled
										? 'Reactiva el panel maestro'
										: !settings.notifSummary || !settings.notifCoach
											? 'Protege rutas clave antes de afinar'
											: noisyMode
												? 'Baja el ruido antes de seguir'
												: 'El panel ya esta listo para sostener'}
							</Text>
							<Text style={styles.routeActionHint} numberOfLines={3}>{coachHint}</Text>
						</View>
						<View style={styles.routeButtons}>
							<Button onPress={() => void handlePrimaryAction()} label={primaryActionLabel} size="sm" color={Colors.coach} loading={saving} />
							<Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />
							<Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />
						</View>
					</View>
				</Card>

				<Card accentColor={Colors.brand} style={styles.heroCard}>
					<Text style={styles.heroTitle} numberOfLines={2}>Control fino del retorno</Text>
					<Text style={styles.heroBody} numberOfLines={2}>
						Aqui decides cuanto silencio, cuanta proactividad y cuantas rutas clave merece el dia.
					</Text>
					<View style={styles.heroActions}>
						<Button onPress={() => router.push(Routes.settings.index as any)} label="Abrir hub de avisos" color={Colors.brand} fullWidth />
						<Button onPress={() => router.push(Routes.settings.notificationsHistory as any)} label="Abrir historial" variant="secondary" color={Colors.brand} fullWidth />
					</View>
				</Card>

				<Card>
					<SectionHeader
						title="Ventana y cap del dia"
						hint="No todo aviso que puede salir deberia salir. Aqui decides ritmo maximo y silencio base."
					/>

					<View style={styles.summaryGrid}>
						<View style={styles.summaryBox}>
							<Text style={styles.summaryLabel}>Silencio</Text>
							<Text style={styles.summaryValue}>22:00 - 07:00</Text>
							<Text style={styles.summaryHint}>Bloque global protegido para no romper el cierre.</Text>
						</View>
						<View style={styles.summaryBox}>
							<Text style={styles.summaryLabel}>Motor</Text>
							<Text style={styles.summaryValue}>{settings.notificationsEnabled ? (deliveryMode === 'remote' ? 'Remoto' : 'Local') : 'Pausa'}</Text>
							<Text style={styles.summaryHint}>{permissionGranted ? 'permiso listo' : 'permiso pendiente'}</Text>
						</View>
					</View>

					<Text style={styles.inlineLabel}>Cap de empujes inteligentes</Text>
					<View style={styles.capRow}>
						{[1, 2, 3].map((value) => {
							const active = settings.maxNotifsPerDay === value;
							return (
								<Pressable
									key={value}
									style={[
										styles.capPill,
										active && {
											borderColor: withOpacity(Colors.brand, 0.34),
											backgroundColor: withOpacity(Colors.brand, 0.12),
										},
									]}
									onPress={() => settings.setMaxNotifsPerDay(value)}
								>
									<Text style={[styles.capPillValue, active && { color: Colors.brand }]}>{value}</Text>
									<Text style={styles.capPillHint}>{value === 1 ? 'muy fino' : value === 2 ? 'balance' : 'mas amplio'}</Text>
								</Pressable>
							);
						})}
					</View>
				</Card>

				<Card>
					<SectionHeader
						title="Rutas clave del sistema"
						hint="Son los canales que mas sostienen retorno diario aun cuando no abras la app."
					/>

					<SwitchRow
						title="Panel maestro"
						hint="Activa o pausa toda la capa de avisos de Vyra."
						value={settings.notificationsEnabled}
						onValueChange={handleMasterToggle}
						accent={Colors.brand}
					/>

					{ROUTE_ROWS.map((row) => (
						<SwitchRow
							key={row.key}
							title={row.label}
							hint={row.hint}
							value={Boolean(settings[row.key])}
							onValueChange={() => settings.toggleNotif(row.key)}
							accent={Colors.brand}
						/>
					))}

					<SwitchRow
						title="Haptica"
						hint="Feedback tactil para confirmar acciones clave sin mirar la pantalla."
						value={settings.hapticsEnabled}
						onValueChange={settings.setHapticsEnabled}
						accent={Colors.brand}
					/>
				</Card>

				<Card accentColor={Colors.info}>
					<SectionHeader
						title="Canales programables"
						hint="Estas rutas se guardan juntas para que el motor de avisos y la memoria hablen el mismo idioma."
					/>

					{PREF_ROWS.map((row) => (
						<View key={row.key} style={styles.prefRow}>
							<View style={styles.prefIcon}>
								<Ionicons name={row.icon} size={16} color={Colors.brand} />
							</View>
							<View style={styles.prefCopy}>
								<Text style={styles.prefLabel}>{row.label}</Text>
								<Text style={styles.prefHint}>{row.hint}</Text>
							</View>
							<Switch
								value={Boolean(prefs[row.key])}
								onValueChange={(value) => updatePref(row.key, value)}
								trackColor={{ false: Colors.border, true: `${Colors.brand}66` }}
								thumbColor={prefs[row.key] ? Colors.brand : Colors.textMuted}
							/>
						</View>
					))}

					<Text style={styles.footerHint}>
						Los cambios finos del motor se sincronizan al tocar `Guardar panel`, para que la memoria viva y la programacion vuelvan a alinearse.
					</Text>
				</Card>

				<Card>
					<SectionHeader
						title="Siguiente salida util"
						hint="Si no conviene seguir afinando, mejor salir rapido a la capa que mas mueve el dia."
					/>

					<View style={styles.linkList}>
						{[
							{ label: 'Volver al hub de avisos', route: Routes.settings.index },
							{ label: 'Abrir historial de avisos', route: Routes.settings.notificationsHistory },
							{ label: 'Abrir coach', route: Routes.coach.index },
							{ label: 'Abrir resumen del dia', route: Routes.dailySummary },
						].map((item) => (
							<Pressable key={item.label} style={styles.linkRow} onPress={() => openTarget(item.route)}>
								<Text style={styles.linkText}>{item.label}</Text>
								<Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
							</Pressable>
						))}
					</View>
				</Card>
			</ScrollView>
		</SafeScreen>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: Spacing[5],
		paddingTop: Spacing[5],
		paddingBottom: Spacing[10],
		gap: Spacing[4],
	},
	headerIconButton: {
		width: 46,
		height: 46,
		borderRadius: Radius.full,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.surface2,
	},
	heroCard: { gap: Spacing[3] },
	heroTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.lg,
		color: Colors.textPrimary,
	},
	heroBody: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	heroActions: { gap: Spacing[2] },
	coachCard: {
		borderWidth: 1,
		borderColor: `${Colors.coach}45`,
		backgroundColor: `${Colors.coach}0D`,
	},
	coachEyebrow: {
		fontFamily: FontFamily.semibold,
		fontSize: FontSize.xs,
		color: Colors.coach,
	},
	coachTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.lg,
		color: Colors.textPrimary,
	},
	coachBody: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
	},
	sectionHeader: { gap: 6 },
	sectionTitle: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.lg,
		color: Colors.textPrimary,
	},
	sectionHint: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.sm,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	routeStatsRow: { flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[3] },
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
		borderColor: withOpacity(Colors.coach, 0.24),
		backgroundColor: withOpacity(Colors.coach, 0.08),
		padding: Spacing[3],
		gap: Spacing[3],
	},
	routeActionCopy: { gap: 4 },
	routeActionLabel: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.coach,
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
	routeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
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
	inlineLabel: {
		marginTop: Spacing[4],
		fontFamily: FontFamily.semibold,
		fontSize: FontSize.sm,
		color: Colors.textPrimary,
	},
	capRow: {
		marginTop: Spacing[3],
		flexDirection: 'row',
		gap: Spacing[2],
	},
	capPill: {
		flex: 1,
		minWidth: 0,
		paddingVertical: Spacing[3],
		paddingHorizontal: Spacing[2],
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: Colors.surface2,
		alignItems: 'center',
		gap: 2,
	},
	capPillValue: {
		fontFamily: FontFamily.bold,
		fontSize: FontSize.base,
		color: Colors.textPrimary,
	},
	capPillHint: {
		fontFamily: FontFamily.medium,
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
	},
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: Spacing[3],
		paddingVertical: Spacing[3],
		borderBottomWidth: 1,
		borderBottomColor: withOpacity(Colors.border, 0.7),
	},
	switchCopy: { flex: 1, gap: 4 },
	switchLabel: {
		fontFamily: FontFamily.semibold,
		fontSize: FontSize.sm,
		color: Colors.textPrimary,
	},
	switchHint: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.xs,
		lineHeight: 18,
		color: Colors.textSecondary,
	},
	prefRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing[3],
		paddingVertical: Spacing[3],
		borderBottomWidth: 1,
		borderBottomColor: withOpacity(Colors.border, 0.7),
	},
	prefIcon: {
		width: 34,
		height: 34,
		borderRadius: Radius.full,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: withOpacity(Colors.brand, 0.12),
	},
	prefCopy: { flex: 1, gap: 2 },
	prefLabel: {
		fontFamily: FontFamily.semibold,
		fontSize: FontSize.sm,
		color: Colors.textPrimary,
	},
	prefHint: {
		fontFamily: FontFamily.regular,
		fontSize: FontSize.xs,
		lineHeight: 18,
		color: Colors.textSecondary,
	},
	footerHint: {
		marginTop: Spacing[3],
		fontFamily: FontFamily.regular,
		fontSize: FontSize.xs,
		lineHeight: 18,
		color: Colors.textMuted,
	},
	linkList: { gap: Spacing[2] },
	linkRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: Spacing[3],
		borderBottomWidth: 1,
		borderBottomColor: withOpacity(Colors.border, 0.7),
	},
	linkText: {
		fontFamily: FontFamily.semibold,
		fontSize: FontSize.sm,
		color: Colors.textPrimary,
	},
});
