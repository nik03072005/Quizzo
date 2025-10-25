import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const [isCheckingIntro, setIsCheckingIntro] = useState(true);

  useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
        
        if (!hasSeenIntro) {
          // User hasn't seen intro, show onboarding
          router.replace('/(onboarding)/intro1');
        } else if (!isLoading) {
          // User has seen intro, proceed with normal flow
          if (user) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/login');
          }
        }
      } catch (error) {
        console.error('Error checking intro status:', error);
        // Fallback to showing intro
        router.replace('/(onboarding)/intro1');
      } finally {
        setIsCheckingIntro(false);
      }
    };

    checkIntroStatus();
  }, [user, isLoading]);

  if (isLoading || isCheckingIntro) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1E232C" />
      </View>
    );
  }

  return null;
}