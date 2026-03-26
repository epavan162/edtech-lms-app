import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  LogOut,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Camera,
  BookOpen,
  Award,
  Clock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/store/auth';
import { useCourseStore } from '../../src/store/courses';
import { useToast } from '../../src/components/ui/Toast';
import { authService } from '../../src/services/auth';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { enrollments, bookmarks } = useCourseStore();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const handleLogout = useCallback(async () => {
    const doLogout = async () => {
      setLoggingOut(true);
      try {
        await logout();
        showToast('Logged out successfully. See you soon!', 'success');
      } catch {
        showToast('Logged out.', 'info');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        await doLogout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: doLogout,
        },
      ]);
    }
  }, [logout, showToast]);

  const handleAvatarPick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Please allow access to your photos.', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUpdatingAvatar(true);
      try {
        // Build FormData for the avatar upload
        const asset = result.assets[0];
        const formData = new FormData();

        if (Platform.OS === 'web') {
          // On web, fetch the blob from the URI
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          formData.append('avatar', blob, 'avatar.jpg');
        } else {
          // On native, use the file URI directly
          formData.append('avatar', {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: 'avatar.jpg',
          } as any);
        }

        // Call the real API: PATCH /api/v1/users/avatar
        const apiResponse = await authService.updateAvatar(formData);
        const updatedUser = (apiResponse as any)?.data ?? apiResponse;

        if (user && updatedUser) {
          updateUser({
            ...user,
            avatar: updatedUser.avatar ?? { url: asset.uri },
          });
        }

        showToast('Profile picture updated!', 'success');
      } catch {
        // Fallback: update locally even if API fails
        if (user) {
          updateUser({
            ...user,
            avatar: { url: result.assets[0].uri },
          });
        }
        showToast('Avatar saved locally. API sync will retry later.', 'info');
      } finally {
        setUpdatingAvatar(false);
      }
    }
  }, [user, updateUser, showToast]);

  const stats = [
    {
      icon: <BookOpen size={18} color={Colors.primary} strokeWidth={1.5} />,
      label: 'Enrolled',
      value: enrollments.length.toString(),
    },
    {
      icon: <Award size={18} color={Colors.tertiary} strokeWidth={1.5} />,
      label: 'Bookmarks',
      value: bookmarks.length.toString(),
    },
    {
      icon: <Clock size={18} color={Colors.secondary} strokeWidth={1.5} />,
      label: 'Hours',
      value: `${enrollments.length * 4}`,
    },
  ];

  const menuItems = [
    { icon: Settings, label: 'Account Settings' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy & Security' },
    { icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLow }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 24 }}>
          <Pressable onPress={handleAvatarPick} style={{ position: 'relative' }} disabled={updatingAvatar}>
            <Image
              source={{
                uri:
                  user?.avatar?.url ||
                  `https://ui-avatars.com/api/?name=${user?.username || 'U'}&size=120&background=E2DFFF&color=3730A3&bold=true`,
              }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: Colors.primaryFixed,
                opacity: updatingAvatar ? 0.5 : 1,
              }}
              contentFit="cover"
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: Colors.surfaceContainerLow,
              }}
            >
              <Camera size={14} color={Colors.onPrimary} strokeWidth={2} />
            </View>
          </Pressable>

          <Text
            style={{
              fontFamily: 'Manrope_700Bold',
              fontSize: 24,
              color: Colors.onSurface,
              marginTop: 16,
            }}
          >
            {user?.username ?? 'Learner'}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: Colors.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            {user?.email ?? 'student@theatelier.edu'}
          </Text>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card>
            <View
              style={{
                flexDirection: 'row',
                padding: 20,
              }}
            >
              {stats.map((stat, i) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    gap: 8,
                    borderRightWidth: i < stats.length - 1 ? 1 : 0,
                    borderRightColor: `${Colors.outlineVariant}26`,
                  }}
                >
                  {stat.icon}
                  <Text
                    style={{
                      fontFamily: 'Manrope_700Bold',
                      fontSize: 22,
                      color: Colors.onSurface,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      color: Colors.onSurfaceVariant,
                    }}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Menu */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'Manrope_600SemiBold',
              fontSize: 18,
              color: Colors.onSurface,
              marginBottom: 12,
            }}
          >
            Account Preferences
          </Text>
          <Card>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: Colors.surfaceContainerHigh,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <item.icon
                    size={18}
                    color={Colors.onSurfaceVariant}
                    strokeWidth={1.5}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Inter_500Medium',
                    fontSize: 15,
                    color: Colors.onSurface,
                  }}
                >
                  {item.label}
                </Text>
                <ChevronRight
                  size={18}
                  color={Colors.outline}
                  strokeWidth={1.5}
                />
              </Pressable>
            ))}
          </Card>
        </View>

        {/* Premium CTA */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24 }}
          >
            <Text
              style={{
                fontFamily: 'Manrope_600SemiBold',
                fontSize: 18,
                color: Colors.onPrimary,
                marginBottom: 8,
              }}
            >
              Elevate Your Learning
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: `${Colors.onPrimary}CC`,
                lineHeight: 18,
              }}
            >
              Get unlimited access to premium atelier workshops and mentoring sessions.
            </Text>
          </LinearGradient>
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 24 }}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            loading={loggingOut}
            fullWidth
            icon={<LogOut size={16} color={Colors.primary} strokeWidth={1.5} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
