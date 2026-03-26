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

/**
 * Per-user course store.
 * Bookmarks and enrollments are scoped by user ID so each user
 * has their own independent data that persists across sessions.
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
}

const CourseStoreContext = createContext<CourseStoreContextType | undefined>(
  undefined,
);

export function CourseStoreProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [enrollments, setEnrollments] = useState<number[]>([]);

  const userId = user?._id;

  // Load per-user data from AsyncStorage when user changes
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      // Clear state when logged out
      setBookmarks([]);
      setEnrollments([]);
      return;
    }

    const loadData = async () => {
      try {
        const [savedBookmarks, savedEnrollments] = await Promise.all([
          AsyncStorage.getItem(getUserKey(userId, 'bookmarks')),
          AsyncStorage.getItem(getUserKey(userId, 'enrollments')),
        ]);
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
        else setBookmarks([]);
        if (savedEnrollments) setEnrollments(JSON.parse(savedEnrollments));
        else setEnrollments([]);
      } catch {
        setBookmarks([]);
        setEnrollments([]);
      }
    };
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
