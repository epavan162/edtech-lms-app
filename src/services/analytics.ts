/**
 * Analytics Service
 * Tracks screen views and events for analytics reporting.
 * In production, this would forward to Expo Analytics, PostHog, or Firebase.
 */
class AnalyticsService {
  private isEnabled = true;

  init() {
    this.logEvent('app_initialized');
  }

  logScreenView(screenName: string) {
    if (!this.isEnabled) return;
    // In production, forward to analytics provider
  }

  logEvent(eventName: string, params?: Record<string, any>) {
    if (!this.isEnabled) return;
    // In production, forward to analytics provider
  }

  trackUserLogin(userId: string) {
    this.logEvent('user_login', { userId });
  }

  trackCourseEnrollment(courseId: string, title: string) {
    this.logEvent('course_enrolled', { courseId, title });
  }

  trackCourseBookmark(courseId: string, title: string, isBookmarked: boolean) {
    this.logEvent(isBookmarked ? 'course_bookmarked' : 'course_unbookmarked', {
      courseId,
      title,
    });
  }
}

export const analytics = new AnalyticsService();
