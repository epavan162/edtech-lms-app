import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { storage } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.freeapi.app';
const TIMEOUT = 15000;
const MAX_RETRIES = 2;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach Auth Token ───
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore not available (web), continue without token
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor: Handle 401 + Retry ───
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Handle 401 — Token Refresh (only for non-login requests)
    const isLoginRequest = originalRequest.url?.includes('/users/login');
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/v1/users/refresh-token`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        await storage.setItem('accessToken', newAccessToken);
        await storage.setItem('refreshToken', newRefreshToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // Clear tokens on refresh failure
        await storage.deleteItem('accessToken').catch(() => {});
        await storage.deleteItem('refreshToken').catch(() => {});
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Generic retry for network/server errors (not 4xx)
    if (
      !error.response ||
      (error.response.status >= 500 && !originalRequest._retry)
    ) {
      const retryCount = originalRequest._retryCount ?? 0;
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
export { BASE_URL };
