import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { File, Paths, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Star,
  Play,
  Lock,
  Video,
  FileText,
  Award,
  Infinity,
  Share2,
  Quote,
  Download,
} from 'lucide-react-native';
import { courseService } from '../../src/services/courses';
import { useCourseStore } from '../../src/store/courses';
import { notificationService } from '../../src/services/notifications';
import { useToast } from '../../src/components/ui/Toast';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { getCourseImageUrl, getCourseThumbnailUrl } from '../../src/utils/images';
import { Colors } from '../../src/theme';
import { analytics } from '../../src/services/analytics';
import type { Course } from '../../src/types';

const curriculum = [
  { title: 'Foundations of Intentional Design', duration: '12:45', preview: true },
  { title: 'The Psychology of White Space', duration: '45:20', preview: false },
  { title: 'Mastering Tonal Layering', duration: '32:15', preview: false },
  { title: 'Advanced Color Theory', duration: '28:00', preview: false },
];

const reviews = [
  'This course completely changed how I approach my workflows. Everything feels more purposeful now.',
  'The module on typography alone is worth the price of the entire course. Highly recommended for senior designers.',
];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isBookmarked, toggleBookmark, isEnrolled, enrollCourse, bookmarkCount } =
    useCourseStore();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const courseId = parseInt(id ?? '0', 10);
  const bookmarked = isBookmarked(courseId);
  const enrolled = isEnrolled(courseId);

  const enrollScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    analytics.logScreenView(`CourseDetail_${courseId}`);
    const fetchCourse = async () => {
      try {
        const res = await courseService.getCourseById(courseId);
        setCourse(res.data);
      } catch {
        showToast('Failed to load course details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleBookmark = useCallback(async () => {
    await toggleBookmark(courseId);
    const newCount = bookmarked ? bookmarkCount - 1 : bookmarkCount + 1;
    analytics.trackCourseBookmark(courseId.toString(), course?.title || 'Unknown', !bookmarked);
    showToast(
      bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks ✓',
      bookmarked ? 'info' : 'success',
    );
    notificationService.sendBookmarkMilestone(newCount);
  }, [toggleBookmark, courseId, bookmarked, bookmarkCount, showToast, course]);

  const handleEnroll = useCallback(async () => {
    setEnrolling(true);
    Animated.spring(enrollScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start();
    await enrollCourse(courseId);
    analytics.trackCourseEnrollment(courseId.toString(), course?.title || 'Unknown');
    Animated.spring(enrollScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    setEnrolling(false);
    showToast('Enrolled successfully! Start learning now.', 'success');
  }, [enrollCourse, courseId, enrollScale, showToast, course]);

  const handleDownloadSyllabus = async () => {
    try {
      showToast('Downloading course material...', 'info');

      const thumbnailUrl = getCourseThumbnailUrl(courseId, course?.category, course?.images?.[0] || course?.thumbnail);

      if (Platform.OS === 'web') {
        // Web: use fetch + blob download
        const response = await fetch(thumbnailUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `course-material-${courseId}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Download complete!', 'success');
      } else {
        // Native: use expo-file-system
        const destination = new Directory(Paths.cache, 'downloads');
        if (!destination.exists) {
          destination.create();
        }
        const destFile = new File(destination, `course-material-${courseId}.jpg`);
        const downloadedFile = await File.downloadFileAsync(thumbnailUrl, destFile);
        showToast('Download complete!', 'success');

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadedFile.uri);
        }
      }
    } catch (error: any) {
      showToast('Failed to download course material', 'error');
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!course) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLow }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: getCourseImageUrl(course.id, course.category, course.images?.[0] || course.thumbnail) }}
            style={{ width: '100%', height: 280 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />

          {/* Nav Buttons */}
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color={Colors.onSurface} strokeWidth={1.5} />
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={handleBookmark}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: bookmarked
                    ? Colors.primaryFixed
                    : 'rgba(255,255,255,0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {bookmarked ? (
                  <BookmarkCheck size={20} color={Colors.primary} strokeWidth={1.5} />
                ) : (
                  <Bookmark size={20} color={Colors.onSurface} strokeWidth={1.5} />
                )}
              </Pressable>
              <Pressable
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={20} color={Colors.onSurface} strokeWidth={1.5} />
              </Pressable>
              <Pressable
                onPress={handleDownloadSyllabus}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Download size={20} color={Colors.onSurface} strokeWidth={1.5} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Content */}
        <View
          style={{
            backgroundColor: Colors.surfaceContainerLow,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -24,
            paddingTop: 28,
            paddingHorizontal: 24,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontFamily: 'Manrope_700Bold',
              fontSize: 24,
              lineHeight: 32,
              color: Colors.onSurface,
              letterSpacing: -0.16,
              marginBottom: 8,
            }}
          >
            {course.title}
          </Text>

          {/* Rating & Price */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16,
            }}
          >
            {course.rating && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Star
                  size={16}
                  color={Colors.tertiaryFixedDim}
                  fill={Colors.tertiaryFixedDim}
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: Colors.onSurface,
                  }}
                >
                  {course.rating.toFixed(1)}
                </Text>
              </View>
            )}
            <Text
              style={{
                fontFamily: 'Manrope_700Bold',
                fontSize: 22,
                color: Colors.primary,
              }}
            >
              ${course.price}
            </Text>
          </View>

          {/* Instructor */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 12,
                letterSpacing: 0.36,
                color: Colors.onSurfaceVariant,
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              Instructor
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 16,
                color: Colors.onSurface,
              }}
            >
              Elena Rodriguez
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: Colors.onSurfaceVariant,
              }}
            >
              Design Lead at Linear Systems
            </Text>
          </View>

          {/* Description */}
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 22,
              color: Colors.onSurfaceVariant,
              marginBottom: 24,
            }}
          >
            {course.description ||
              'Elevate your practice beyond the basics. This course dives deep into advanced techniques, teaching you how to curate experiences that feel intentional, premium, and human-centric.'}
          </Text>

          {/* Includes */}
          <View style={{ marginBottom: 28 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: Colors.onSurface,
                marginBottom: 12,
              }}
            >
              Includes:
            </Text>
            <View style={{ gap: 10 }}>
              {[
                { icon: Video, text: '24 Full HD Video Lessons' },
                { icon: FileText, text: '12 Resource Templates' },
                { icon: Award, text: 'Certificate of Completion' },
                { icon: Infinity, text: 'Lifetime Access' },
              ].map((item) => (
                <View
                  key={item.text}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <item.icon
                    size={18}
                    color={Colors.primary}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      color: Colors.onSurface,
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Curriculum */}
          <Text
            style={{
              fontFamily: 'Manrope_600SemiBold',
              fontSize: 18,
              color: Colors.onSurface,
              marginBottom: 16,
            }}
          >
            Curriculum
          </Text>
          <View style={{ gap: 12, marginBottom: 28 }}>
            {curriculum.map((lesson, i) => (
              <Card key={i}>
                <Pressable
                  onPress={() => {
                    if (enrolled) {
                      router.push({
                        pathname: '/webview',
                        params: {
                          title: course.title,
                          description: course.description || '',
                        },
                      });
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: lesson.preview
                        ? Colors.primaryFixed
                        : Colors.surfaceContainerHigh,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {lesson.preview ? (
                      <Play size={16} color={Colors.primary} strokeWidth={2} />
                    ) : (
                      <Lock size={16} color={Colors.outline} strokeWidth={1.5} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: Colors.onSurface,
                      }}
                      numberOfLines={1}
                    >
                      {lesson.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: Colors.onSurfaceVariant,
                        marginTop: 2,
                      }}
                    >
                      {lesson.duration} · {lesson.preview ? 'Preview available' : 'Locked'}
                    </Text>
                  </View>
                </Pressable>
              </Card>
            ))}
          </View>

          {/* Reviews */}
          <Text
            style={{
              fontFamily: 'Manrope_600SemiBold',
              fontSize: 18,
              color: Colors.onSurface,
              marginBottom: 16,
            }}
          >
            Student Perspectives
          </Text>
          <View style={{ gap: 12, marginBottom: 32 }}>
            {reviews.map((review, i) => (
              <Card key={i}>
                <View style={{ padding: 20 }}>
                  <Quote
                    size={18}
                    color={Colors.primaryFixedDim}
                    strokeWidth={1.5}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      lineHeight: 22,
                      color: Colors.onSurfaceVariant,
                      fontStyle: 'italic',
                    }}
                  >
                    "{review}"
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopWidth: 0,
          shadowColor: Colors.onSurface,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Animated.View style={{ transform: [{ scale: enrollScale }] }}>
          <Button
            title={enrolled ? 'Continue Learning' : 'Enroll Now'}
            onPress={
              enrolled
                ? () =>
                    router.push({
                      pathname: '/webview',
                      params: {
                        title: course.title,
                        description: course.description || '',
                      },
                    })
                : handleEnroll
            }
            loading={enrolling}
            fullWidth
            icon={
              enrolled ? (
                <Play size={16} color={Colors.onPrimary} strokeWidth={2} />
              ) : undefined
            }
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
