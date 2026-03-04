// ============================================================
// VYRA FITNESS — Tab: Coach IA
// Chat completo con Vyra, burbujas, typing indicator,
// prompts sugeridos, límite free, upgrade gate
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { useCoach, type ChatMessage } from '@/hooks/useCoach';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

// ─── Typing indicator ─────────────────────────────────────
function TypingIndicator() {
  const dots = [0, 1, 2].map(() => useSharedValue(0.3));

  useEffect(() => {
    dots.forEach((dot, i) => {
      setTimeout(() => {
        dot.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ), -1, false
        );
      }, i * 150);
    });
  }, []);

  return (
    <View style={styles.typingBubble}>
      {dots.map((dot, i) => {
        const style = useAnimatedStyle(() => ({ opacity: dot.value }));
        return <Animated.View key={i} style={[styles.typingDot, style]} />;
      })}
    </View>
  );
}

// ─── Burbuja de mensaje ───────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const time   = new Date(message.createdAt).toLocaleTimeString('es', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAI]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>V</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {message.content}
        </Text>
        <Text style={[styles.bubbleTime, isUser && { color: 'rgba(255,255,255,0.6)' }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────
export default function CoachScreen() {
  const {
    messages, isLoadingHistory, isSending, isTyping,
    isPremium, coachName, suggestedPrompts,
    sendMessage, clearHistory,
  } = useCoach();
  const profile = useAuthStore(s => s.profile);

  const [input,       setInput]       = useState('');
  const [showSuggests, setShowSuggests] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, isTyping]);

  // Ocultar sugerencias al escribir
  useEffect(() => {
    setShowSuggests(input.length === 0 && messages.length <= 1);
  }, [input.length, messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    sendMessage(text);
  };

  const handleSuggest = (prompt: string) => {
    setInput(prompt);
    Haptics.selectionAsync().catch(() => {});
  };

  const handleClear = () => {
    Alert.alert(
      'Borrar conversación',
      '¿Querés borrar todo el historial con Vyra?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom={false} style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>V</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{coachName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Coach IA</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>🗑️</Text>
        </Pressable>
      </View>

      {/* Banner límite free */}
      {!isPremium && (
        <Pressable
          style={styles.limitBanner}
          onPress={() => router.push('/(auth)/onboarding/step5-premium' as any)}
        >
          <Text style={styles.limitText}>
            🔒 Modo gratuito: 10 mensajes/día •{' '}
            <Text style={styles.limitLink}>Upgrade Premium →</Text>
          </Text>
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={styles.kbAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mensaje de bienvenida */}
          {messages.length === 0 && !isLoadingHistory && (
            <View style={styles.welcome}>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <Text style={styles.welcomeTitle}>¡Hola, {profile?.name ?? 'atleta'}!</Text>
              <Text style={styles.welcomeText}>
                Soy {coachName}, tu coach de bienestar personal. Puedo ayudarte con nutrición, entrenamiento, sueño, ayuno y más. ¿Por dónde empezamos?
              </Text>
            </View>
          )}

          {/* Mensajes */}
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={styles.bubbleWrap}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>V</Text>
              </View>
              <TypingIndicator />
            </View>
          )}

          {/* Sugerencias */}
          {showSuggests && (
            <View style={styles.suggests}>
              <Text style={styles.suggestsLabel}>Podés preguntarme:</Text>
              {suggestedPrompts.map((prompt, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSuggest(prompt)}
                  style={styles.suggestChip}
                >
                  <Text style={styles.suggestText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={`Escribile a ${coachName}...`}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={2000}
            returnKeyType="default"
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isSending}
            style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendBtnText}>
              {isSending ? '⏳' : '➤'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.bgPrimary },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[5], paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.white },
  headerName:  { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  statusDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.steps },
  statusText:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  clearBtn:    { padding: Spacing[2] },
  clearBtnText:{ fontSize: 18 },

  // Limit banner
  limitBanner: { backgroundColor: `${Colors.fasting}15`, paddingHorizontal: Spacing[5], paddingVertical: Spacing[2], borderBottomWidth: 1, borderBottomColor: `${Colors.fasting}30` },
  limitText:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  limitLink:   { fontFamily: FontFamily.bold, color: Colors.fasting },

  kbAvoid:     { flex: 1 },

  // Messages
  messageList:    { flex: 1 },
  messageContent: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[4], gap: Spacing[3] },

  // Welcome
  welcome:      { alignItems: 'center', paddingVertical: Spacing[6], paddingHorizontal: Spacing[4] },
  welcomeEmoji: { fontSize: 48, marginBottom: Spacing[3] },
  welcomeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, marginBottom: Spacing[2] },
  welcomeText:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: FontSize.sm * 1.6 },

  // Bubbles
  bubbleWrap:     { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing[2] },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI:   { justifyContent: 'flex-start' },
  aiAvatar:       { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.brand, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  aiAvatarText:   { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white },
  bubble:         { maxWidth: '78%', paddingVertical: Spacing[2.5], paddingHorizontal: Spacing[4], borderRadius: Radius['2xl'], gap: Spacing[1] },
  bubbleUser:     { backgroundColor: Colors.brand, borderBottomRightRadius: Radius.sm },
  bubbleAI:       { backgroundColor: Colors.bgSurface, borderBottomLeftRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  bubbleText:     { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: FontSize.sm * 1.55 },
  bubbleTextUser: { color: Colors.white },
  bubbleTime:     { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.textMuted, alignSelf: 'flex-end' },

  // Typing
  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: Spacing[3], paddingHorizontal: Spacing[4], backgroundColor: Colors.bgSurface, borderRadius: Radius['2xl'], borderBottomLeftRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  typingDot:    { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.textMuted },

  // Suggestions
  suggests:      { marginTop: Spacing[4] },
  suggestsLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing[2] },
  suggestChip:   { paddingVertical: Spacing[2], paddingHorizontal: Spacing[3], backgroundColor: Colors.bgSurface, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing[2], alignSelf: 'flex-start' },
  suggestText:   { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },

  // Input
  inputRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing[3], paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.bgPrimary },
  textInput: {
    flex: 1,
    backgroundColor:  Colors.bgSurface,
    borderRadius:     Radius.xl,
    borderWidth:      1,
    borderColor:      Colors.border,
    paddingHorizontal:Spacing[4],
    paddingVertical:  Spacing[2.5],
    color:            Colors.textPrimary,
    fontFamily:       FontFamily.regular,
    fontSize:         FontSize.sm,
    maxHeight:        120,
  },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.bgElevated },
  sendBtnText:     { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.white },
});