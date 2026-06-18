import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import NoticeCard from '@/components/ui/NoticeCard';
import SegmentedControl from '@/components/ui/SegmentedControl';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import LinkRow from '@/components/ui/LinkRow';
import MetricCard from '@/components/ui/MetricCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

export default function InternalUiGalleryScreen() {
  if (!INTERNAL_ROUTES_ENABLED) {
    return <Redirect href={Routes.settings.index as never} />;
  }

  return <InternalUiGalleryContent />;
}

const INTERNAL_ROUTES_ENABLED =
  __DEV__ && process.env.EXPO_PUBLIC_ENABLE_INTERNAL_ROUTES === 'true';

function InternalUiGalleryContent() {
  const [segment, setSegment] = useState<'system' | 'manual' | 'hybrid'>('system');
  const [toggleValue, setToggleValue] = useState(true);
  const [fieldValue, setFieldValue] = useState('');

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Galeria UI"
        subtitle="Primitives y casos de contraste"
        showBack
        color={Colors.brand}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <SectionHeader
            eyebrow="Botones"
            title="Estados base"
            subtitle="La misma familia debe seguir viendose clara con variantes, iconos y carga."
          />
          <View style={styles.buttonRow}>
            <Button onPress={() => {}} label="Primario" color={Colors.brand} />
            <Button onPress={() => {}} label="Secundario" variant="secondary" />
          </View>
          <View style={styles.buttonRow}>
            <Button
              onPress={() => {}}
              label="Con icono"
              variant="ghost"
              icon={<Ionicons name="sparkles-outline" size={16} color={Colors.textSecondary} />}
            />
            <Button onPress={() => {}} label="Deshabilitado" disabled />
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Seleccion"
            title="Toggles y segmentos"
            subtitle="El mismo patron se reutiliza en apariencia, privacidad y settings de modulos."
          />
          <SegmentedControl
            value={segment}
            onChange={setSegment}
            accessibilityLabel="Modo de entrega"
            options={[
              { value: 'system', label: 'Sistema' },
              { value: 'manual', label: 'Manual' },
              { value: 'hybrid', label: 'Hibrido' },
            ]}
          />
          <View style={styles.toggleStack}>
            <SettingToggleRow
              title="Reducir motion"
              description="Desactiva pulsos y escalas no esenciales."
              value={toggleValue}
              onValueChange={setToggleValue}
            />
            <SettingToggleRow
              title="Modo screen reader"
              description="Aumenta labels y mantiene feedback mas explicito."
              value={!toggleValue}
              onValueChange={(value) => setToggleValue(!value)}
              accentColor={Colors.sleep}
            />
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Campos"
            title="Input"
            subtitle="El secure toggle y las acciones laterales deben quedar etiquetadas."
          />
          <Input
            label="Correo o usuario"
            value={fieldValue}
            onChangeText={setFieldValue}
            placeholder="tu@correo.com"
            iconRight={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
            rightAccessibilityLabel="Sugerir correo"
          />
          <Input
            label="Contrasena"
            value="12345678"
            secureTextEntry
            editable={false}
            secureToggleAccessibilityLabel="Mostrar contrasena de muestra"
          />
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Feedback"
            title="Notices y metricas"
            subtitle="Estados inline en vez de sacar al usuario a alerts innecesarios."
          />
          <NoticeCard
            title="Backend temporalmente inestable"
            body="El contrato visual necesita decir que paso y que puede hacer la persona sin romper el flujo."
            tone="warning"
            actionLabel="Reintentar"
            onAction={() => {}}
          />
          <View style={styles.metricGrid}>
            <MetricCard
              value="88"
              label="Balance medio"
              note="Ultimos 7 dias"
              accentColor={Colors.brand}
            />
            <MetricCard
              value="2/2"
              label="Widgets activos"
              note="Compacto y expandido"
              accentColor={Colors.success}
            />
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Navegacion"
            title="Filas reutilizables"
            subtitle="Una sola gramatica para help center, settings y accesos de soporte."
          />
          <LinkRow
            label="Soporte tecnico"
            description="Diagnostico interno minimo para QA, fuera del flujo normal."
            hint="Nuevo"
            onPress={() => {}}
          />
          <LinkRow
            label="Widgets de inicio"
            description="Configuracion externa sin perder consistencia con el resto del sistema."
            accentColor={Colors.steps}
            onPress={() => {}}
          />
        </Card>

        <Card>
          <Text style={styles.lockDemoTitle}>Contenido incluido de ejemplo</Text>
          <Text style={styles.lockDemoBody}>
            La galeria ya no necesita wrappers de pago: este bloque queda disponible como parte
            del acceso actual.
          </Text>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[4],
  },
  toggleStack: {
    marginTop: Spacing[4],
    gap: Spacing[2],
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginTop: Spacing[4],
  },
  lockDemoTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  lockDemoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
