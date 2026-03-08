import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

const SECTIONS = [
  {
    title: '1. Que datos recopilamos',
    text: 'Recopilamos datos de perfil, logs de salud y habitos, eventos tecnicos anonimos y datos opcionales sensibles como salud femenina cuando el modulo esta habilitado por vos.',
  },
  {
    title: '2. Como usamos tus datos',
    text: 'Usamos tus datos para mostrar metricas, calcular score, sincronizar tu cuenta, personalizar el Coach IA y procesar pagos de suscripcion cuando compras Premium.',
  },
  {
    title: '3. Datos de salud y GDPR',
    text: 'Los datos de salud son categoria especial bajo GDPR. Solo los procesamos para brindar el servicio y no los vendemos ni los compartimos con terceros para publicidad personalizada.',
  },
  {
    title: '4. Con quien compartimos datos',
    text: 'Trabajamos con Supabase para base de datos, Render para backend, Groq para el Coach IA, PayPal para suscripciones, Unity Ads para anuncios en usuarios Free, PostHog para analitica de producto y Sentry para errores.',
  },
  {
    title: '5. Seguridad',
    text: 'Usamos HTTPS, sesiones protegidas, almacenamiento seguro del dispositivo y RLS en base de datos. Los datos sensibles opcionales tienen protecciones adicionales en la app y en Supabase.',
  },
  {
    title: '6. Tus derechos',
    text: 'Podes acceder, exportar y solicitar eliminacion de tus datos desde la app. Las solicitudes de borrado se procesan dentro de un maximo de 30 dias.',
  },
  {
    title: '7. Retencion',
    text: 'Tus datos se conservan mientras la cuenta siga activa. Los registros de pago y auditoria se mantienen el tiempo exigido por obligaciones legales.',
  },
  {
    title: '8. Contacto',
    text: 'Para temas de privacidad: privacy@vyrafitness.app',
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>{'<- Volver'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Politica de Privacidad</Text>
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
