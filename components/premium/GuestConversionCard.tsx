/**
 * Guest Conversion Card Component
 * Issue #10: Prompt guest users to create account
 * 
 * Shows data at risk + benefits of creating account
 * Displays in Home screen and other key screens
 */

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';
import { calculateGuestDataSize, getGuestUserId } from '@/lib/auth/guest-account';

export interface GuestConversionCardProps {
  /**
   * Optional callback when user clicks Create Account
   */
  onUpgradePress?: () => void;

  /**
   * Optional callback when user dismisses
   */
  onDismiss?: () => void;

  /**
   * Show data count (number of items)
   * @default true
   */
  showDataCount?: boolean;

  /**
   * Custom accent color
   * @default Colors.brand (green)
   */
  accentColor?: string;
}

/**
 * Guest Conversion Card - Prompts guest to create account
 */
export default function GuestConversionCard({
  onUpgradePress,
  onDismiss,
  showDataCount = true,
  accentColor = Colors.brand,
}: GuestConversionCardProps) {
  const [dataCount, setDataCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!showDataCount) return;

    const loadDataCount = async () => {
      try {
        setLoading(true);
        const guestUserId = await getGuestUserId();
        
        if (guestUserId) {
          const count = await calculateGuestDataSize(guestUserId);
          setDataCount(count);
        }
      } catch (error) {
        console.error('Error loading guest data count:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDataCount();
  }, [showDataCount]);

  if (dismissed) return null;

  const handleUpgrade = () => {
    onUpgradePress?.();
    router.push('/guest/upgrade');
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card accentColor={accentColor} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={accentColor}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Salva tu progreso</Text>
          <Text style={styles.subtitle}>Crea una cuenta en segundos</Text>
        </View>
        <Pressable onPress={handleDismiss} hitSlop={8}>
          <Ionicons
            name="close"
            size={24}
            color={Colors.gray400}
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.bodyText}>
          Tus datos actuales se perderán si desinstales la app. Crea una cuenta para sincronizarlos
          y acceder desde cualquier dispositivo.
        </Text>

        {/* Data Summary */}
        {showDataCount && (
          <View style={styles.dataSummary}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={accentColor} />
                <Text style={styles.dataText}>Contando datos...</Text>
              </View>
            ) : dataCount !== null && dataCount > 0 ? (
              <View style={styles.dataRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Text style={styles.dataText}>
                  {dataCount} {dataCount === 1 ? 'registro' : 'registros'} guardados
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefits}>
          <BenefitItem icon="cloud-upload" text="Sincronización en la nube" />
          <BenefitItem icon="phone-portrait-outline" text="Acceso desde cualquier dispositivo" />
          <BenefitItem icon="shield-checkmark" text="Tus datos protegidos" />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleDismiss}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Continuar como invitado
          </Text>
        </Pressable>

        <Button
          variant="primary"
          onPress={handleUpgrade}
          style={styles.button}
        >
          Crear cuenta
        </Button>
      </View>
    </Card>
  );
}

/**
 * Benefit Item - Single benefit in the list
 */
interface BenefitItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
}

function BenefitItem({ icon, text }: BenefitItemProps) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons
        name={icon}
        size={18}
        color={Colors.brand}
        style={styles.benefitIcon}
      />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.brand}15`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.text,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.gray500,
  },

  // Body
  body: {
    marginBottom: Spacing.md,
  },

  bodyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  dataSummary: {
    marginBottom: Spacing.md,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  dataText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.text,
  },

  benefits: {
    gap: Spacing.sm,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  benefitIcon: {
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },

  benefitText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.text,
    flex: 1,
  },

  // Actions
  actions: {
    gap: Spacing.sm,
  },

  button: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },

  secondaryButton: {
    backgroundColor: `${Colors.gray600}15`,
    borderWidth: 1,
    borderColor: Colors.gray600,
  },

  buttonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
  },

  secondaryButtonText: {
    color: Colors.text,
  },
});
