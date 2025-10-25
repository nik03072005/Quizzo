import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  displayName?: string;
  schoolId: string;
  photoURL?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  sendRegistrationOTP: (phoneNumber: string) => Promise<void>;
  register: (phoneNumber: string, otp: string, password: string, name: string, email?: string, schoolId?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (identifier: string) => Promise<void>;
  resetPassword: (identifier: string, otp: string, newPassword: string) => Promise<void>;
  verifyOTP: (identifier: string, otp: string) => Promise<boolean>;
  resendOTP: (identifier: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // Basic token validation - check if it's expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      if (!storedRefreshToken) return false;

      const response = await authService.refreshToken(storedRefreshToken);
      
      // Store new tokens
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const checkStoredAuth = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (storedUser && storedAccessToken && storedRefreshToken) {
        // Check if access token is valid or needs refresh
        const isTokenValid = await validateToken(storedAccessToken);
        
        if (isTokenValid) {
          setUser(JSON.parse(storedUser));
        } else {
          // Try to refresh the token
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            setUser(JSON.parse(storedUser));
          } else {
            // Clear invalid tokens
            await clearAuthData();
          }
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for stored user session
    checkStoredAuth();
  }, [checkStoredAuth]);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ identifier, password });
      setUser(response.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendRegistrationOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      await authService.sendRegistrationOTP(phoneNumber);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (phoneNumber: string, otp: string, password: string, name: string, email?: string, schoolId?: string) => {
    setIsLoading(true);
    try {
      // Register and auto-login
      const response = await authService.register({ 
        phoneNumber, 
        otp, 
        password, 
        confirmPassword: password,
        name, 
        email,
        schoolId: schoolId || ''
      });
      setUser(response.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const forgotPassword = async (identifier: string) => {
    try {
      await authService.forgotPassword(identifier);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset code. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (identifier: string, otp: string, newPassword: string) => {
    try {
      await authService.resetPassword(identifier, otp, newPassword);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const verifyOTP = async (identifier: string, otp: string): Promise<boolean> => {
    try {
      const response = await authService.verifyOTP(identifier, otp);
      return response.verified;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const resendOTP = async (identifier: string) => {
    try {
      await authService.resendOTP(identifier);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        sendRegistrationOTP,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyOTP,
        resendOTP,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};