import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type MediaTab = 'video' | 'guide';

interface ExerciseMediaSheetProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  videoUrl?: string | null;
  gifUrl?: string | null;
  cues?: string[] | null;
  mistakes?: string[] | null;
  variations?: string[] | null;
  instructions?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeVideoUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeWatch = trimmed.match(/[?&]v=([\w-]{6,})/i);
  if (youtubeWatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeWatch[1]}?playsinline=1&rel=0`;
  }

  const youtubeShort = trimmed.match(/youtu\.be\/([\w-]{6,})/i);
  if (youtubeShort?.[1]) {
    return `https://www.youtube.com/embed/${youtubeShort[1]}?playsinline=1&rel=0`;
  }

  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  return trimmed;
}

function buildVideoHtml(url: string) {
  const normalized = normalizeVideoUrl(url) ?? url;
  const lower = normalized.toLowerCase();
  const isDirectVideo =
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.includes('.mp4?') ||
    lower.includes('.webm?') ||
    lower.includes('.mov?');

  if (isDirectVideo) {
    return `<!doctype html>
      <html>
        <body style="margin:0;background:#05060a;display:flex;align-items:center;justify-content:center;">
          <video controls playsinline style="width:100%;height:100%;max-height:100vh;background:#05060a;" src="${escapeHtml(normalized)}"></video>
        </body>
      </html>`;
  }

  return `<!doctype html>
    <html>
      <body style="margin:0;background:#05060a;">
        <iframe
          src="${escapeHtml(normalized)}"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          style="border:0;width:100vw;height:100vh;background:#05060a;"
        ></iframe>
      </body>
    </html>`;
}

function buildGuideHtml(url: string) {
  return `<!doctype html>
    <html>
      <body style="margin:0;background:#05060a;display:flex;align-items:center;justify-content:center;">
        <img
          src="${escapeHtml(url)}"
          alt="Guia visual del ejercicio"
          style="max-width:100vw;max-height:100vh;object-fit:contain;"
        />
      </body>
    </html>`;
}

export default function ExerciseMediaSheet({
  visible,
  onClose,
  exerciseName,
  videoUrl,
  gifUrl,
  cues,
  mistakes,
  variations,
  instructions,
}: ExerciseMediaSheetProps) {
  const hasStructuredGuide = Boolean(
    instructions?.trim() ||
    cues?.length ||
    mistakes?.length ||
    variations?.length,
  );
  const [activeTab, setActiveTab] = useState<MediaTab>(videoUrl ? 'video' : 'guide');

  useEffect(() => {
    if (visible) {
      setActiveTab(videoUrl ? 'video' : 'guide');
    }
  }, [gifUrl, videoUrl, visible]);

  const currentTitle =
    activeTab === 'video'
      ? 'Video del ejercicio'
      : gifUrl
        ? 'Guia visual'
        : 'Guia tecnica';
  const currentHtml = useMemo(() => {
    if (activeTab === 'video' && videoUrl) return buildVideoHtml(videoUrl);
    if (activeTab === 'guide' && gifUrl) return buildGuideHtml(gifUrl);
    return null;
  }, [activeTab, gifUrl, videoUrl]);

  const handleOpenExternal = async () => {
    const targetUrl = activeTab === 'video' ? videoUrl : gifUrl;
    if (!targetUrl) return;
    try {
      await Linking.openURL(targetUrl);
    } catch {
      return;
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Referencia de ${exerciseName}`}
      snapHeight={720}
      showClose
    >
      <View style={styles.content}>
        <View style={styles.tabRow}>
          {videoUrl ? (
            <Button
              onPress={() => setActiveTab('video')}
              variant={activeTab === 'video' ? 'primary' : 'secondary'}
              color={Colors.workout}
              style={styles.tabButton}
            >
              Ver video
            </Button>
          ) : null}
          {gifUrl || hasStructuredGuide ? (
            <Button
              onPress={() => setActiveTab('guide')}
              variant={activeTab === 'guide' ? 'primary' : 'secondary'}
              color={Colors.workout}
              style={styles.tabButton}
            >
              {gifUrl ? 'Ver guia' : 'Ver tecnica'}
            </Button>
          ) : null}
        </View>

        <View style={styles.viewerCard}>
          {currentHtml ? (
            <WebView
              source={{ html: currentHtml }}
              originWhitelist={['*']}
              style={styles.webview}
              javaScriptEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          ) : activeTab === 'guide' && hasStructuredGuide ? (
            <ScrollView
              contentContainerStyle={styles.guideScroll}
              showsVerticalScrollIndicator={false}
            >
              {instructions?.trim() ? (
                <View style={styles.guideSection}>
                  <Text style={styles.guideSectionTitle}>Paso a paso</Text>
                  <Text style={styles.guideSectionBody}>{instructions.trim()}</Text>
                </View>
              ) : null}

              {cues?.length ? (
                <View style={styles.guideSection}>
                  <Text style={styles.guideSectionTitle}>Cues utiles</Text>
                  {cues.slice(0, 4).map((cue) => (
                    <View key={cue} style={styles.guideBulletRow}>
                      <View style={styles.guideBullet} />
                      <Text style={styles.guideBulletText}>{cue}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {mistakes?.length ? (
                <View style={styles.guideSection}>
                  <Text style={styles.guideSectionTitle}>Evita esto</Text>
                  {mistakes.slice(0, 4).map((mistake) => (
                    <View key={mistake} style={styles.guideBulletRow}>
                      <View style={[styles.guideBullet, styles.guideBulletWarn]} />
                      <Text style={styles.guideBulletText}>{mistake}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {variations?.length ? (
                <View style={styles.guideSection}>
                  <Text style={styles.guideSectionTitle}>Variaciones</Text>
                  <View style={styles.variationRow}>
                    {variations.slice(0, 4).map((variation) => (
                      <View key={variation} style={styles.variationChip}>
                        <Text style={styles.variationChipText}>{variation}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin media cargada</Text>
              <Text style={styles.emptyBody}>
                Este ejercicio todavia no tiene video ni guia tecnica cargada.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>{currentTitle}</Text>
          <Text style={styles.footerBody}>
            Mantienes la referencia dentro de Vyra sin perder el contexto del entreno.
          </Text>
          {cues?.length ? (
            <Text style={styles.cueText}>{cues.slice(0, 3).join(' · ')}</Text>
          ) : instructions?.trim() ? (
            <Text style={styles.cueText}>{instructions.trim()}</Text>
          ) : null}
          {(videoUrl || gifUrl) ? (
            <Button
              onPress={() => void handleOpenExternal()}
              variant="ghost"
              color={Colors.textPrimary}
              fullWidth
            >
              Abrir recurso afuera
            </Button>
          ) : null}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing[3],
    paddingBottom: Spacing[5],
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  tabButton: {
    flex: 1,
  },
  viewerCard: {
    flex: 1,
    minHeight: 320,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.18),
    backgroundColor: '#05060A',
  },
  webview: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  guideScroll: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  guideSection: {
    gap: Spacing[2],
  },
  guideSectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  guideSectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  guideBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  guideBullet: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
    marginTop: 6,
  },
  guideBulletWarn: {
    backgroundColor: Colors.warning,
  },
  guideBulletText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  variationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  variationChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.2),
    backgroundColor: withOpacity(Colors.workout, 0.1),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  variationChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  footerTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  footerBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  cueText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
});
