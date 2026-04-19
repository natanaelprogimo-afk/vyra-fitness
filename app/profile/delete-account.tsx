import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const CONFIRM_PHRASE = 'ELIMINAR MI CUENTA';

const DATA_ROWS = [
  'Historial de agua, pasos, sueno, nutricion, peso y ayuno.',
  'Entrenamientos, sesiones, PRs y progreso acumulado.',
  'Rachas, historial de actividad y estados sincronizados.',
  'Lecturas IA guardadas y datos opcionales sensibles.',
] as const;

export default function DeleteAccountScreen() {
  const { profile, logout } = useAuthStore();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const phraseOk = confirmation.trim().toUpperCase() === CONFIRM_PHRASE;

  async function submitDeletionRequest() {
    if (!profile?.id) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase.from('deletion_requests').insert({
        user_id: profile.id,
        confirmation_token: Math.random().toString(36).slice(2),
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Solicitud registrada',
        'Tu pedido ya quedo guardado. La eliminacion se procesa en un maximo de 30 dias y recibirás confirmacion por email.',
        [{ text: 'OK', onPress: () => void logout() }],
      );
    } catch {
      Alert.alert('No se pudo procesar', 'Intenta de nuevo o contacta soporte si el problema sigue.');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDelete() {
    if (!phraseOk) {
      Alert.alert('Confirmacion incompleta', `Escribe exactamente: ${CONFIRM_PHRASE}`);
      return;
    }

    Alert.alert(
      'Eliminar cuenta',
      'Esta decision es irreversible. Tus datos y recompensas desapareceran cuando cierre el proceso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void submitDeletionRequest() },
      ],
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Eliminar cuenta" showBack color={Colors.error} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <Text style={styles.eyebrow}>Decision seria</Text>
          <Text style={styles.title}>Si te vas, queremos que lo hagas con toda la claridad.</Text>
          <Text style={styles.body}>
            Aqui no te vamos a presionar. Solo te mostramos lo que pasa y te dejamos una salida
            limpia antes del punto final.
          </Text>
        </Card>

        <Card style={styles.dataCard}>
          <Text style={styles.sectionTitle}>Esto se elimina</Text>
          <View style={styles.list}>
            {DATA_ROWS.map((item) => (
              <View key={item} style={styles.listRow}>
                <View style={styles.listDot} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Antes de confirmar</Text>
          <Text style={styles.sectionHint}>
            Si el problema era otro, puede que no necesites llegar hasta el final.
          </Text>
          <View style={styles.altActions}>
            <Button
              variant="secondary"
              color={Colors.brand}
              onPress={() => router.push('/profile/export-data' as never)}
            >
              Exportar mis datos primero
            </Button>
            <Button
              variant="secondary"
              color={Colors.premium}
              onPress={() => router.push('/premium/manage' as never)}
            >
              Solo quiero revisar Premium
            </Button>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Confirmacion final</Text>
          <Text style={styles.sectionHint}>
            Escribe la frase exacta. Asi evitamos taps impulsivos.
          </Text>
          <Input
            label="Frase exacta"
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder={CONFIRM_PHRASE}
            autoCapitalize="characters"
            autoCorrect={false}
            hint="La frase del placeholder es exactamente la que debes escribir."
          />
          <View
            style={[
              styles.phrasePill,
              phraseOk
                ? { borderColor: withOpacity(Colors.success, 0.35), backgroundColor: withOpacity(Colors.success, 0.12) }
                : null,
            ]}
          >
            <Text style={[styles.phraseText, phraseOk ? { color: Colors.success } : null]}>
              {CONFIRM_PHRASE}
            </Text>
          </View>
        </Card>

        <Button
          onPress={handleDelete}
          loading={isDeleting}
          disabled={!phraseOk || isDeleting}
          variant="danger"
          fullWidth
        >
          Eliminar mi cuenta
        </Button>

        <Text style={styles.footnote}>
          La solicitud se procesa bajo derecho de borrado. La baja de Premium y la exportacion de
          datos siguen disponibles por separado.
        </Text>
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
  heroCard: {
    borderColor: withOpacity(Colors.error, 0.18),
    backgroundColor: withOpacity(Colors.error, 0.06),
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.error,
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
  dataCard: {
    borderColor: withOpacity(Colors.error, 0.14),
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
  list: {
    gap: Spacing[2],
  },
  listRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  listDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    marginTop: 7,
    backgroundColor: withOpacity(Colors.error, 0.55),
  },
  listText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  altActions: {
    gap: Spacing[2],
  },
  phrasePill: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  phraseText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  footnote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
