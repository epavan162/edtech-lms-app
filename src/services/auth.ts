import api from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
  TokenRefreshResponse,
} from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/v1/users/login', credentials);
    return data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/v1/users/register', userData);
    return data;
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>('/api/v1/users/current-user');
    return data;
  },

  refreshToken: async (): Promise<TokenRefreshResponse> => {
    const { data } = await api.post<TokenRefreshResponse>('/api/v1/users/refresh-token');
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/users/logout');
  },

  updateAvatar: async (formData: FormData): Promise<UserResponse> => {
    const { data } = await api.patch<UserResponse>('/api/v1/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
