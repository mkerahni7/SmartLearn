import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

/**
 * AuthContext - React Context for global authentication state management
 * Provides user authentication, login, registration, and token management
 * Auto-verifies JWT token on app load and persists session in localStorage
 */

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

/**
 * Reducer function for authentication state management
 * Handles state transitions for login, logout, registration, and errors
 * @param {Object} state - Current authentication state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New authentication state
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case 'AUTH_INIT':
      return {
        ...state,
        isLoading: false,
        error: null
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

/**
 * AuthProvider - React Context Provider component
 * Wraps the application and provides authentication state and methods
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider with auth state and methods
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Effect hook: Initializes auth state on app load
   * Users must manually login - no automatic session restoration
   */
  useEffect(() => {
    // Clear any existing token to ensure fresh start
    const token = localStorage.getItem('token');
    if (token) {
      // Remove token to prevent auto-login
      localStorage.removeItem('token');
    }
    // Initialize auth state as not authenticated
    dispatch({ type: 'AUTH_INIT' });
  }, []);

  /**
   * Login function - Authenticates user and stores JWT token
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email address
   * @param {string} credentials.password - User's password
   * @returns {Object} Result object with success status and optional error message
   */
  const login = React.useCallback(async (credentials) => {
    try {
      console.log('🔐 Starting login process...', credentials);
      dispatch({ type: 'AUTH_START' });
      
      console.log('📡 Sending login request to backend...');
      const response = await authService.login(credentials);
      console.log('✅ Login response received:', response);
      
      // Handle new response format: { success, message, data: { user, token } }
      const { user, token } = response.data.data || response.data;
      console.log('👤 User data:', user);
      console.log('🔑 Token received:', token ? 'Yes' : 'No');
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      console.log('🎉 Login successful!');
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Register function - Creates new user account and auto-logs in
   * @param {Object} userData - Registration data
   * @param {string} userData.username - Unique username
   * @param {string} userData.email - Valid email address
   * @param {string} userData.password - Password (min 6 characters)
   * @returns {Object} Result object with success status and autoLogin flag
   */
  const register = React.useCallback(async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Remove confirmPassword before sending to backend (not part of RegisterDTO)
      const { confirmPassword, ...registrationData } = userData;
      const response = await authService.register(registrationData);
      const { user, token } = response.data?.data || response.data || {};

      if (!token) {
        throw new Error('Registration succeeded but token is missing.');
      }

      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });

      toast.success('Welcome to SmartLearn! Your account is ready.');
      return { success: true, autoLogin: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle NestJS validation errors
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        const errorData = error.response.data;
        // NestJS validation errors come in errorData.message array
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = React.useCallback((userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  }, []);

  const clearError = React.useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
