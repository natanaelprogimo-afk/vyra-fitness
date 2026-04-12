import React, { useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
} from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { RewardedAdButton } from '@/components/ui/RewardedAdButton';
import UnityAdBanner from '@/components/ui/UnityAdBanner';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useCoins } from '@/hooks/useCoins';
import { useAds } from '@/hooks/useAds';

const EARN_TIPS = [
	['Completar modulos del dia', '+5 a +15'],
	['Mantener la racha diaria', '+10'],
	['Desbloquear badges', '+25 a +400'],
	['Completar un entreno', '+25'],
	['Ver anuncio rewarded', '+15'],
];

export default function StoreScreen() {
	const { balance, addCoins } = useCoins();
	const { showInterstitial } = useAds();

	useEffect(() => {
		void showInterstitial();
	}, [showInterstitial]);

	return (
		<SafeScreen padHorizontal={false} padBottom>
			<Header title="Coins" showBack color={Colors.coins} />

			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				<Card style={styles.balanceCard}>
					<View style={styles.balanceRow}>
						<View>
							<Text style={styles.balanceLabel}>Tu balance</Text>
							<Text style={styles.balanceAmount}>{balance} coins</Text>
						</View>
						<RewardedAdButton
							context="store_discount"
							label="Ganar coins"
							coins={15}
							onReward={async (earned) => {
								await addCoins(earned, 'ad_reward', 'Anuncio rewarded desde coins');
							}}
						/>
					</View>

					<View style={styles.tipsBox}>
						<Text style={styles.cardTitle}>Como ganar mas</Text>
						{EARN_TIPS.map(([label, amount]) => (
							<View key={label} style={styles.tipRow}>
								<Text style={styles.tipLabel}>{label}</Text>
								<Text style={styles.tipAmount}>{amount} coins</Text>
							</View>
						))}
					</View>
				</Card>

				<UnityAdBanner style={styles.banner} />

				<Card style={styles.infoCard}>
					<Text style={styles.cardTitle}>Canjes desactivados por ahora</Text>
					<Text style={styles.infoText}>
						La tienda no ofrece compras internas todavia para evitar canjes sin efecto real.
						Tus coins siguen acumulandose normalmente y se conservaran para futuras recompensas.
					</Text>
				</Card>

				<Card>
					<Text style={styles.cardTitle}>Monetizacion que si esta activa</Text>
					<Text style={styles.infoText}>- Rewarded Ads para sumar coins.</Text>
					<Text style={styles.infoText}>- Banner e interstitial en usuarios Free.</Text>
					<Text style={styles.infoText}>- En Premium no se muestran anuncios.</Text>
				</Card>
			</ScrollView>
		</SafeScreen>
	);
}

const styles = StyleSheet.create({
	scroll: {
		paddingHorizontal: Spacing[5],
		paddingBottom: Spacing[10],
		paddingTop: Spacing[4],
		gap: Spacing[4],
	},
	balanceCard: {
		gap: Spacing[4],
	},
	balanceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: Spacing[3],
	},
	balanceLabel: {
		fontFamily: FontFamily.medium,
		fontSize: 14,
		color: Colors.textSecondary,
	},
	balanceAmount: {
		fontFamily: FontFamily.bold,
		fontSize: 30,
		color: Colors.coins,
		marginTop: 2,
	},
	tipsBox: {
		borderTopWidth: 1,
		borderTopColor: Colors.border,
		paddingTop: Spacing[4],
		gap: Spacing[2],
	},
	cardTitle: {
		fontFamily: FontFamily.bold,
		fontSize: 16,
		color: Colors.textPrimary,
		marginBottom: Spacing[2],
	},
	tipRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: Spacing[3],
		paddingVertical: Spacing[1],
	},
	tipLabel: {
		flex: 1,
		fontFamily: FontFamily.regular,
		fontSize: 14,
		color: Colors.textSecondary,
	},
	tipAmount: {
		fontFamily: FontFamily.bold,
		fontSize: 14,
		color: Colors.coins,
	},
	banner: {
		borderRadius: Radius.xl,
		overflow: 'hidden',
	},
	infoCard: {
		borderWidth: 1,
		borderColor: `${Colors.warning}40`,
		backgroundColor: `${Colors.warning}12`,
	},
	infoText: {
		fontFamily: FontFamily.regular,
		fontSize: 14,
		lineHeight: 21,
		color: Colors.textSecondary,
		marginBottom: Spacing[1],
	},
});
