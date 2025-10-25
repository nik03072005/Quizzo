import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerificationScreen() {
  const { identifier, email, type } = useLocalSearchParams<{ identifier?: string; email?: string; type: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to 6 digits
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const { verifyOTP, resendOTP } = useAuth();

  // Use identifier if available, otherwise fall back to email for backward compatibility
  const currentIdentifier = identifier || email || '';

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const verified = await verifyOTP(currentIdentifier, otpCode);
      
      if (verified && type === 'forgot-password') {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { identifier: currentIdentifier, code: otpCode }
        });
      } else if (verified) {
        // Registration OTP verification
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      alert(error.message || 'Invalid OTP. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(currentIdentifier);
      alert('OTP sent successfully!');
      setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      alert(error.message || 'Failed to resend OTP');
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
        <Text className="text-[28px] font-bold text-[#1E1E1E] mb-3">OTP Verification</Text>
        <Text className="text-[15px] text-[#8391A1] leading-[22px] mb-[35px]">
          Enter the verification code we just sent on your email address or phone number.
        </Text>

        {/* OTP Input */}
        <View className="flex-row justify-between mb-[35px]">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              className={`w-[45px] h-[60px] text-xl font-bold text-[#1E1E1E] text-center rounded-lg ${
                digit 
                  ? 'bg-[#F0FFFE] border border-[#35C2C1]' 
                  : 'bg-[#F7F8F9] border border-[#E8ECF4]'
              }`}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className={`rounded-lg py-4 items-center mb-[35px] ${isLoading ? 'bg-gray-300' : 'bg-[#5548E8]'}`}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text className="text-white text-[15px] font-semibold">
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        {/* Resend Code */}
        <View className="flex-row justify-center items-center">
          <Text className="text-[#1E1E1E] text-sm">Didn&apos;t received code? </Text>
          <TouchableOpacity onPress={handleResendOTP}>
            <Text className="text-[#35C2C1] text-sm font-bold">Resend</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

