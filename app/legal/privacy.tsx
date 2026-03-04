// app/legal/privacy.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Política de Privacidad</Text>
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
    title: '1. Qué datos recopilamos',
    text:  'Recopilamos: datos de perfil (nombre, edad, altura, peso), datos de salud que vos ingresás voluntariamente (agua, pasos, sueño, comidas, entrenamientos, estado mental), datos opcionales de ciclo menstrual, y datos técnicos de uso (logs de errores anónimos con Sentry).',
  },
  {
    title: '2. Cómo usamos tus datos',
    text:  'Usamos tus datos exclusivamente para: calcular tu Daily Score y métricas personalizadas, personalizar las respuestas del Coach IA, enviarte notificaciones de recordatorio que vos configurás, y mejorar la aplicación de forma anónima y agregada.',
  },
  {
    title: '3. Datos de salud — Categoría especial GDPR',
    text:  'Los datos de salud son categoría especial bajo GDPR Art. 9. Solo los procesamos con tu consentimiento explícito, únicamente para brindarte el servicio, y nunca los compartimos con terceros para publicidad o análisis externos.',
  },
  {
    title: '4. Datos de ciclo menstrual',
    text:  'Los datos de salud femenina (si activás el módulo) están protegidos con seguridad adicional. Solo vos podés acceder a ellos. No los usamos en ningún procesamiento agregado ni analítico.',
  },
  {
    title: '5. Compartimos datos con',
    text:  'Supabase (almacenamiento seguro de datos, ubicado en EU/US), Groq (solo el mensaje que enviás al coach, sin datos de salud en el cuerpo del mensaje salvo los que Vyra incluye como contexto), PayPal (solo datos de transacción), Unity Ads (datos anónimos de uso para anuncios, con consentimiento GDPR), Sentry (logs de errores anónimos).',
  },
  {
    title: '6. Tus derechos (GDPR)',
    text:  'Tenés derecho a: acceder a todos tus datos, corregirlos, descargarlos (Perfil → Exportar mis datos), y eliminarlos permanentemente (Perfil → Eliminar cuenta). Respondemos todas las solicitudes en máximo 30 días.',
  },
  {
    title: '7. Retención de datos',
    text:  'Tus datos se conservan mientras tengas una cuenta activa. Al eliminar tu cuenta, tus datos son eliminados permanentemente en 30 días. Los logs de transacciones de pago se conservan 7 años por requisitos legales.',
  },
  {
    title: '8. Seguridad',
    text:  'Tus datos están cifrados en tránsito (HTTPS) y en reposo. Los tokens de sesión se guardan en el almacenamiento seguro del dispositivo (Android Keystore). Las fotos de progreso usan URLs firmadas con expiración.',
  },
  {
    title: '9. Contacto DPO',
    text:  'Para consultas de privacidad: privacy@vyrafitness.app',
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