import api from './api';
import type {
  CourseListResponse,
  CourseDetailResponse,
  InstructorListResponse,
} from '../types';

export const courseService = {
  getCourses: async (
    page = 1,
    limit = 10,
    query?: string,
  ): Promise<CourseListResponse> => {
    const params: Record<string, string | number> = { page, limit };
    if (query) params.query = query;
    const { data } = await api.get<CourseListResponse>(
      '/api/v1/public/randomproducts',
      { params },
    );
    return data;
  },

  getCourseById: async (id: number): Promise<CourseDetailResponse> => {
    const { data } = await api.get<CourseDetailResponse>(
      `/api/v1/public/randomproducts/${id}`,
    );
    return data;
  },

  getInstructors: async (
    page = 1,
    limit = 10,
  ): Promise<InstructorListResponse> => {
    const { data } = await api.get<InstructorListResponse>(
      '/api/v1/public/randomusers',
      { params: { page, limit } },
    );
    return data;
  },
};
