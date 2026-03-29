import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Bookmark, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../src/store/auth';
import { useCourseStore } from '../../src/store/courses';
import { courseService } from '../../src/services/courses';
import { Card } from '../../src/components/ui/Card';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Chip } from '../../src/components/ui/Chip';
import { Colors } from '../../src/theme';
import { getCourseThumbnailUrl } from '../../src/utils/images';
import type { Course } from '../../src/types';
import { LegendList } from '@legendapp/list';

type TabType = 'enrolled' | 'bookmarks';

export default function CoursesScreen() {
  const router = useRouter();
  const { bookmarks, enrollments, isBookmarked, toggleBookmark } = useCourseStore();
  const { user } = useAuth(); // Need user ID for scoping
  const userId = user?._id;
  const [activeTab, setActiveTab] = useState<TabType>('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourseDetails = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return [];
    try {
      const results = await Promise.allSettled(
        ids.map((id) => courseService.getCourseById(id)),
      );
      return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<{ data: Course }>).value.data);
    } catch {
      return [];
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrolled, bookmarked] = await Promise.all([
        fetchCourseDetails(enrollments),
        fetchCourseDetails(bookmarks),
      ]);
      
      // Cache Protection: Only update state if we actually fetched something
      // This prevents empty network results (due to offline) from clearing our UI
      if (enrolled.length > 0) {
        setEnrolledCourses(enrolled);
      }
      if (bookmarked.length > 0) {
        setBookmarkedCourses(bookmarked);
      }
      
      // Cache the detail objects for offline use (only if we got new data and have a user)
      if (userId && (enrolled.length > 0 || bookmarked.length > 0)) {
        await Promise.all([
          AsyncStorage.setItem(`@atelier_u${userId}_cached_enrolled_details`, JSON.stringify(enrolled)),
          AsyncStorage.setItem(`@atelier_u${userId}_cached_bookmarked_details`, JSON.stringify(bookmarked)),
        ]);
      }
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response) {
        // We already loaded from cache on mount, so just warn that we couldn't refresh
        // silently ignore or handle specifically if needed
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [enrollments, bookmarks, fetchCourseDetails, enrolledCourses.length, bookmarkedCourses.length]);

  // Initial load from cache (user-scoped)
  useEffect(() => {
    if (!userId) {
      setEnrolledCourses([]);
      setBookmarkedCourses([]);
      return;
    }

    const loadFromCache = async () => {
      try {
        const [cachedEnrolled, cachedBookmarked] = await Promise.all([
          AsyncStorage.getItem(`@atelier_u${userId}_cached_enrolled_details`),
          AsyncStorage.getItem(`@atelier_u${userId}_cached_bookmarked_details`),
        ]);
        if (cachedEnrolled) setEnrolledCourses(JSON.parse(cachedEnrolled));
        else setEnrolledCourses([]);

        if (cachedBookmarked) setBookmarkedCourses(JSON.parse(cachedBookmarked));
        else setBookmarkedCourses([]);
        
        // If we have cache, we can hide initial loader earlier
        setLoading(false);
      } catch {
        // ...
      }
    };
    loadFromCache();
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const currentData = activeTab === 'enrolled' ? enrolledCourses : bookmarkedCourses;

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Pressable
      onPress={() => router.push(`/course/${item.id}`)}
      style={{ paddingHorizontal: 24, paddingBottom: 16 }}
    >
      <Card>
        <View style={{ flexDirection: 'row', padding: 16, gap: 14 }}>
          <Image
            source={{ uri: getCourseThumbnailUrl(item.id, item.category, item.thumbnail) }}
            style={{ width: 80, height: 80, borderRadius: 16 }}
            contentFit="cover"
          />
          <View style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 15,
                color: Colors.onSurface,
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: Colors.onSurfaceVariant,
              }}
              numberOfLines={1}
            >
              ${item.price} • ⭐ {item.rating?.toFixed(1) ?? 'N/A'}
            </Text>
            {activeTab === 'enrolled' && (
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.surfaceContainerHigh,
                  overflow: 'hidden',
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    width: '35%',
                    height: '100%',
                    backgroundColor: Colors.primary,
                    borderRadius: 2,
                  }}
                />
              </View>
            )}
          </View>
          <ArrowRight size={18} color={Colors.outline} strokeWidth={1.5} style={{ alignSelf: 'center' }} />
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLow }}>
      <LegendList
        data={currentData}
        estimatedItemSize={140}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCourseItem}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <Text
              style={{
                fontFamily: 'Manrope_700Bold',
                fontSize: 28,
                color: Colors.onSurface,
                letterSpacing: -0.16,
                marginBottom: 8,
              }}
            >
              My Learning
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: Colors.onSurfaceVariant,
                marginBottom: 24,
              }}
            >
              Your active learning path and saved resources.
            </Text>

            {/* Premium Segmented Tabs */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: Colors.surfaceContainerHigh,
                borderRadius: 12,
                padding: 4,
                marginBottom: 24,
              }}
            >
              <Pressable 
                onPress={() => setActiveTab('enrolled')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  gap: 8,
                  backgroundColor: activeTab === 'enrolled' ? Colors.surfaceContainerLowest : 'transparent',
                  borderRadius: 8,
                  shadowColor: activeTab === 'enrolled' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: activeTab === 'enrolled' ? 0.05 : 0,
                  shadowRadius: 4,
                  elevation: activeTab === 'enrolled' ? 2 : 0,
                }}
              >
                <BookOpen size={16} color={activeTab === 'enrolled' ? Colors.primary : Colors.outline} strokeWidth={activeTab === 'enrolled' ? 2 : 1.5} />
                <Text style={{ fontFamily: activeTab === 'enrolled' ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: 13, color: activeTab === 'enrolled' ? Colors.primary : Colors.outline }}>
                  My Courses ({enrollments.length})
                </Text>
              </Pressable>

              <Pressable 
                onPress={() => setActiveTab('bookmarks')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  gap: 8,
                  backgroundColor: activeTab === 'bookmarks' ? Colors.surfaceContainerLowest : 'transparent',
                  borderRadius: 8,
                  shadowColor: activeTab === 'bookmarks' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: activeTab === 'bookmarks' ? 0.05 : 0,
                  shadowRadius: 4,
                  elevation: activeTab === 'bookmarks' ? 2 : 0,
                }}
              >
                <Bookmark size={16} color={activeTab === 'bookmarks' ? Colors.primary : Colors.outline} strokeWidth={activeTab === 'bookmarks' ? 2 : 1.5} />
                <Text style={{ fontFamily: activeTab === 'bookmarks' ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: 13, color: activeTab === 'bookmarks' ? Colors.primary : Colors.outline }}>
                  Bookmarks ({bookmarks.length})
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View>
            <EmptyState
              title={
                activeTab === 'enrolled'
                  ? 'No active enrollments'
                  : 'Nothing saved yet'
              }
              subtitle={
                activeTab === 'enrolled'
                  ? 'Your gallery of knowledge is currently waiting for its first masterpiece. Start your learning journey today!'
                  : 'As you browse through lessons, use the bookmark icon to save key moments for later review.'
              }
              icon={
                activeTab === 'enrolled' ? (
                  <BookOpen size={32} color={Colors.primary} strokeWidth={1.5} />
                ) : (
                  <Bookmark size={32} color={Colors.primary} strokeWidth={1.5} />
                )
              }
            />

          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}
