import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

const SECTIONS = [
  {
    title: '1. Aceptacion',
    text: 'Al usar Vyra Fitness aceptas estos terminos. Si no estas de acuerdo, no uses la aplicacion. Debes tener al menos 16 anos para usar Vyra.',
  },
  {
    title: '2. Que es Vyra',
    text: 'Vyra es una aplicacion de bienestar y seguimiento de habitos. No es un dispositivo medico y no reemplaza la consulta con profesionales de la salud.',
  },
  {
    title: '3. Cuenta de usuario',
    text: 'Sos responsable de mantener segura tu cuenta y de la actividad realizada con ella. Notificanos si sospechas acceso no autorizado.',
  },
  {
    title: '4. Premium y pagos',
    text: 'Las suscripciones Premium se procesan con PayPal en dolares estadounidenses. No hay prueba gratis: el cobro se procesa cuando confirmas la suscripcion. La renovacion continua hasta que la canceles.',
  },
  {
    title: '5. Beneficios Premium actuales',
    text: 'La version actual de Premium desbloquea coach sin limite diario, correlaciones premium, barcode ilimitado y experiencia sin anuncios.',
  },
  {
    title: '6. Coins',
    text: 'Las coins son una moneda virtual interna sin valor monetario real. No equivalen a dinero, no son reembolsables y no garantizan canjes futuros.',
  },
  {
    title: '7. Uso prohibido',
    text: 'No podes usar Vyra para fines ilegales, para intentar acceder a datos de terceros, para revender cuentas o para hacer ingenieria inversa de la aplicacion.',
  },
  {
    title: '8. Modificaciones',
    text: 'Podemos actualizar estos terminos y avisarte dentro de la app. El uso continuado implica aceptacion de los cambios.',
  },
  {
    title: '9. Contacto',
    text: 'Para consultas legales: legal@vyrafitness.app',
  },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>{'<- Volver'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terminos de Servicio</Text>
        <Text style={styles.updated}>Ultima actualizacion: Marzo 2026</Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionText}>{section.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  updated: { color: Colors.textMuted, fontSize: 12, marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  sectionText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
});
