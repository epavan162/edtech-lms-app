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
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Users } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/store/auth';
import { useToast } from '../../src/components/ui/Toast';
import { Colors } from '../../src/theme';
import { AxiosError } from 'axios';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username.length > 0 && username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (email && !email.includes('@')) newErrors.email = 'Invalid email address';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length > 0 && password.length < 8)
      newErrors.password = 'Must be at least 8 characters with a symbol';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      showToast('Account created! Please sign in.', 'success');
      // Navigate to login so user can sign in with new credentials
      router.replace('/(auth)/login');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Registration failed. Please try again.';
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
            paddingTop: 16,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.surfaceContainerHigh,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <ArrowLeft size={20} color={Colors.onSurface} strokeWidth={1.5} />
          </Pressable>

          {/* Hero */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: 'Manrope_700Bold',
                fontSize: 28,
                lineHeight: 36,
                color: Colors.onSurface,
                letterSpacing: -0.16,
                marginBottom: 12,
              }}
            >
              Join the curated collective of learners.
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 20,
                color: Colors.onSurfaceVariant,
                marginBottom: 24,
              }}
            >
              Experience a platform where every course is a masterpiece and every lesson
              is an upgrade.
            </Text>

            {/* Social proof */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: Colors.primaryFixed,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                alignSelf: 'flex-start',
              }}
            >
              <Users size={16} color={Colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: Colors.primary,
                }}
              >
                Trusted by 12,000+ Students
              </Text>
            </View>
          </View>

          {/* Section Header */}
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{
                fontFamily: 'Manrope_600SemiBold',
                fontSize: 20,
                color: Colors.onSurface,
                marginBottom: 4,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: Colors.onSurfaceVariant,
              }}
            >
              Begin your journey with a premium educational experience.
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16, marginTop: 24, marginBottom: 12 }}>
            <Input
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
              icon={<User size={18} color={Colors.outline} strokeWidth={1.5} />}
            />
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
              icon={<Mail size={18} color={Colors.outline} strokeWidth={1.5} />}
            />
            <Input
              label="Password"
              placeholder="Create a strong password"
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
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: Colors.outline,
                marginTop: -8,
                marginLeft: 4,
              }}
            >
              Must be at least 8 characters with a symbol.
            </Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
            />
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 24,
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
              Already part of the atelier?
            </Text>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                Log In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
