import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    displayName: string;
    schoolId: string;
    photoURL?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
  };
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  phoneNumber: string;
  otp: string;
  password: string;
  confirmPassword: string;
  name: string;
  email?: string;
  schoolId: string;
}

interface LoginData {
  identifier: string; // can be email or phone
  password: string;
}

export const authService = {
  // Send registration OTP
  sendRegistrationOTP: async (phoneNumber: string): Promise<void> => {
    await apiClient.post('/auth/send-registration-otp', { phoneNumber });
  },

  // Register new user with OTP verification
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.accessToken && response.data.refreshToken) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.accessToken && response.data.refreshToken) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  // Forgot password - Request OTP
  forgotPassword: async (identifier: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { identifier });
  },

  // Verify OTP
  verifyOTP: async (identifier: string, otp: string): Promise<{ verified: boolean }> => {
    const response = await apiClient.post('/auth/verify-otp', { identifier, otp });
    return response.data;
  },

  // Reset password
  resetPassword: async (identifier: string, otp: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { identifier, otp, newPassword });
  },

  // Resend OTP
  resendOTP: async (identifier: string): Promise<void> => {
    await apiClient.post('/auth/resend-otp', { identifier });
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Social login (Google/Facebook)
  socialLogin: async (provider: 'google' | 'facebook', token: string): Promise<LoginResponse> => {
    const response = await apiClient.post(`/auth/${provider}`, { token });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};