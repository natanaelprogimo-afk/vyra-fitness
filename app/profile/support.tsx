// app/profile/support.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

const FAQS = [
  {
    q: '¿Cómo funciona el Daily Score?',
    a: 'El Daily Score es un puntaje de 0 a 100 que combina tu hidratación (20%), actividad (20%), sueño (25%), nutrición (15%) y estado mental (20%). Si tu estrés es muy alto (≥8), el máximo posible baja a 75.',
  },
  {
    q: '¿Funciona sin internet?',
    a: 'Sí. Todos los logs (agua, pasos, comida, entrenamientos) se guardan localmente aunque no tengas señal. Se sincronizan automáticamente cuando vuelve la conexión. El Coach IA requiere internet.',
  },
  {
    q: '¿Cómo cancelo Premium?',
    a: 'Desde el menú Perfil → Gestionar suscripción → Cancelar. También podés cancelar directamente desde tu cuenta de PayPal. Tu acceso Premium continúa hasta el fin del período pagado.',
  },
  {
    q: '¿Mis datos son privados?',
    a: 'Sí. Tus datos de salud están protegidos con seguridad a nivel de fila (RLS en Supabase). Nadie más puede ver tus datos. Los datos de ciclo menstrual tienen protección adicional.',
  },
  {
    q: '¿Cómo exporto mis datos?',
    a: 'Desde Perfil → Privacidad → Exportar mis datos. Recibirás un archivo JSON con todo tu historial.',
  },
];

export default function SupportScreen() {
  const [expanded, setExpanded] = React.useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Soporte</Text>

        {/* Contacto */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿Necesitás ayuda?</Text>
          <Text style={styles.contactDesc}>
            Si tenés un problema o sugerencia, mandanos un email y te respondemos en 24–48h.
          </Text>
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL('mailto:soporte@vyrafitness.app?subject=Soporte Vyra Fitness')}
          >
            <Text style={styles.emailBtnText}>✉️  Enviar email de soporte</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.faqTitle}>Preguntas frecuentes</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqItem}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqChevron}>{expanded === i ? '▲' : '▼'}</Text>
            </View>
            {expanded === i && (
              <Text style={styles.faqA}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Versión */}
        <Text style={styles.version}>Vyra Fitness v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll:      { padding: 20, paddingBottom: 40 },
  backBtn:     { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:       { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 24 },
  contactCard: {
    backgroundColor: Colors.bgSurface, borderRadius: 16, padding: 16,
    marginBottom: 28, borderWidth: 1, borderColor: Colors.border,
  },
  contactTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  contactDesc:  { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  emailBtn: {
    backgroundColor: Colors.brand, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  emailBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  faqTitle: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  faqItem: {
    backgroundColor: Colors.bgSurface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  faqHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  faqQ:        { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  faqChevron:  { color: Colors.textMuted, fontSize: 12 },
  faqA:        { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 10 },
  version:     { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 28 },
});