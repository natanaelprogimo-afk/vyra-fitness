import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBarcodeScan } from '@/hooks/useBarcodeScan';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface BarcodeScannerModalProps {
  onBarcodeScanned: (barcode: string, type: string) => void | Promise<void>;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export default function BarcodeScannerModal({
  onBarcodeScanned,
  onClose,
  title = 'Escanear código',
  subtitle = 'Apunta a un código de barras o QR',
}: BarcodeScannerModalProps) {
  const router = useRouter();
  const [processError, setProcessError] = useState<string | null>(null);
  const {
    hasPermission,
    scanned,
    isScanning,
    torch,
    lastScanned,
    error,
    requestPermission,
    handleBarcodeScanned,
    resetScan,
    toggleTorch,
    clearError,
  } = useBarcodeScan();

  const handleClose = () => {
    onClose?.();
    if (!onClose) router.back();
  };

  if (!hasPermission) {
    return (
      <SafeScreen backgroundColor={Colors.bgPrimary} padHorizontal={false}>
        <Header title={title} subtitle="Permiso de cámara" showBack onBack={handleClose} color={Colors.brand} />
        <View style={styles.permissionWrap}>
          <Card style={styles.permissionCard}>
            <Ionicons name="camera" size={64} color={Colors.brand} />
            <Text style={styles.permissionTitle}>Permiso de cámara requerido</Text>
            <Text style={styles.permissionText}>
              Necesitamos acceso a tu cámara para escanear códigos de barras sin sacarte del flujo de nutrición.
            </Text>
            <Button onPress={() => void requestPermission()} label="Permitir acceso" fullWidth color={Colors.brand} />
            <Button onPress={handleClose} label="Cancelar" fullWidth variant="secondary" />
          </Card>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen backgroundColor={Colors.bgPrimary} padHorizontal={false} padBottom={false}>
      <Header
        title={title}
        subtitle={!scanned ? subtitle : 'Resultado listo'}
        showBack
        onBack={handleClose}
        color={Colors.brand}
        rightElement={
          <Button
            onPress={toggleTorch}
            label={torch ? 'Flash on' : 'Flash'}
            size="sm"
            variant="ghost"
            color={torch ? Colors.success : Colors.textSecondary}
            accessibilityLabel={torch ? 'Desactivar flash' : 'Activar flash'}
          />
        }
      />

      {!scanned ? (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'code128', 'code39'],
            }}
            onBarcodeScanned={(event) => {
              void handleBarcodeScanned(
                event,
                async (barcode, type) => {
                  try {
                    setProcessError(null);
                    await onBarcodeScanned(barcode, type);
                  } catch (err) {
                    setProcessError(
                      err instanceof Error ? err.message : 'No pudimos procesar este código todavía.',
                    );
                  }
                },
                (errorMsg) => {
                  setProcessError(errorMsg);
                },
              );
            }}
          />

          <View pointerEvents="none" style={styles.overlayFrame}>
            <View style={styles.scanFrame} />
            <Text style={styles.overlayHint}>Mantén el código dentro del marco unos segundos.</Text>
          </View>

          {(error || processError) && !scanned ? (
            <View style={styles.inlineNotice}>
              <NoticeCard
                title="No pudimos leerlo bien"
                body={processError ?? error ?? 'Intenta de nuevo con más luz o acercando el código.'}
                tone="error"
                actionLabel="Reintentar"
                onAction={() => {
                  setProcessError(null);
                  clearError();
                  resetScan();
                }}
              />
            </View>
          ) : null}

          {isScanning ? (
            <View style={styles.loadingOverlay}>
              <Card style={styles.loadingCard}>
                <Text style={styles.loadingText}>Procesando código...</Text>
              </Card>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.resultWrap}>
          <Card style={styles.resultCard}>
            <Ionicons
              name={processError ? 'alert-circle' : 'checkmark-circle'}
              size={64}
              color={processError ? Colors.warning : Colors.success}
              style={styles.resultIcon}
            />
            <Text style={styles.resultTitle}>{processError ? 'Código leído con problemas' : 'Código escaneado'}</Text>

            {lastScanned ? (
              <View style={styles.resultStack}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Tipo</Text>
                  <Text style={styles.resultValue}>{lastScanned.type.toUpperCase()}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Valor</Text>
                  <Text style={styles.resultMono}>{lastScanned.data}</Text>
                </View>
              </View>
            ) : null}

            {processError ? (
              <NoticeCard
                title="Hace falta un paso más"
                body={processError}
                tone="warning"
              />
            ) : null}

            <View style={styles.resultButtons}>
              <Button
                onPress={() => {
                  setProcessError(null);
                  clearError();
                  resetScan();
                }}
                label="Escanear de nuevo"
                color={Colors.brand}
                fullWidth
              />
              <Button onPress={handleClose} label="Cerrar" variant="secondary" fullWidth />
            </View>
          </Card>
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  permissionWrap: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    justifyContent: 'center',
  },
  permissionCard: {
    gap: Spacing[4],
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cameraWrap: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayFrame: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
  },
  scanFrame: {
    width: '82%',
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: Radius['3xl'],
    borderWidth: 2,
    borderColor: withAlpha(Colors.brand, 0.95),
    backgroundColor: withAlpha(Colors.bgBase, 0.12),
  },
  overlayHint: {
    marginTop: Spacing[4],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: withAlpha(Colors.bgBase, 0.78),
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  inlineNotice: {
    position: 'absolute',
    left: Spacing[5],
    right: Spacing[5],
    bottom: Spacing[5],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(Colors.bgBase, 0.55),
  },
  loadingCard: {
    minWidth: 220,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
  },
  resultWrap: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
  },
  resultCard: {
    gap: Spacing[4],
  },
  resultIcon: {
    alignSelf: 'center',
  },
  resultTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  resultStack: {
    gap: Spacing[2],
  },
  resultRow: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: 4,
  },
  resultLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  resultValue: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.medium,
    color: Colors.textPrimary,
  },
  resultMono: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.mono,
    color: Colors.textPrimary,
  },
  resultButtons: {
    gap: Spacing[2],
  },
});

function withAlpha(hex: string, alpha: number) {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${safeAlpha})`;
}
