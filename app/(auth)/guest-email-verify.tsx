// vyra-fitness/app/(auth)/guest-email-verify.tsx
// Screen: Verify Email Code - Enter 6-digit code sent to email

import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Sizes } from '@/constants';
import { API_BASE_URL } from '@/constants/config';

export default function GuestEmailVerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/guest/verify-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        // Store guest_uuid and code for account conversion
        router.push({
          pathname: '/guest-create-account',
          params: {
            guest_uuid: result.guest_uuid,
            email,
            code,
          },
        });
      } else {
        Alert.alert('Error', result.error || 'Invalid verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: Sizes.spacing }}>
      <View style={{ marginTop: Sizes.spacing * 4 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.text,
            marginBottom: Sizes.spacing,
          }}
        >
          Verify Code
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Sizes.spacing * 2,
            lineHeight: 20,
          }}
        >
          Enter the 6-digit code we sent to
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: Colors.text,
            fontWeight: '600',
            marginBottom: Sizes.spacing * 3,
          }}
        >
          {email}
        </Text>

        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Sizes.spacing * 0.5 }}>
          Verification Code
        </Text>

        <TextInput
          placeholder="000000"
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
          style={{
            backgroundColor: Colors.surface,
            padding: Sizes.spacing,
            borderRadius: Sizes.radius,
            fontSize: 24,
            color: Colors.text,
            marginBottom: Sizes.spacing * 3,
            borderColor: Colors.border,
            borderWidth: 1,
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 8,
          }}
        />

        <TouchableOpacity
          onPress={handleVerifyCode}
          disabled={loading || code.length !== 6}
          style={{
            backgroundColor: Colors.primary,
            padding: Sizes.spacing * 1.5,
            borderRadius: Sizes.radius,
            marginBottom: Sizes.spacing * 2,
            opacity: loading || code.length !== 6 ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : (
            <Text style={{ color: Colors.background, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Verify Code
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/guest-email-recovery')}
          style={{ padding: Sizes.spacing }}
        >
          <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
            Did not receive code? Resend
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
