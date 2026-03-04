import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useBarcodeScan } from '@/hooks/useBarcodeScan';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

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
  subtitle = 'Apuntá a un código de barras o QR',
}: BarcodeScannerModalProps) {
  const router = useRouter();
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

  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.bgPrimary }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={64} color={Colors.brand} />
          <Text style={styles.permissionTitle}>Permiso de cámara requerido</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para escanear códigos de barras.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => onClose?.() || router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => onClose?.() || router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{title}</Text>
          {!scanned && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        <TouchableOpacity 
          onPress={toggleTorch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={torch ? 'flashlight' : 'flashlight-outline'} 
            size={28} 
            color={torch ? Colors.success : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      {!scanned ? (
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'code128', 'code39'],
          }}
          onBarcodeScanned={(event) => {
            handleBarcodeScanned(
              event,
              async (barcode, type) => {
                try {
                  await onBarcodeScanned(barcode, type);
                } catch (err) {
                  Alert.alert(
                    'Error',
                    err instanceof Error ? err.message : 'Error al procesar el código',
                    [{ text: 'Reintentar', onPress: resetScan }]
                  );
                }
              },
              (errorMsg) => {
                Alert.alert('Error', errorMsg, [
                  { text: 'Reintentar', onPress: resetScan }
                ]);
              }
            );
          }}
        />
      ) : (
        /* Scanned Result Screen */
        <View style={styles.resultContainer}>
          <View style={styles.resultContent}>
            <Ionicons 
              name="checkmark-circle" 
              size={64} 
              color={Colors.success} 
              style={styles.checkmark}
            />
            <Text style={styles.resultTitle}>¡Código escaneado!</Text>
            
            {lastScanned && (
              <>
                <View style={styles.barcodeInfo}>
                  <Text style={styles.barcodeLabel}>Tipo:</Text>
                  <Text style={styles.barcodeValue}>{lastScanned.type.toUpperCase()}</Text>
                </View>
                <View style={styles.barcodeInfo}>
                  <Text style={styles.barcodeLabel}>Valor:</Text>
                  <Text style={styles.barcodeValue}>{lastScanned.data}</Text>
                </View>
              </>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.resultButtons}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={resetScan}
              disabled={isScanning}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Escanear de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => onClose?.() || router.back()}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error banner global */}
      {error && !scanned && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={Colors.error} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator */}
      {isScanning && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingText}>Procesando...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgSurface,
  },
  headerText: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.brand,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'space-between',
    padding: 24,
  },
  resultContent: {
    alignItems: 'center',
  },
  checkmark: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  barcodeInfo: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.bgSurface,
    borderRadius: 8,
  },
  barcodeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
    flex: 1,
  },
  resultButtons: {
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: Colors.brand,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  closeButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderTopWidth: 1,
    borderTopColor: Colors.error,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.error,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  loadingText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
