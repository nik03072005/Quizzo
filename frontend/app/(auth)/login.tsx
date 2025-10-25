import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { normalizePhoneNumber } from '@/utils/phoneUtils';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedIdentifier = normalizePhoneNumber(identifier);
      await login(normalizedIdentifier, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      alert(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5ede2]" edges={['top']}>
      <ScrollView className="flex-grow pb-5" showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity 
          className="ml-5 mt-2.5 w-10 h-10 bg-white rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>

        {/* Header */}
        <View className="px-7 pt-7 pb-12">
          <Text className="text-3xl font-bold text-gray-900 leading-9">
            Welcome Back! Glad{'\n'}To See You, Again!
          </Text>
        </View>

        {/* Form */}
        <View className="px-7 pb-10">
          {/* Email/Phone Input */}
          <View className="relative mb-4">
            <TextInput
              className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-4 py-4 text-base text-gray-900"
              placeholder="Enter your email or phone no."
              placeholderTextColor="#8391A1"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="relative mb-4">
            <TextInput
              className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-4 py-4 text-base text-gray-900 pr-12"
              placeholder="Enter your password"
              placeholderTextColor="#8391A1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={22} 
                color="#8391A1" 
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="self-end mb-7 mt-1"
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text className="text-gray-900 text-sm font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className={`bg-[#5548E8] rounded-lg py-4 items-center mb-9 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Or Login with */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-[#E8E8E8]" />
            <Text className="mx-4 text-gray-500 text-sm">Or Login with</Text>
            <View className="flex-1 h-px bg-[#E8E8E8]" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row justify-evenly mb-25 px-5">
            <TouchableOpacity className="bg-white border border-[#E8E8E8] rounded-lg flex-1 mx-2 h-14 items-center justify-center">
              <FontAwesome name="facebook-f" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-[#E8E8E8] rounded-lg flex-1 mx-2 h-14 items-center justify-center">
              <AntDesign name="google" size={20} color="#DB4437" />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center items-center mt-20">
            <Text className="text-gray-900 text-sm">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-[#35C2C1] text-sm font-bold">Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}