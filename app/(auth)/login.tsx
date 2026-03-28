import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/store/auth';
import { useToast } from '../../src/components/ui/Toast';
import { loginSchema } from '../../src/utils/validation';

import { storage } from '../../src/utils/storage';

type LoginFormValues = z.infer<typeof loginSchema>;
import { Colors } from '../../src/theme';
import { AxiosError } from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Check biometric availability on mount
  React.useEffect(() => {
    const checkBiometric = async () => {
      if (Platform.OS === 'web') return;
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const hasCreds = await storage.getItem('bio_username');
        setBiometricAvailable(hasHardware && isEnrolled && !!hasCreds);
      } catch {
        setBiometricAvailable(false);
      }
    };
    checkBiometric();
  }, []);

  const handleLogin = async (data: LoginFormValues) => {
    try {
      await login({ username: data.username.trim(), password: data.password });
      showToast('Welcome back! Signed in successfully.', 'success');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Login failed. Please try again.';
      showToast(message, 'error');
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        showToast('Biometrics not available or not enrolled on this device.', 'error');
        return;
      }

      // Retrieve stored credentials from previous login
      const savedUsername = await storage.getItem('bio_username');
      const savedPassword = await storage.getItem('bio_password');

      if (!savedUsername || !savedPassword) {
        showToast('Please sign in with password first to enable biometrics.', 'info');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to The Atelier',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        await login({ username: savedUsername, password: savedPassword });
        showToast('Authenticated via Biometrics.', 'success');
      }
    } catch (err) {
      showToast('Biometric authentication failed.', 'error');
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
          <Animated.View style={{ alignItems: 'center', marginBottom: 48, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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
          </Animated.View>

          {/* Form */}
          <Animated.View style={{ gap: 16, marginBottom: 24, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Username"
                  placeholder="Enter your username"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.username?.message}
                  icon={<Mail size={18} color={Colors.outline} strokeWidth={1.5} />}
                />
              )}
            />
            
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.password?.message}
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
              )}
            />
          </Animated.View>

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

          <View style={{ gap: 16 }}>
            <Button
              title="Sign In"
              onPress={handleSubmit(handleLogin)}
              loading={isLoading}
              fullWidth
            />
            <Button
              title="Sign in with Biometrics"
              onPress={handleBiometricAuth}
              variant="outline"
              fullWidth
              icon={<Fingerprint size={18} color={Colors.primary} strokeWidth={1.5} />}
            />
          </View>

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
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                Create an account
              </Text>
            </TouchableOpacity>
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
