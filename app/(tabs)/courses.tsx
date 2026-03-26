import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BookOpen, Bookmark, ArrowRight } from 'lucide-react-native';
import { useCourseStore } from '../../src/store/courses';
import { courseService } from '../../src/services/courses';
import { Card } from '../../src/components/ui/Card';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Chip } from '../../src/components/ui/Chip';
import { Colors } from '../../src/theme';
import { getCourseThumbnailUrl } from '../../src/utils/images';
import type { Course } from '../../src/types';

type TabType = 'enrolled' | 'bookmarks';

export default function CoursesScreen() {
  const router = useRouter();
  const { bookmarks, enrollments, isBookmarked, toggleBookmark } = useCourseStore();
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
    setLoading(true);
    const [enrolled, bookmarked] = await Promise.all([
      fetchCourseDetails(enrollments),
      fetchCourseDetails(bookmarks),
    ]);
    setEnrolledCourses(enrolled);
    setBookmarkedCourses(bookmarked);
    setLoading(false);
    setRefreshing(false);
  }, [enrollments, bookmarks, fetchCourseDetails]);

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
      <FlatList
        data={currentData}
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

            {/* Tabs */}
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginBottom: 24,
              }}
            >
              <Pressable onPress={() => setActiveTab('enrolled')}>
                <Chip
                  label={`My Courses (${enrollments.length})`}
                  icon={<BookOpen size={14} color={activeTab === 'enrolled' ? Colors.primary : Colors.onSecondaryContainer} strokeWidth={1.5} />}
                  variant={activeTab === 'enrolled' ? 'primary' : 'default'}
                />
              </Pressable>
              <Pressable onPress={() => setActiveTab('bookmarks')}>
                <Chip
                  label={`Bookmarks (${bookmarks.length})`}
                  icon={<Bookmark size={14} color={activeTab === 'bookmarks' ? Colors.primary : Colors.onSecondaryContainer} strokeWidth={1.5} />}
                  variant={activeTab === 'bookmarks' ? 'primary' : 'default'}
                />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
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
