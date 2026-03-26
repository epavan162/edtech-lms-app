import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/store/auth';
import { useToast } from '../../src/components/ui/Toast';
import { loginSchema, validateForm } from '../../src/utils/validation';
import { Colors } from '../../src/theme';
import { AxiosError } from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = (): boolean => {
    const fieldErrors = validateForm(loginSchema, { username: username.trim(), password });
    if (fieldErrors) {
      setErrors(fieldErrors as { username?: string; password?: string });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ username: username.trim(), password });
      showToast('Welcome back! Signed in successfully.', 'success');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Login failed. Please try again.';
      showToast(message, 'error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 56,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_700Bold',
                  fontSize: 28,
                  color: Colors.onPrimary,
                }}
              >
                A
              </Text>
            </LinearGradient>
            <Text
              style={{
                fontFamily: 'Manrope_700Bold',
                fontSize: 28,
                lineHeight: 36,
                color: Colors.onSurface,
                textAlign: 'center',
                letterSpacing: -0.16,
              }}
            >
              The Atelier
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 20,
                color: Colors.onSurfaceVariant,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Curating your path to mastery.
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16, marginBottom: 24 }}>
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
              icon={<Mail size={18} color={Colors.outline} strokeWidth={1.5} />}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.password}
              icon={<Lock size={18} color={Colors.outline} strokeWidth={1.5} />}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.outline} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} color={Colors.outline} strokeWidth={1.5} />
                  )}
                </Pressable>
              }
            />
          </View>

          <Pressable style={{ alignSelf: 'flex-end', marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 13,
                color: Colors.primary,
              }}
            >
              Forgot Password?
            </Text>
          </Pressable>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
          />

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 32,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: Colors.onSurfaceVariant,
              }}
            >
              New curator?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                Create an account
              </Text>
            </Pressable>
          </View>

          {/* Bottom links */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 'auto',
              paddingTop: 48,
              gap: 24,
            }}
          >
            {['Support', 'Privacy Policy', 'Terms'].map((text) => (
              <Text
                key={text}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: Colors.outline,
                }}
              >
                {text}
              </Text>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
