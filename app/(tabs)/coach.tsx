// app/(tabs)/coach.tsx — RUTA CORRECTA (Bug 4 fix: era app/tabs/coach.tsx)
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAI } from '@/hooks/useAI';
import { usePremium } from '@/hooks/usePremium';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── CHIPS DE SUGERENCIAS ────────────────────────────────────────────────────

const SUGGESTION_CHIPS = [
  '¿Cómo voy hoy?',
  '¿Qué debería comer?',
  'Motívame',
  'Consejo de entrenamiento',
  '¿Cómo mejorar mi sueño?',
];

// ─── TYPEWRITER HOOK ─────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 18): string {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  React.useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

// ─── COMPONENTE MENSAJE ──────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  isLoading: boolean;
}

function MessageBubble({ message, isLast, isLoading }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  // Solo aplica typewriter al último mensaje del assistant
  const typewritten = useTypewriter(
    isAssistant && isLast && !isLoading ? message.content : ''
  );

  const displayText =
    isAssistant && isLast && !isLoading ? typewritten : message.content;

  return (
    <View
      style={[
        styles.bubble,
        isAssistant ? styles.bubbleAssistant : styles.bubbleUser,
      ]}
    >
      {isAssistant && (
        <View style={styles.assistantHeader}>
          <Text style={styles.assistantEmoji}>🤖</Text>
          <Text style={styles.assistantName}>Vyra</Text>
        </View>
      )}
      <Text
        style={[
          styles.bubbleText,
          isAssistant ? styles.bubbleTextAssistant : styles.bubbleTextUser,
        ]}
      >
        {displayText}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

// ─── PANTALLA PRINCIPAL ──────────────────────────────────────────────────────

export default function CoachScreen() {
  const { messages, sendMessage, isLoading, dailyMessagesLeft } = useAI();
  const { isPremium } = usePremium();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput('');
    await sendMessage(msg);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, isLoading, sendMessage]);

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <MessageBubble
        message={item}
        isLast={index === messages.length - 1}
        isLoading={isLoading}
      />
    ),
    [messages.length, isLoading]
  );

  const isAtLimit = !isPremium && dailyMessagesLeft <= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Vyra Coach</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? 'Pensando...' : 'Lista para ayudarte'}
            </Text>
          </View>
        </View>
        {!isPremium && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>{dailyMessagesLeft} hoy</Text>
          </View>
        )}
      </View>

      {/* Disclaimer médico — siempre visible */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚕️ Vyra Coach es un asistente de IA de bienestar. No reemplaza la consulta médica, nutricional o psicológica.
        </Text>
      </View>

      {/* Mensajes */}
      <FlatList
        ref={listRef}
        data={messages as unknown as ChatMessage[]}
        keyExtractor={item => item?.id ?? Math.random().toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👋</Text>
            <Text style={styles.emptyTitle}>¡Hola! Soy Vyra</Text>
            <Text style={styles.emptySubtitle}>
              Tu coach de salud personalizado. Conozco tu progreso de hoy y estoy listo para ayudarte.
            </Text>
          </View>
        }
      />

      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.brand} />
          <Text style={styles.loadingText}>Vyra está pensando...</Text>
        </View>
      )}

      {/* Chips de sugerencias — solo cuando no hay mensajes */}
      {messages.length === 0 && !isLoading && (
        <View style={styles.chipsContainer}>
          <FlatList
            horizontal
            data={SUGGESTION_CHIPS}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleSend(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        {isAtLimit ? (
          <View style={styles.limitWarning}>
            <Text style={styles.limitWarningText}>
              Usaste tus 5 mensajes de hoy. 💎 Hacete Premium para mensajes ilimitados.
            </Text>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Preguntale algo a Vyra..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  avatarRing: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.bgElevated,
    borderWidth:     2,
    borderColor:     Colors.brand,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarEmoji:    { fontSize: 20 },
  headerTitle: {
    color:      Colors.textPrimary,
    fontSize:   16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color:    Colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  limitBadge: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      12,
    borderWidth:       1,
    borderColor:       Colors.brand,
  },
  limitText: {
    color:      Colors.brand,
    fontSize:   12,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  disclaimerText: {
    color:    Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  messagesList: {
    padding: 16,
    gap:     12,
  },
  bubble: {
    maxWidth:     '85%',
    borderRadius: 16,
    padding:      12,
    marginBottom: 8,
  },
  bubbleUser: {
    backgroundColor: Colors.brand,
    alignSelf:       'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.bgElevated,
    alignSelf:       'flex-start',
    borderBottomLeftRadius: 4,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginBottom:  4,
  },
  assistantEmoji: { fontSize: 14 },
  assistantName: {
    color:      Colors.brand,
    fontSize:   12,
    fontWeight: '600',
  },
  bubbleText: {
    fontSize:   15,
    lineHeight: 22,
  },
  bubbleTextUser:      { color: '#FFFFFF' },
  bubbleTextAssistant: { color: Colors.textPrimary },
  timestamp: {
    color:     Colors.textMuted,
    fontSize:  10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    paddingHorizontal: 20,
    paddingVertical:   8,
  },
  loadingText: {
    color:    Colors.textSecondary,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji:    { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    color:      Colors.textPrimary,
    fontSize:   22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color:     Colors.textSecondary,
    fontSize:  15,
    textAlign: 'center',
    lineHeight: 22,
  },
  chipsContainer: {
    paddingVertical: 10,
  },
  chip: {
    backgroundColor:  Colors.bgElevated,
    borderRadius:     20,
    paddingHorizontal: 14,
    paddingVertical:   8,
    marginRight:      8,
    borderWidth:      1,
    borderColor:      Colors.border,
  },
  chipText: {
    color:    Colors.textPrimary,
    fontSize: 13,
  },
  inputRow: {
    flexDirection:   'row',
    alignItems:      'flex-end',
    paddingHorizontal: 12,
    paddingVertical:   10,
    gap:             8,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  input: {
    flex:             1,
    backgroundColor:  Colors.bgElevated,
    color:            Colors.textPrimary,
    borderRadius:     12,
    paddingHorizontal: 14,
    paddingVertical:   10,
    fontSize:         15,
    maxHeight:        100,
    borderWidth:      1,
    borderColor:      Colors.border,
  },
  sendButton: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.brand,
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    color:    '#FFFFFF',
    fontSize: 18,
  },
  limitWarning: {
    margin:           16,
    backgroundColor:  'rgba(245,158,11,0.12)',
    borderRadius:     12,
    padding:          14,
    borderWidth:      1,
    borderColor:      Colors.warning,
  },
  limitWarningText: {
    color:     Colors.warning,
    fontSize:  14,
    textAlign: 'center',
    lineHeight: 20,
  },
});