'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { login as apiLogin, getCurrentUser } from '@/lib/api';

// Admin user interface
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

// Auth state interface
interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AdminUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CHECK_AUTH_START' }
  | { type: 'CHECK_AUTH_SUCCESS'; payload: AdminUser }
  | { type: 'CHECK_AUTH_FAILURE' }
  | { type: 'CLEAR_ERROR' };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };

    case 'CHECK_AUTH_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'CHECK_AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'CHECK_AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('admin-auth', JSON.stringify({
        user: state.user,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem('admin-auth');
    }
  }, [state.user]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Call backend API for authentication
      const response = await apiLogin(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Map user data to AdminUser interface
        const adminUser: AdminUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role === 'admin' || user.role === 'super_admin' ? user.role : 'admin',
          permissions: user.role === 'super_admin' 
            ? ['products', 'orders', 'categories', 'settings', 'users', 'analytics', 'reports']
            : ['products', 'orders', 'categories', 'settings']
        };
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: adminUser });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Invalid email or password' });
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please check your connection and try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('admin-auth');
    localStorage.removeItem('authToken');
  };

  // Check authentication from localStorage and verify with backend
  const checkAuth = async (): Promise<void> => {
    dispatch({ type: 'CHECK_AUTH_START' });

    try {
      const token = localStorage.getItem('authToken');
      const authData = localStorage.getItem('admin-auth');
      
      if (token && authData) {
        const { user, timestamp } = JSON.parse(authData);
        
        // Check if token is expired (24 hours)
        const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired && user) {
          // Optionally verify token with backend
          try {
            const currentUser = await getCurrentUser();
            if (currentUser.success && currentUser.data) {
              const adminUser: AdminUser = {
                id: currentUser.data.user.id,
                email: currentUser.data.user.email,
                name: currentUser.data.user.name,
                role: currentUser.data.user.role === 'admin' || currentUser.data.user.role === 'super_admin' ? currentUser.data.user.role : 'admin',
                permissions: currentUser.data.user.role === 'super_admin' 
                  ? ['products', 'orders', 'categories', 'settings', 'users', 'analytics', 'reports']
                  : ['products', 'orders', 'categories', 'settings']
              };
              dispatch({ type: 'CHECK_AUTH_SUCCESS', payload: adminUser });
              return;
            }
          } catch (verifyError) {
            console.warn('Token verification failed:', verifyError);
            // If verification fails, still use cached user if not expired
            dispatch({ type: 'CHECK_AUTH_SUCCESS', payload: user });
            return;
          }
        }
      }
      
      // Clear invalid auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin-auth');
      dispatch({ type: 'CHECK_AUTH_FAILURE' });
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin-auth');
      dispatch({ type: 'CHECK_AUTH_FAILURE' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}