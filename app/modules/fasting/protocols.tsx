import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useFasting, PROTOCOLS } from '@/hooks/useFasting';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

const EXTRA_PROTOCOLS = {
  OMAD: { label: 'OMAD', description: 'Una comida al día.' },
  '24h': { label: '24h', description: 'Ayuno de 24 horas.' },
  '5:2': { label: '5:2', description: '5 días normal + 2 días con restricción.' },
};

const RISKY_PROTOCOLS = new Set(['20:4', '23:1', 'OMAD', '24h', '5:2']);

export default function FastingProtocolsScreen() {
  const { startFast, isStarting } = useFasting();

  const [selected, setSelected] = useState<string>('16:8');
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  const protocolOptions = useMemo(() => {
    const base = Object.entries(PROTOCOLS).map(([id, data]) => ({
      id,
      label: data.label,
      description: data.description,
    }));

    const extra = Object.entries(EXTRA_PROTOCOLS).map(([id, data]) => ({
      id,
      label: data.label,
      description: data.description,
    }));

    return [...base, ...extra];
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    if (RISKY_PROTOCOLS.has(id)) {
      setShowMedicalModal(true);
    }
  };

  const confirmStart = () => {
    setShowMedicalModal(false);
    startFast(selected);
    router.back();
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Protocolos de ayuno" showBack color={Colors.fasting} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>Elegí tu protocolo</Text>
          <Text style={styles.subtitle}>
            Seleccioná el protocolo que mejor se adapte a tu rutina.
          </Text>
        </Card>

        {protocolOptions.map((protocol) => (
          <Pressable
            key={protocol.id}
            onPress={() => handleSelect(protocol.id)}
            style={[styles.protocolCard, selected === protocol.id && styles.protocolCardActive]}
          >
            <Text style={[styles.protocolLabel, selected === protocol.id && styles.protocolLabelActive]}>
              {protocol.label}
            </Text>
            <Text style={styles.protocolDescription}>{protocol.description}</Text>
          </Pressable>
        ))}

        <Button
          label={`Iniciar ${selected}`}
          onPress={() => {
            if (RISKY_PROTOCOLS.has(selected)) {
              setShowMedicalModal(true);
              return;
            }
            startFast(selected);
            router.back();
          }}
          loading={isStarting}
          color={Colors.fasting}
          style={styles.startBtn}
        />
      </ScrollView>

      <Modal
        visible={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        title="Aviso médico"
        ctaLabel="Entiendo y continuar"
        onCta={confirmStart}
      >
        <Text style={styles.modalText}>
          Este protocolo puede ser exigente (20:4, OMAD, 24h o 5:2). Si tenés una condición médica,
          antecedentes de trastornos alimentarios, embarazo o dudas clínicas, consultá a un profesional
          de salud antes de continuar.
        </Text>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  protocolCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[1],
  },
  protocolCardActive: {
    borderColor: Colors.fasting,
    backgroundColor: `${Colors.fasting}14`,
  },
  protocolLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  protocolLabelActive: {
    color: Colors.fasting,
  },
  protocolDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  startBtn: {
    marginTop: Spacing[2],
  },
  modalText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
