import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Intro3Screen() {
  const handleNext = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      router.push('/(auth)/login');
    } catch (error) {
      console.error('Error saving intro status:', error);
      router.push('/(auth)/login');
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      router.push('/(auth)/login');
    } catch (error) {
      console.error('Error saving intro status:', error);
      router.push('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDE2]">
      {/* Skip Button */}
      <TouchableOpacity 
        className="absolute top-12 right-5 z-10 px-4 py-2 bg-white rounded-3xl shadow-md"
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
            source={require('../../assets/images/Rectangle 3.png')}
            className="w-[420px] h-[420px] -mt-40"
            resizeMode="contain"
          />
          
          {/* Main Image Overlay - Positioned at right */}
          <View className="absolute inset-0 justify-end items-end mb-[-80px] mr-[-40px]">
            <Image
              source={require('../../assets/images/Group 3.png')}
              className="w-96 h-96"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* White Bottom Rectangle - 35% */}
        <View className="flex-[0.35] bg-white rounded-t-3xl px-6 pt-6 pb-6 justify-between">
          {/* Text Content */}
          <View className="items-center flex-1 justify-center">
            <Text className="text-2xl font-bold text-black mb-3 text-center">
              Test Your Knowledge With Quizzo
            </Text>
            <Text className="text-sm text-gray-500 text-center leading-5 px-2">
              Quizzo is the perfect app to challenge yourself and your friends, with endless trivia fun at your fingertips.
            </Text>
          </View>

          {/* Bottom Navigation */}
          <View className="flex-row justify-between items-center mt-4">
            {/* Pagination Dots */}
            <View className="flex-row items-center space-x-2">
              <View className="w-2 h-2 bg-gray-300 rounded-full" />
              <View className="w-2 h-2 bg-gray-300 rounded-full" />
              <View className="w-8 h-2 bg-blue-600 rounded-full" />
            </View>

            {/* Get Started Button */}
            <TouchableOpacity onPress={handleNext}>
              <View className="px-6 py-3 bg-blue-600 rounded-full shadow-lg">
                <Text className="text-white text-base font-bold">Get Started</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}