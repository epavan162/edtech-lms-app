// ─── Auth Types ───
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: {
    url: string;
    localPath?: string;
    _id?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  statusCode: number;
  success: boolean;
}

export interface UserResponse {
  data: User;
  success: boolean;
}

export interface TokenRefreshResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
  success: boolean;
}

// ─── Course Types ───
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  category?: string;
  thumbnail: string;
  images: string[];
}

export interface CourseListResponse {
  data: {
    data: Course[];
    page: number;
    limit: number;
    totalPages: number;
    previousPage: boolean;
    nextPage: boolean;
    totalItems: number;
  };
  success: boolean;
}

export interface CourseDetailResponse {
  data: Course;
  success: boolean;
}

// ─── Instructor Types ───
export interface InstructorName {
  first: string;
  last: string;
}

export interface Instructor {
  id: number;
  name: InstructorName | string;
  email?: string;
  login?: {
    uuid: string;
    username: string;
  };
  picture?: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat?: string;
}

export interface InstructorListResponse {
  data: {
    data: Instructor[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  success: boolean;
}

// ─── App State Types ───
export interface BookmarkItem {
  courseId: number;
  addedAt: string;
}

export interface EnrollmentItem {
  courseId: number;
  enrolledAt: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CourseState {
  bookmarks: number[];
  enrollments: number[];
}

// ─── API Error ───
export interface ApiError {
  message: string;
  statusCode?: number;
  success: boolean;
}
