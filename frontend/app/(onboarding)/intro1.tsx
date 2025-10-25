import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Intro1Screen() {
  const handleNext = () => {
    router.push('/(onboarding)/intro2');
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      router.push('/(auth)/login' as any);
    } catch (error) {
      console.error('Error saving intro status:', error);
      router.push('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDE2]">
      {/* Skip Button */}
      <TouchableOpacity 
        className="absolute z-10 top-12 right-5 px-4 py-2 bg-white rounded-3xl shadow-md"
        onPress={handleSkip}
      >
        <Text className="text-base text-gray-500 font-medium">Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View className="flex-1">
        {/* Illustration Section - Top 65% */}
        <View className="flex-[0.65] relative items-center justify-center">
          {/* Background Rectangle */}
          <Image
            source={require('../../assets/images/Rectangle 1.png')}
            className="w-[420px] h-[420px] -mt-24"
            resizeMode="contain"
          />
          
          {/* Welcome Image Overlay - Centered and sized */}
          <View className="absolute inset-0 items-center justify-center">
            <Image
              source={require('../../assets/images/welcome 1.png')}
              className="w-150 h-100"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* White Bottom Rectangle - 35% */}
        <View className="flex-[0.35] bg-white rounded-t-3xl px-6 pt-6 pb-6 justify-between">
          {/* Text Content */}
          <View className="items-center flex-1 justify-center">
            <Text className="text-2xl font-bold text-black mb-3 text-center">
              Welcome To Quizzo!
            </Text>
            <Text className="text-sm text-gray-500 text-center leading-5 px-2">
              Compete with friends, earn points, and climb the leaderboard in this addictive trivia challenge.
            </Text>
          </View>

          {/* Bottom Navigation */}
          <View className="flex-row justify-between items-center mt-4">
            {/* Pagination Dots */}
            <View className="flex-row items-center space-x-2">
              <View className="w-8 h-2 bg-blue-600 rounded-full" />
              <View className="w-2 h-2 bg-gray-300 rounded-full" />
              <View className="w-2 h-2 bg-gray-300 rounded-full" />
            </View>

            {/* Next Button */}
            <TouchableOpacity onPress={handleNext}>
              <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg">
                <Text className="text-white text-2xl font-bold">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}