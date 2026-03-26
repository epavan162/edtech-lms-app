import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { storage } from '../utils/storage';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/auth';

// ─── State ───
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'INITIALIZED' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'INITIALIZED':
      return { ...state, isLoading: false, isInitialized: true };
    default:
      return state;
  }
}

// ─── Context ───
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper to extract tokens & user from FreeAPI response ───
function extractAuthData(responseData: any) {
  const payload = responseData?.data ?? responseData;
  const accessToken = payload?.accessToken;
  const refreshToken = payload?.refreshToken;
  const user = payload?.user;
  return { accessToken, refreshToken, user };
}

// ─── Provider ───
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto-login on app start
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const token = await storage.getItem('accessToken');
        if (!token) {
          dispatch({ type: 'INITIALIZED' });
          return;
        }
        const response = await authService.getCurrentUser();
        const rawData = response as any;
        const user = rawData?.data?.data ?? rawData?.data ?? rawData;
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch {
        await storage.deleteItem('accessToken').catch(() => {});
        await storage.deleteItem('refreshToken').catch(() => {});
        dispatch({ type: 'INITIALIZED' });
      }
    };
    tryAutoLogin();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(credentials);
      const { accessToken, refreshToken, user } = extractAuthData(response);

      if (!accessToken || !user) {
        throw new Error('Invalid login response: missing token or user data');
      }

      await storage.setItem('accessToken', accessToken);
      if (refreshToken) {
        await storage.setItem('refreshToken', refreshToken);
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.register(userData);
      // Registration successful — caller will navigate to login
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      await storage.deleteItem('accessToken').catch(() => {});
      await storage.deleteItem('refreshToken').catch(() => {});
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
