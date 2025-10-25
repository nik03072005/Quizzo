import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const { identifier, email, code } = useLocalSearchParams<{ identifier?: string; email?: string; code: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  // Use identifier if available, otherwise fall back to email for backward compatibility
  const currentIdentifier = identifier || email || '';

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(currentIdentifier, code, password);
      // Show success message and navigate to login
      alert('Password changed successfully!');
      router.replace('/(auth)/login');
    } catch (error: any) {
      alert(error.message || 'Failed to reset password. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5ede2]" edges={['top']}>
      <ScrollView className="flex-grow pb-5" showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity className="ml-5 mt-2.5 w-10 h-10 bg-white rounded-full items-center justify-center" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>

        {/* Content */}
        <View className="px-7">
        <Text className="text-[28px] font-bold text-[#1E1E1E] mb-3">Create New Password</Text>
        <Text className="text-[15px] text-[#8391A1] leading-[22px] mb-[35px]">
          Your new password must be unique from those previously used.
        </Text>

          {/* Password Input */}
          <View className="relative mb-4">
            <TextInput
              className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-[18px] py-4 text-[15px] text-[#1E1E1E] pr-16"
              placeholder="New Password"
              placeholderTextColor="#8391A1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-[18px] top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={22} 
                color="#8391A1" 
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View className="relative mb-4">
            <TextInput
              className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-[18px] py-4 text-[15px] text-[#1E1E1E] pr-16"
              placeholder="Confirm Password"
              placeholderTextColor="#8391A1"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              className="absolute right-[18px] top-4"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={22} 
                color="#8391A1" 
              />
            </TouchableOpacity>
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            className={`rounded-lg py-4 items-center mt-5 ${isLoading ? 'bg-gray-300' : 'bg-[#5548E8]'}`}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text className="text-white text-[15px] font-semibold">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

