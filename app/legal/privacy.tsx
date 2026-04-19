import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const SECTIONS = [
  {
    id: 'data',
    title: '1. Que datos recopilamos',
    text: 'Recopilamos datos de perfil, logs de salud y habitos, eventos tecnicos anonimos y datos opcionales sensibles cuando habilitas esos modulos.',
  },
  {
    id: 'usage',
    title: '2. Como usamos tus datos',
    text: 'Usamos tus datos para mostrar metricas, calcular score, sincronizar tu cuenta, personalizar lecturas contextuales y procesar pagos de Premium.',
  },
  {
    id: 'health',
    title: '3. Datos de salud y GDPR',
    text: 'Los datos de salud son categoria especial bajo GDPR. Solo los procesamos para brindar el servicio y no los vendemos para publicidad personalizada.',
  },
  {
    id: 'vendors',
    title: '4. Con quien compartimos datos',
    text: 'Trabajamos con Supabase, Render, OpenAI, Groq, Anthropic, PayPal, PostHog y Sentry dentro de las funciones necesarias para operar la app.',
  },
  {
    id: 'security',
    title: '5. Seguridad',
    text: 'Usamos HTTPS, sesiones protegidas, almacenamiento seguro y controles por cuenta para que cada persona solo vea sus propios datos. Algunas capas sensibles tienen protecciones adicionales.',
  },
  {
    id: 'rights',
    title: '6. Tus derechos',
    text: 'Puedes acceder, exportar y solicitar la eliminacion de tus datos desde la app. Las solicitudes de borrado se procesan en un maximo de 30 dias.',
  },
  {
    id: 'retention',
    title: '7. Retencion',
    text: 'Tus datos se conservan mientras la cuenta siga activa. Los registros de pago y auditoria se mantienen el tiempo exigido por obligaciones legales.',
  },
  {
    id: 'contact',
    title: '8. Contacto',
    text: 'Para temas de privacidad: privacy@vyrafitness.app',
  },
] as const;

export default function PrivacyScreen() {
  const scrollRef = useRef<ScrollView | null>(null);
  const [tocOpen, setTocOpen] = useState(true);
  const [sectionOffsets, setSectionOffsets] = useState<Record<string, number>>({});

  function registerOffset(id: string, event: LayoutChangeEvent) {
    setSectionOffsets((prev) => ({ ...prev, [id]: event.nativeEvent.layout.y }));
  }

  function jumpToSection(id: string) {
    const y = sectionOffsets[id];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Privacidad legal" showBack color={Colors.brand} />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Transparencia accesible</Text>
          <Text style={styles.title}>Tus datos no deberian sentirse escondidos.</Text>
          <Text style={styles.body}>
            Esta version esta pensada para leerse mejor: mas aire, mejor jerarquia y una entrada
            directa a cada bloque importante.
          </Text>
        </Card>

        <Card>
          <Pressable style={styles.tocHeader} onPress={() => setTocOpen((value) => !value)}>
            <Text style={styles.sectionTitle}>Tabla de contenidos</Text>
            <Text style={styles.tocArrow}>{tocOpen ? '−' : '+'}</Text>
          </Pressable>
          {tocOpen ? (
            <View style={styles.tocList}>
              {SECTIONS.map((section) => (
                <Pressable key={section.id} style={styles.tocItem} onPress={() => jumpToSection(section.id)}>
                  <Text style={styles.tocItemText}>{section.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Card>

        {SECTIONS.map((section) => (
          <View key={section.id} onLayout={(event) => registerOffset(section.id, event)}>
            <Card>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionText}>{section.text}</Text>
            </Card>
          </View>
        ))}
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
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
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
  tocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  tocArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textMuted,
  },
  tocList: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  tocItem: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  tocItemText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  sectionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 25,
    color: Colors.textSecondary,
  },
});
