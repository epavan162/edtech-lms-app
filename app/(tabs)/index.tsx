import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { CourseCard } from '../../src/components/CourseCard';
import { CourseCardSkeleton } from '../../src/components/ui/LoadingSkeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useAuth } from '../../src/store/auth';
import { useCourseStore } from '../../src/store/courses';
import { courseService } from '../../src/services/courses';
import { notificationService } from '../../src/services/notifications';
import { Colors } from '../../src/theme';
import type { Course, Instructor } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark, bookmarkCount } = useCourseStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (pageNum = 1, query?: string, isRefresh = false) => {
      try {
        if (pageNum === 1 && !isRefresh) setLoading(true);
        setError(null);

        const [coursesRes, instructorsRes] = await Promise.all([
          courseService.getCourses(pageNum, 10, query),
          pageNum === 1 ? courseService.getInstructors(1, 20) : Promise.resolve(null),
        ]);

        const newCourses = coursesRes.data.data;
        if (pageNum === 1) {
          setCourses(newCourses);
        } else {
          setCourses((prev) => [...prev, ...newCourses]);
        }
        setHasMore(coursesRes.data.nextPage);

        if (instructorsRes) {
          setInstructors(instructorsRes.data.data);
        }
      } catch (err) {
        setError('Failed to load courses. Pull down to retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchData(1, searchQuery || undefined, true);
  }, [fetchData, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    fetchData(next, searchQuery || undefined);
  }, [hasMore, loadingMore, loading, page, fetchData, searchQuery]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPage(1);
      fetchData(1, query || undefined);
    },
    [fetchData],
  );

  const handleBookmark = useCallback(
    async (courseId: number) => {
      await toggleBookmark(courseId);
      // Check milestone (triggered after toggling)
      const newCount = isBookmarked(courseId) ? bookmarkCount - 1 : bookmarkCount + 1;
      notificationService.sendBookmarkMilestone(newCount);
    },
    [toggleBookmark, isBookmarked, bookmarkCount],
  );

  const getInstructorForCourse = useCallback(
    (index: number) => {
      if (instructors.length === 0) return undefined;
      return instructors[index % instructors.length];
    },
    [instructors],
  );

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
      {/* Greeting */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Manrope_700Bold',
              fontSize: 28,
              lineHeight: 36,
              color: Colors.onSurface,
              letterSpacing: -0.16,
            }}
          >
            Hello, {user?.username ?? 'Learner'} 👋
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: Colors.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            What will you master today?
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <Image
            source={{
              uri:
                user?.avatar?.url ||
                `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=E2DFFF&color=3730A3&bold=true`,
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.primaryFixed,
            }}
            contentFit="cover"
          />
        </Pressable>
      </View>

      {/* Search */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surfaceContainerHigh,
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 48,
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Search size={18} color={Colors.outline} strokeWidth={1.5} />
        <TextInput
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setSearchActive(true)}
          onBlur={() => setSearchActive(false)}
          placeholderTextColor={Colors.outline}
          style={{
            flex: 1,
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: Colors.onSurface,
          }}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => handleSearch('')}
            hitSlop={8}
          >
            <X size={18} color={Colors.outline} strokeWidth={1.5} />
          </Pressable>
        )}
      </View>

      {/* Section Title */}
      <Text
        style={{
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 20,
          color: Colors.onSurface,
          marginBottom: 16,
        }}
      >
        {searchQuery ? `Results for "${searchQuery}"` : 'Curated for you'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLow }}>
        {renderHeader()}
        <View style={{ paddingHorizontal: 24, gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLow }}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <CourseCard
              course={item}
              instructor={getInstructorForCourse(index)}
              isBookmarked={isBookmarked(item.id)}
              onPress={() => router.push(`/course/${item.id}`)}
              onBookmark={() => handleBookmark(item.id)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title={error || 'No courses found'}
            subtitle={
              error
                ? 'Pull down to retry'
                : 'Try adjusting your search or check back later.'
            }
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}
