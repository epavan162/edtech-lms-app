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
    // We use fetch instead of axios here because axios has known issues with FormData
    // boundaries on React Native Android.
    const { storage } = require('../utils/storage');
    const token = await storage.getItem('accessToken');
    
    // @ts-ignore - FormData works correctly with fetch in RN
    const response = await fetch('https://api.freeapi.app/api/v1/users/avatar', {
      method: 'PATCH',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to update avatar');
    }

    const data = await response.json();
    return data;
  },
};
