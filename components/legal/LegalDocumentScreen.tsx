// REDESIGNED: 2026-05-23 — legal documents made calmer and more readable
import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Header from '@/components/layout/Header';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getLegalDocument, getLegalMeta, type LegalDocumentKind } from '@/lib/legal-content';

export default function LegalDocumentScreen({ kind }: { kind: LegalDocumentKind }) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [tocOpen, setTocOpen] = useState(true);
  const [sectionOffsets, setSectionOffsets] = useState<Record<string, number>>({});
  const document = useMemo(() => getLegalDocument(kind), [kind]);
  const meta = useMemo(() => getLegalMeta(), []);

  function registerOffset(id: string, event: LayoutChangeEvent | null | undefined) {
    const y = event?.nativeEvent?.layout?.y;
    if (typeof y !== 'number') return;
    setSectionOffsets((prev) => ({ ...prev, [id]: y }));
  }

  function jumpToSection(id: string) {
    const y = sectionOffsets[id];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  }

  const footerContact = kind === 'privacy' ? meta.privacyEmail : meta.legalEmail;

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title={document.headerTitle} showBack color={Colors.brand} />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand} style={styles.heroCard}>
          <Text style={styles.eyebrow}>{document.eyebrow}</Text>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.body}>{document.summary}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Actualizado {meta.updatedAt}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{document.sections.length} secciones</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tocCard}>
          <Pressable
            style={styles.tocHeader}
            onPress={() => setTocOpen((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel="Tabla de contenidos"
            accessibilityHint="Expande o contrae la lista de secciones del documento."
            accessibilityState={{ expanded: tocOpen }}
          >
            <Text style={styles.sectionTitle}>Tabla de contenidos</Text>
            <Text style={styles.tocArrow}>{tocOpen ? '-' : '+'}</Text>
          </Pressable>

          {tocOpen ? (
            <View style={styles.tocList}>
              {document.sections.map((section, index) => (
                <Pressable
                  key={section.id}
                  style={styles.tocItem}
                  onPress={() => jumpToSection(section.id)}
                  accessibilityRole="button"
                  accessibilityLabel={section.title}
                  accessibilityHint="Salta directamente a esta seccion del documento."
                >
                  <Text style={styles.tocItemIndex}>{String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.tocItemText}>{section.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Card>

        {document.sections.map((section, index) => (
          <View key={section.id} collapsable={false} onLayout={(event) => registerOffset(section.id, event)}>
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionParagraphs}>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <Text key={`${section.id}-${paragraphIndex}`} style={styles.sectionText}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            </Card>
          </View>
        ))}

        <Card style={styles.footerCard}>
          <Text style={styles.sectionTitle}>Version y contacto</Text>
          <Text style={styles.sectionText}>Ultima actualizacion: {meta.updatedAt}</Text>
          <Text style={styles.sectionText}>Contacto: {footerContact}</Text>
        </Card>
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
    gap: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metaPill: {
    minHeight: 30,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  metaPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  tocCard: {
    gap: Spacing[3],
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
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  tocItemIndex: {
    width: 22,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  tocItemText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  sectionCard: {
    gap: Spacing[3],
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  sectionNumber: {
    width: 24,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sectionParagraphs: {
    gap: Spacing[2],
  },
  sectionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  footerCard: {
    gap: Spacing[2],
  },
});
