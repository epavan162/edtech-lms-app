import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
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
import { analytics } from '../../src/services/analytics';
import { Colors } from '../../src/theme';
import { useToast } from '../../src/components/ui/Toast';
import type { Course, Instructor } from '../../src/types';
import { getUserAvatarUrl } from '../../src/utils/images';
import { LegendList } from '@legendapp/list';

// Define HomeHeader OUTSIDE of HomeScreen to ensure its component identity remains stable.
// This prevents the search bar from re-mounting and losing focus during keystrokes.
const HomeHeader = React.memo(({ 
  user, 
  searchQuery, 
  onSearch, 
  onProfilePress,
  router 
}: { 
  user: any; 
  searchQuery: string; 
  onSearch: (q: string) => void;
  onProfilePress: () => void;
  router: any;
}) => (
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
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            color: Colors.onSurfaceVariant,
            marginBottom: 4,
          }}
        >
          Welcome back 👋
        </Text>
        <Text
          style={{
            fontFamily: 'Manrope_700Bold',
            fontSize: 28,
            color: Colors.onSurface,
            letterSpacing: -0.16,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user?.username ?? 'Learner'}
        </Text>
      </View>
      <Pressable onPress={onProfilePress}>
        <Image
          source={{ uri: getUserAvatarUrl(user) }}
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
        onChangeText={onSearch}
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
          onPress={() => onSearch('')}
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
      {searchQuery ? `Results for "${searchQuery}"` : 'Explore Courses'}
    </Text>
  </View>
));

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    isBookmarked, 
    toggleBookmark, 
    bookmarkCount, 
    cachedCourses, 
    cachedInstructors, 
    saveCoursesToCache 
  } = useCourseStore();

  const [courses, setCourses] = useState<Course[]>(cachedCourses);
  const [instructors, setInstructors] = useState<Instructor[]>(cachedInstructors);
  const [loading, setLoading] = useState(cachedCourses.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track the most recent fetch query to prevent race conditions (stale updates)
  const lastFetchQuery = useRef<string | undefined>(undefined);

  // Sync with store cache when it loads (Fixes empty home screen when starting offline)
  useEffect(() => {
    if (courses.length === 0 && cachedCourses.length > 0) {
      setCourses(cachedCourses);
      setLoading(false);
    }
  }, [cachedCourses, courses.length]);

  const fetchData = useCallback(
    async (pageNum = 1, query?: string, isRefresh = false) => {
      lastFetchQuery.current = query;
      try {
        // Minimal fix: Don't show skeleton if we are just searching or clearing search
        // and we already have some data to show.
        const shouldShowSkeleton = pageNum === 1 && !isRefresh && courses.length === 0;
        if (shouldShowSkeleton) setLoading(true);
        setError(null);

        const [coursesRes, instructorsRes] = await Promise.all([
          courseService.getCourses(pageNum, 10, query),
          pageNum === 1 ? courseService.getInstructors(1, 20) : Promise.resolve(null),
        ]);

        const newCourses = coursesRes.data.data;
        const newInstructors = instructorsRes?.data.data ?? instructors;

        // Skip state update if this is a stale request from a previous search query
        if (query !== lastFetchQuery.current) return;

        if (pageNum === 1) {
          setCourses(newCourses);
          if (!query) {
            saveCoursesToCache(newCourses, newInstructors);
          }
        } else {
          setCourses((prev) => [...prev, ...newCourses]);
        }
        setHasMore(coursesRes.data.nextPage);

        if (instructorsRes) {
          setInstructors(newInstructors);
        }
      } catch (err: any) {
        const isNetworkError = err.message === 'Network Error' || !err.response;
        if (isNetworkError) {
          setError('Offline: Please check your connection to refresh courses.');
        } else {
          setError('Failed to load courses. Pull down to retry.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    analytics.logScreenView('Home Dashboard');
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
      const q = query || undefined;
      setSearchQuery(query);
      setPage(1);
      
      // Update the active version immediately to prevent older requests from finishing
      lastFetchQuery.current = q;

      // Minimal fix: If clearing search, immediately restore the original cached courses
      // to avoid a blank screen or loading state flash.
      if (!query && cachedCourses.length > 0) {
        setCourses(cachedCourses);
      }
      
      fetchData(1, q);
    },
    [fetchData, cachedCourses],
  );

  const { showToast } = useToast();

  const handleBookmark = useCallback(
    async (courseId: number) => {
      const wasBookmarked = isBookmarked(courseId);
      await toggleBookmark(courseId);
      if (wasBookmarked) {
        showToast('Bookmark removed', 'info');
      } else {
        showToast('Course bookmarked ✓', 'success');
      }
      // Check milestone (triggered after toggling)
      const newCount = wasBookmarked ? bookmarkCount - 1 : bookmarkCount + 1;
      notificationService.sendBookmarkMilestone(newCount, user?._id || '');
    },
    [toggleBookmark, isBookmarked, bookmarkCount, showToast],
  );

  const getInstructorForCourse = useCallback(
    (index: number) => {
      if (instructors.length === 0) return undefined;
      return instructors[index % instructors.length];
    },
    [instructors],
  );

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const lowerQuery = searchQuery.toLowerCase();
    
    // 1. Filter: Only items matching the title
    const matches = courses.filter(course => 
      course.title.toLowerCase().includes(lowerQuery)
    );

    // 2. Sort: "Starts with" takes priority over "Includes"
    const sorted = [...matches].sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.title.toLowerCase().startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0; // Maintain original order for equal priority
    });

    return sorted;
  }, [courses, searchQuery]);

  const stableHeader = useMemo(() => (
    <HomeHeader 
      user={user} 
      searchQuery={searchQuery} 
      onSearch={handleSearch} 
      onProfilePress={() => router.push('/(tabs)/profile')}
      router={router}
    />
  ), [user, searchQuery, handleSearch, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLow }}>
      <LegendList
        data={loading && courses.length === 0 ? [] : filteredCourses}
        estimatedItemSize={320}
        extraData={`${bookmarkCount}-${searchQuery}`}
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
        ListHeaderComponent={stableHeader}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingHorizontal: 24, gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              title={error || 'No courses found'}
              subtitle={
                error
                  ? 'Pull down to retry'
                  : 'Try adjusting your search or check back later.'
              }
            />
          )
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
