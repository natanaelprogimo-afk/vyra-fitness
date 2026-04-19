import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

const FAQS = [
  {
    q: '¿Cómo funciona la lectura diaria?',
    a: 'La lectura diaria resume hidratación, movimiento, sueño, nutrición y cierre mental para darte contexto útil. Sirve para orientar el día, no como diagnóstico.',
  },
  {
    q: '¿Funciona sin internet?',
    a: 'Sí. Los registros principales se guardan en local aunque no tengas señal y se sincronizan cuando vuelve la conexión. Algunas lecturas IA y ciertas integraciones sí necesitan internet.',
  },
  {
    q: '¿Cómo cancelo Premium?',
    a: 'Desde Perfil → Gestionar suscripción → Cancelar. También puedes hacerlo desde tu cuenta de PayPal. El acceso Premium sigue hasta el final del período pagado.',
  },
  {
    q: '¿Mis datos son privados?',
    a: 'Sí. Tus datos de salud quedan ligados solo a tu cuenta y no se mezclan con los de otras personas. La información del ciclo tiene una capa extra de privacidad.',
  },
  {
    q: '¿Cómo exporto mis datos?',
    a: 'Desde Perfil → Privacidad → Exportar mis datos. Ahí puedes descargar tu historial en los formatos disponibles.',
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

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.contactDesc}>
            Si tienes un problema o una sugerencia, escríbenos y te respondemos en 24-48 horas.
          </Text>
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL('mailto:soporte@vyrafitness.app?subject=Soporte Vyra Fitness')}
          >
            <Text style={styles.emailBtnText}>Enviar email de soporte</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.faqTitle}>Preguntas frecuentes</Text>
        {FAQS.map((faq, index) => (
          <TouchableOpacity
            key={faq.q}
            style={styles.faqItem}
            onPress={() => setExpanded(expanded === index ? null : index)}
            activeOpacity={0.82}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqChevron}>{expanded === index ? '▲' : '▼'}</Text>
            </View>
            {expanded === index ? <Text style={styles.faqA}>{faq.a}</Text> : null}
          </TouchableOpacity>
        ))}

        <Text style={styles.version}>Vyra Fitness v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 24 },
  contactCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  contactDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  emailBtn: {
    backgroundColor: Colors.brand,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emailBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  faqTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  faqQ: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  faqChevron: { color: Colors.textMuted, fontSize: 12 },
  faqA: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 10 },
  version: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 28 },
});
