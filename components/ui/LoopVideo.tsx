import React, { useEffect, useMemo, useRef } from 'react';
import { Image, Platform, StyleProp, View, ViewStyle, type ImageSourcePropType } from 'react-native';
import { Video, type AVPlaybackStatus, type AVPlaybackSource, ResizeMode } from 'expo-av';
import FallbackPoster from '@/assets/Vyra_LOGO/VYRA.jpeg';

const FALLBACK_POSTER: ImageSourcePropType = FallbackPoster;

type LoopVideoProps = {
  source: AVPlaybackSource;
  style?: StyleProp<ViewStyle>;
  loop?: boolean;
  muted?: boolean;
  contentFit?: 'contain' | 'cover' | 'fill';
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  fallbackSource?: ImageSourcePropType;
};

export default function LoopVideo({
  source,
  style,
  loop = true,
  muted = true,
  contentFit = 'contain',
  pointerEvents,
  fallbackSource,
}: LoopVideoProps) {
  const playerRef = useRef<Video | null>(null);
  const shouldDisableVideo = Platform.OS === 'android';
  const posterSource = fallbackSource ?? FALLBACK_POSTER;
  const resizeMode = useMemo(() => {
    if (contentFit === 'cover') return ResizeMode.COVER;
    if (contentFit === 'fill') return ResizeMode.STRETCH;
    return ResizeMode.CONTAIN;
  }, [contentFit]);

  useEffect(() => {
    if (shouldDisableVideo) return;
    const player = playerRef.current;
    if (!player) return;
    player.setIsLoopingAsync(loop).catch((e) => {
      console.debug?.('[LoopVideo] setIsLoopingAsync failed', e);
    });
    player.setIsMutedAsync(muted).catch((e) => {
      console.debug?.('[LoopVideo] setIsMutedAsync failed', e);
    });
  }, [loop, muted, shouldDisableVideo]);

  if (shouldDisableVideo) {
    return (
      <View pointerEvents={pointerEvents} style={style}>
        <Image
          source={posterSource}
          style={{ width: '100%', height: '100%' }}
          resizeMode={contentFit === 'cover' ? 'cover' : 'contain'}
        />
      </View>
    );
  }

  return (
    <Video
      ref={playerRef}
      source={source}
      style={style}
      resizeMode={resizeMode}
      isLooping={loop}
      isMuted={muted}
      shouldPlay
      pointerEvents={pointerEvents}
      onError={(e) => {
        console.debug?.('[LoopVideo] playback error', e);
      }}
      onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        if (status.isPlaying) return;
        if (status.isBuffering) return;
          if (loop) {
          playerRef.current?.playAsync().catch((e) => {
            console.debug?.('[LoopVideo] playAsync failed', e);
          });
        }
      }}
    />
  );
}
