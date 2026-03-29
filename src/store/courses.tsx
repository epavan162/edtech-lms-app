import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth';
import { notificationService } from '../services/notifications';

/**
 * Per-user course store.
 * Bookmarks and enrollments are scoped by user ID so each user
 * has their own independent data that persists across sessions.
 * Also handles global caching for course lists to support offline mode.
 */

function getUserKey(userId: string | undefined, suffix: string): string {
  const id = userId ?? 'anonymous';
  return `@atelier_${id}_${suffix}`;
}

interface CourseStoreContextType {
  bookmarks: number[];
  enrollments: number[];
  isBookmarked: (courseId: number) => boolean;
  isEnrolled: (courseId: number) => boolean;
  toggleBookmark: (courseId: number) => Promise<void>;
  enrollCourse: (courseId: number) => Promise<void>;
  bookmarkCount: number;
  cachedCourses: any[];
  cachedInstructors: any[];
  saveCoursesToCache: (courses: any[], instructors: any[]) => Promise<void>;
}

const CourseStoreContext = createContext<CourseStoreContextType | undefined>(
  undefined,
);

export function CourseStoreProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [enrollments, setEnrollments] = useState<number[]>([]);
  const [cachedCourses, setCachedCourses] = useState<any[]>([]);
  const [cachedInstructors, setCachedInstructors] = useState<any[]>([]);

  const userId = user?._id;

  // Load per-user data and global cache from AsyncStorage when user changes
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      // Clear personal state when logged out, but keep global cache
      setBookmarks([]);
      setEnrollments([]);
      return;
    }

    async function loadData() {
      try {
        const [savedBookmarks, savedEnrollments, savedCourses, savedInstructors] = await Promise.all([
          AsyncStorage.getItem(getUserKey(userId, 'bookmarks')),
          AsyncStorage.getItem(getUserKey(userId, 'enrollments')),
          AsyncStorage.getItem('@atelier_global_courses'),
          AsyncStorage.getItem('@atelier_global_instructors'),
        ]);

        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
        else setBookmarks([]);

        if (savedEnrollments) setEnrollments(JSON.parse(savedEnrollments));
        else setEnrollments([]);

        if (savedCourses) setCachedCourses(JSON.parse(savedCourses));
        if (savedInstructors) setCachedInstructors(JSON.parse(savedInstructors));
      } catch (err) {
        console.error('Failed to load course cache:', err);
      }
    }
    loadData();
  }, [userId, isAuthenticated]);

  const isBookmarked = useCallback(
    (courseId: number) => bookmarks.includes(courseId),
    [bookmarks],
  );

  const isEnrolled = useCallback(
    (courseId: number) => enrollments.includes(courseId),
    [enrollments],
  );

  const toggleBookmark = useCallback(
    async (courseId: number) => {
      const updated = bookmarks.includes(courseId)
        ? bookmarks.filter((id) => id !== courseId)
        : [...bookmarks, courseId];
      setBookmarks(updated);
      await AsyncStorage.setItem(
        getUserKey(userId, 'bookmarks'),
        JSON.stringify(updated),
      );
      
      // Trigger milestone notification if 5+ bookmarks
      if (updated.length >= 5) {
        notificationService.sendBookmarkMilestone(updated.length);
      }
    },
    [bookmarks, userId],
  );

  const enrollCourse = useCallback(
    async (courseId: number) => {
      if (enrollments.includes(courseId)) return;
      const updated = [...enrollments, courseId];
      setEnrollments(updated);
      await AsyncStorage.setItem(
        getUserKey(userId, 'enrollments'),
        JSON.stringify(updated),
      );
    },
    [enrollments, userId],
  );

  const saveCoursesToCache = useCallback(async (courses: any[], instructors: any[]) => {
    setCachedCourses(courses);
    setCachedInstructors(instructors);
    try {
      await Promise.all([
        AsyncStorage.setItem('@atelier_global_courses', JSON.stringify(courses)),
        AsyncStorage.setItem('@atelier_global_instructors', JSON.stringify(instructors)),
      ]);
    } catch {
      // Ignore cache persistence errors
    }
  }, []);

  return (
    <CourseStoreContext.Provider
      value={{
        bookmarks,
        enrollments,
        isBookmarked,
        isEnrolled,
        toggleBookmark,
        enrollCourse,
        bookmarkCount: bookmarks.length,
        cachedCourses,
        cachedInstructors,
        saveCoursesToCache,
      }}
    >
      {children}
    </CourseStoreContext.Provider>
  );
}

export function useCourseStore(): CourseStoreContextType {
  const context = useContext(CourseStoreContext);
  if (!context) {
    throw new Error('useCourseStore must be used within a CourseStoreProvider');
  }
  return context;
}
