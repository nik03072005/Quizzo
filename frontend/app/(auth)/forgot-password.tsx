import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { normalizePhoneNumber } from '@/utils/phoneUtils';

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleForgotPassword = async () => {
    if (!identifier) {
      alert('Please enter your email address or phone number');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedIdentifier = normalizePhoneNumber(identifier);
      await forgotPassword(normalizedIdentifier);
      // Navigate to OTP verification screen
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { identifier: normalizedIdentifier, type: 'forgot-password' }
      });
    } catch (error: any) {
      alert(error.message || 'Failed to send reset code. Please try again.');
      console.error('Forgot password error:', error);
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
        <Text className="text-[28px] font-bold text-[#1E1E1E] mb-3">Forgot Password?</Text>
        <Text className="text-[15px] text-[#8391A1] leading-[22px] mb-[35px]">
          Don&apos;t worry! it occurs. Please enter the email address linked with your account.
        </Text>

        {/* Email/Phone Input */}
        <View className="mb-6">
          <TextInput
            className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-[18px] py-4 text-[15px] text-[#1E1E1E]"
            placeholder="Enter your email or phone no."
            placeholderTextColor="#8391A1"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        {/* Send Code Button */}
        <TouchableOpacity
          className={`rounded-lg py-4 items-center mb-[35px] ${isLoading ? 'bg-gray-300' : 'bg-[#5548E8]'}`}
          onPress={handleForgotPassword}
          disabled={isLoading}
        >
          <Text className="text-white text-[15px] font-semibold">
            {isLoading ? 'Sending...' : 'Send Code'}
          </Text>
        </TouchableOpacity>

        {/* Remember Password */}
        <View className="flex-row justify-center items-center">
          <Text className="text-[#1E1E1E] text-sm">Remember Password? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-[#35C2C1] text-sm font-bold">Login Now</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

