// vyra-fitness/app/(auth)/guest-email-recovery.tsx
// Screen: Guest Email Recovery - Enter email to recover guest account

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
import { useRouter } from 'expo-router';
import { Colors, Sizes } from '@/constants';
import { API_BASE_URL } from '@/constants/config';

export default function GuestEmailRecoveryScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/guest/request-email-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.ok) {
        setEmailSent(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to send verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Recovery request error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: Sizes.spacing }}>
        <View style={{ marginTop: Sizes.spacing * 4 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: Sizes.spacing * 2,
            }}
          >
            Check Your Email
          </Text>

          <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: Sizes.spacing * 3 }}>
            We sent a verification code to:
          </Text>

          <View
            style={{
              backgroundColor: Colors.surface,
              padding: Sizes.spacing,
              borderRadius: Sizes.radius,
              marginBottom: Sizes.spacing * 3,
            }}
          >
            <Text style={{ fontSize: 16, color: Colors.text, fontWeight: '600' }}>{email}</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/guest-email-verify')}
            style={{
              backgroundColor: Colors.primary,
              padding: Sizes.spacing * 1.5,
              borderRadius: Sizes.radius,
              marginBottom: Sizes.spacing,
            }}
          >
            <Text style={{ color: Colors.background, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Enter Verification Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEmailSent(false);
              setEmail('');
            }}
            style={{ padding: Sizes.spacing }}
          >
            <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '500', textAlign: 'center' }}>
              Use Different Email
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

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
          Recover Guest Account
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Sizes.spacing * 3,
            lineHeight: 20,
          }}
        >
          Enter the email address associated with your guest account. We will send you a verification code.
        </Text>

        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Sizes.spacing * 0.5 }}>
          Email
        </Text>

        <TextInput
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          style={{
            backgroundColor: Colors.surface,
            padding: Sizes.spacing,
            borderRadius: Sizes.radius,
            fontSize: 16,
            color: Colors.text,
            marginBottom: Sizes.spacing * 3,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        />

        <TouchableOpacity
          onPress={handleRequestCode}
          disabled={loading}
          style={{
            backgroundColor: Colors.primary,
            padding: Sizes.spacing * 1.5,
            borderRadius: Sizes.radius,
            marginBottom: Sizes.spacing * 2,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : (
            <Text style={{ color: Colors.background, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Send Verification Code
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{ padding: Sizes.spacing }}
        >
          <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '500', textAlign: 'center' }}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
