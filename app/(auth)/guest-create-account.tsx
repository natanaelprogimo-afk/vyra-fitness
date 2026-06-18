// vyra-fitness/app/(auth)/guest-create-account.tsx
// Screen: Create Account - Convert guest to permanent account

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
import { useAuthStore } from '@/stores/authStore';

export default function GuestCreateAccountScreen() {
  const router = useRouter();
  const { guest_uuid, email, code } = useLocalSearchParams<{
    guest_uuid: string;
    email: string;
    code: string;
  }>();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = () => {
    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/guest/convert-to-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_uuid,
          email,
          password,
          code,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        // Account created - now login
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const loginResult = await loginResponse.json();

        if (loginResult.session && loginResult.user) {
          setSession(loginResult.session);
          setUser(loginResult.user);
          router.replace('/(tabs)' as never);
        } else {
          Alert.alert('Success', 'Account created! Please log in with your new credentials.', [
            { text: 'Go to Login', onPress: () => router.push('/(auth)/login' as never) },
          ]);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Account creation error:', error);
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
          Create Your Account
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Sizes.spacing * 2,
            lineHeight: 20,
          }}
        >
          Set a password to secure your account. All your guest data will be transferred.
        </Text>

        <View
          style={{
            backgroundColor: Colors.success + '20',
            borderColor: Colors.success,
            borderWidth: 1,
            padding: Sizes.spacing,
            borderRadius: Sizes.radius,
            marginBottom: Sizes.spacing * 2,
          }}
        >
          <Text style={{ fontSize: 12, color: Colors.text, fontWeight: '600' }}>
            ✅ Data Transfer
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: Sizes.spacing * 0.5 }}>
            All your logs, workouts, and settings will move to your new account.
          </Text>
        </View>

        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Sizes.spacing * 0.5 }}>
          Email
        </Text>

        <TextInput
          value={email}
          editable={false}
          style={{
            backgroundColor: Colors.surface,
            padding: Sizes.spacing,
            borderRadius: Sizes.radius,
            fontSize: 16,
            color: Colors.textSecondary,
            marginBottom: Sizes.spacing * 2,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        />

        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Sizes.spacing * 0.5 }}>
          Password (min 8 characters)
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: Sizes.radius,
            borderColor: Colors.border,
            borderWidth: 1,
            marginBottom: Sizes.spacing * 2,
          }}
        >
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
            style={{
              flex: 1,
              padding: Sizes.spacing,
              fontSize: 16,
              color: Colors.text,
            }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: Sizes.spacing }}
          >
            <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '600' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Sizes.spacing * 0.5 }}>
          Confirm Password
        </Text>

        <TextInput
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
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
          onPress={handleCreateAccount}
          disabled={loading || !password || !confirmPassword}
          style={{
            backgroundColor: Colors.primary,
            padding: Sizes.spacing * 1.5,
            borderRadius: Sizes.radius,
            marginBottom: Sizes.spacing * 2,
            opacity: loading || !password || !confirmPassword ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : (
            <Text style={{ color: Colors.background, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Create Account & Transfer Data
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login' as never)}
          style={{ padding: Sizes.spacing }}
        >
          <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
