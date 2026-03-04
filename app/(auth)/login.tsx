// ============================================================
// VYRA FITNESS — Login Screen
// ============================================================

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';
import { AuthStrings } from '@/constants/strings';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    const emailErr    = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr)    e.email    = emailErr;
    if (passwordErr) e.password = passwordErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    await login(email.trim().toLowerCase(), password);
  };

  return (
    <SafeScreen scrollable>
      <Header title={AuthStrings.login.title} showBack />

      <View style={styles.form}>
        <Input
          label={AuthStrings.login.email}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          returnKeyType="next"
        />
        <Input
          label={AuthStrings.login.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          error={errors.password}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} style={styles.forgot}>
          <Text style={styles.forgotText}>{AuthStrings.login.forgot}</Text>
        </Pressable>

        <Button onPress={handleLogin} variant="primary" fullWidth size="lg" loading={isLoading} style={styles.cta}>
          {AuthStrings.login.cta}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{AuthStrings.login.noAccount} </Text>
        <Pressable onPress={() => router.replace('/(auth)/register' as any)}>
          <Text style={styles.footerLink}>{AuthStrings.login.register}</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  form:        { flex: 1, paddingTop: Spacing[6], gap: Spacing[1] },
  forgot:      { alignSelf: 'flex-end', marginTop: -Spacing[1], marginBottom: Spacing[4] },
  forgotText:  { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.brand },
  cta:         { marginTop: Spacing[2] },
  footer:      { flexDirection: 'row', justifyContent: 'center', paddingVertical: Spacing[6] },
  footerText:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink:  { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.brand },
});