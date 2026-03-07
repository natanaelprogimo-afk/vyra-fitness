// app/legal/terms.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Términos de Servicio</Text>
        <Text style={styles.updated}>Última actualización: Febrero 2026</Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionText}>{section.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const SECTIONS = [
  {
    title: '1. Aceptación',
    text:  'Al usar Vyra Fitness, aceptás estos términos. Si no estás de acuerdo, no uses la aplicación. Debés tener al menos 13 años para usar Vyra.',
  },
  {
    title: '2. Qué es Vyra',
    text:  'Vyra Fitness es una aplicación de seguimiento de hábitos de salud y bienestar. NO es un dispositivo médico, NO diagnostica enfermedades, NO prescribe tratamientos y NO reemplaza la consulta con profesionales de la salud.',
  },
  {
    title: '3. Cuenta de usuario',
    text:  'Sos responsable de mantener la seguridad de tu cuenta. Notificanos inmediatamente si sospechás acceso no autorizado. Podés tener una sola cuenta por persona.',
  },
  {
    title: '4. Datos de salud',
    text:  'Los datos de salud que ingresás son tuyos. Los usamos solo para brindarte el servicio (calcular scores, personalizar el coach). No los vendemos a terceros ni los usamos con fines publicitarios.',
  },
  {
    title: '5. Suscripciones y pagos',
    text:  'Las suscripciones Premium se facturan mediante PayPal. Los precios están en dólares estadounidenses. El período de prueba de 14 días es por única vez por cuenta. Las suscripciones se renuevan automáticamente hasta que las canceles.',
  },
  {
    title: '6. Reembolsos',
    text:  'No ofrecemos reembolsos por períodos de suscripción ya transcurridos. Si experimentás problemas técnicos graves, contactá a soporte@vyrafitness.app.',
  },
  {
    title: '7. Contenido prohibido',
    text:  'No podés usar Vyra para fines ilegales, para hacer daño a terceros, para hacer ingeniería inversa de la aplicación, ni para intentar acceder a datos de otros usuarios.',
  },
  {
    title: '8. Modificaciones',
    text:  'Podemos actualizar estos términos. Te notificaremos dentro de la app con al menos 7 días de anticipación. El uso continuado de Vyra implica la aceptación de los nuevos términos.',
  },
  {
    title: '9. Contacto',
    text:  'Para consultas sobre estos términos: legal@vyrafitness.app',
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll:    { padding: 20, paddingBottom: 40 },
  backBtn:   { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:     { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  updated:   { color: Colors.textMuted, fontSize: 12, marginBottom: 24 },
  section:   { marginBottom: 20 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  sectionText:  { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
});
