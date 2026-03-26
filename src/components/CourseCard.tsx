import React, { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Bookmark, BookmarkCheck, Star } from 'lucide-react-native';
import { Colors } from '../theme';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { getCourseImageUrl } from '../utils/images';
import type { Course, Instructor } from '../types';

interface CourseCardProps {
  course: Course;
  instructor?: Instructor;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmark: () => void;
}

function getInstructorName(instructor?: Instructor): string {
  if (!instructor) return 'Unknown Instructor';
  if (typeof instructor.name === 'string') return instructor.name;
  return `${instructor.name.first} ${instructor.name.last}`;
}

function getInstructorAvatar(instructor?: Instructor): string | undefined {
  return instructor?.picture?.medium;
}

export const CourseCard = memo(function CourseCard({
  course,
  instructor,
  isBookmarked,
  onPress,
  onBookmark,
}: CourseCardProps) {
  const handleBookmark = useCallback(
    (e: { stopPropagation?: () => void }) => {
      onBookmark();
    },
    [onBookmark],
  );

  const imageUrl = getCourseImageUrl(course.id, course.category, course.thumbnail);

  return (
    <Pressable onPress={onPress}>
      <Card>
        {/* Thumbnail */}
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: 180 }}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        <View style={{ padding: 16, gap: 10 }}>
          {/* Instructor Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {getInstructorAvatar(instructor) && (
              <Image
                source={{ uri: getInstructorAvatar(instructor) }}
                style={{ width: 24, height: 24, borderRadius: 12 }}
                contentFit="cover"
              />
            )}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: Colors.onSurfaceVariant,
                letterSpacing: 0.36,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {getInstructorName(instructor)}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 16,
              lineHeight: 22,
              color: Colors.onSurface,
            }}
            numberOfLines={2}
          >
            {course.title}
          </Text>

          {/* Description */}
          {course.description && (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 18,
                color: Colors.onSurfaceVariant,
              }}
              numberOfLines={2}
            >
              {course.description}
            </Text>
          )}

          {/* Bottom Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {/* Price */}
              <Text
                style={{
                  fontFamily: 'Manrope_700Bold',
                  fontSize: 18,
                  color: Colors.primary,
                }}
              >
                ${course.price}
              </Text>

              {/* Rating */}
              {course.rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Star
                    size={14}
                    color={Colors.tertiaryFixedDim}
                    fill={Colors.tertiaryFixedDim}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 12,
                      color: Colors.onSurfaceVariant,
                    }}
                  >
                    {course.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Bookmark */}
            <Pressable
              onPress={handleBookmark}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isBookmarked
                  ? Colors.primaryFixed
                  : Colors.surfaceContainerHigh,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck size={18} color={Colors.primary} strokeWidth={1.5} />
              ) : (
                <Bookmark size={18} color={Colors.onSurfaceVariant} strokeWidth={1.5} />
              )}
            </Pressable>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});
