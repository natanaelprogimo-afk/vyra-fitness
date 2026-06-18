import { Redirect } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import NoticeCard from '@/components/ui/NoticeCard';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';

const INTERNAL_ROUTES_ENABLED =
  __DEV__ && process.env.EXPO_PUBLIC_ENABLE_INTERNAL_ROUTES === 'true';

export default function AdsLabRemovedScreen() {
  if (!INTERNAL_ROUTES_ENABLED) {
    return <Redirect href={Routes.settings.index as never} />;
  }

  return (
    <SafeScreen padBottom>
      <Header title="Monetizacion retirada" showBack color={Colors.warning} />
      <NoticeCard
        title="Esta superficie interna quedó desactivada"
        body="La estrategia premium de VYRA ya no usa superficies promocionales dentro de la experiencia fitness."
        tone="warning"
      />
    </SafeScreen>
  );
}
