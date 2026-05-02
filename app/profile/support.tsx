import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LinkRow from '@/components/ui/LinkRow';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const FAQS = [
  {
    q: 'Como funciona la lectura diaria?',
    a: 'La lectura diaria resume hidratacion, movimiento, sueno, nutricion y cierre mental para darte contexto util. Sirve para orientar el dia, no como diagnostico.',
  },
  {
    q: 'Funciona sin internet?',
    a: 'Si, pero de forma parcial. Agua, sueno, peso, nutricion y el historial local de entreno aguantan mejor sin conexion; otras lecturas, notificaciones e integraciones siguen necesitando backend.',
  },
  {
    q: 'Como funciona el acceso hoy?',
    a: 'Hoy todas las funciones siguen incluidas. La monetizacion actual se apoya en anuncios discretos y opcionales fuera de los flujos sensibles.',
  },
  {
    q: 'Mis datos son privados?',
    a: 'Si. Tus datos de salud quedan ligados solo a tu cuenta y no se mezclan con los de otras personas. La informacion del ciclo tiene una capa extra de privacidad.',
  },
  {
    q: 'Como exporto mis datos?',
    a: 'Desde Perfil -> Exportar datos, o desde Ajustes -> Privacidad -> Exportar mis datos. Ahi puedes descargar tu historial en los formatos disponibles.',
  },
] as const;

export default function SupportScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const appVersion = Application.nativeApplicationVersion ?? '1.0.1';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Soporte" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Soporte con contexto"
          body="Ademas del email, tienes acceso rapido al centro del sistema para revisar backend, sync, widgets y notificaciones antes de escalar un problema."
          tone="info"
        />

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Contacto"
            title="Necesitas ayuda?"
            subtitle="Si tienes un problema o una sugerencia, te respondemos por correo con el contexto suficiente."
          />

          <Button
            onPress={() =>
              void Linking.openURL('mailto:soporte@vyrafitness.app?subject=Soporte Vyra Fitness')
            }
            label="Enviar email de soporte"
            fullWidth
            color={Colors.brand}
          />

          <LinkRow
            label="Centro del sistema"
            description="Backend, sync, widgets, notificaciones adaptativas y resumen IA semanal."
            onPress={() => router.push(Routes.settings.systemHealth as never)}
            hint="QA"
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="FAQ"
            title="Preguntas frecuentes"
            subtitle="Acordeon accesible y reutilizable para ayuda, ajustes y soporte."
          />

          <View style={styles.faqStack}>
            {FAQS.map((faq, index) => {
              const isOpen = expanded === index;
              return (
                <Pressable
                  key={faq.q}
                  style={styles.faqItem}
                  onPress={() => setExpanded(isOpen ? null : index)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  accessibilityLabel={faq.q}
                  accessibilityHint={isOpen ? 'Contrae la respuesta.' : 'Expande la respuesta.'}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQ}>{faq.q}</Text>
                    <View style={[styles.chevronWrap, isOpen && styles.chevronWrapOpen]}>
                      <Text style={styles.faqChevron}>{isOpen ? '-' : '+'}</Text>
                    </View>
                  </View>
                  {isOpen ? <Text style={styles.faqA}>{faq.a}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <View style={styles.versionChip}>
          <Text style={styles.versionText}>Vyra Fitness v{appVersion}</Text>
        </View>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
  faqStack: {
    gap: Spacing[2],
  },
  faqItem: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  faqQ: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    lineHeight: 20,
  },
  chevronWrap: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  chevronWrapOpen: {
    backgroundColor: withOpacity(Colors.brand, 0.16),
  },
  faqChevron: {
    color: Colors.brand,
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    lineHeight: 18,
  },
  faqA: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    lineHeight: 19,
  },
  versionChip: {
    alignSelf: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  versionText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
  },
});
