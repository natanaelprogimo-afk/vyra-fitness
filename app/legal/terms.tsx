import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Aceptacion',
    text: 'Al usar VYRA aceptas estos terminos. Si no estas de acuerdo, no uses la aplicacion. Debes tener al menos 16 anos para usarla.',
  },
  {
    id: 'service',
    title: '2. Que es VYRA',
    text: 'VYRA es una app de bienestar y seguimiento de habitos. No es un dispositivo medico y no reemplaza la consulta con profesionales de la salud.',
  },
  {
    id: 'account',
    title: '3. Cuenta',
    text: 'Eres responsable de mantener segura tu cuenta y de la actividad realizada con ella. Avisanos si sospechas acceso no autorizado.',
  },
  {
    id: 'premium',
    title: '4. Premium y pagos',
    text: 'Las suscripciones Premium se procesan con PayPal en dolares estadounidenses. La renovacion continua hasta que la canceles.',
  },
  {
    id: 'prohibited',
    title: '5. Uso prohibido',
    text: 'No puedes usar VYRA para fines ilegales, para acceder a datos de terceros o para hacer ingenieria inversa de la aplicacion.',
  },
  {
    id: 'changes',
    title: '6. Cambios',
    text: 'Podemos actualizar estos terminos y avisarte dentro de la app. El uso continuado implica aceptacion de los cambios.',
  },
  {
    id: 'contact',
    title: '7. Contacto',
    text: 'Para consultas legales: legal@vyrafitness.app',
  },
] as const;

export default function TermsScreen() {
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
      <Header title="Terminos" showBack color={Colors.brand} />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Lectura legal</Text>
          <Text style={styles.title}>Claro y escaneable.</Text>
          <Text style={styles.body}>
            El texto legal sigue siendo serio, pero no tiene por que sentirse hostil de leer.
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
