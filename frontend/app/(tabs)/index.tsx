import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';

// Interfaces
interface Quiz {
  id: string;
  title: string;
  quizCount: number;
  peopleJoined: number;
}

interface FeaturedQuiz {
  id: string;
  title: string;
  category: string;
  duration: string;
  quizCount: number;
  sharedBy: { name: string };
}

// Featured Quiz Card - Matching reference image with gradient background
const FeaturedQuizCard = ({ quiz, onPress }: { quiz: FeaturedQuiz; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="mx-4 rounded-3xl overflow-hidden mb-6"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    }}
  >
    {/* Red gradient header */}
    <View 
      className="h-16 rounded-t-3xl"
      style={{ backgroundColor: '#EF4444' }}
    />
    
    {/* Gray content area */}
    <View className="bg-gray-700 p-5 rounded-b-3xl">
      {/* Top Row with badges and bookmark */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-2">
          <View className="bg-white rounded-full px-3 py-1.5">
            <Text className="text-red-600 text-xs font-bold">{quiz.category}</Text>
          </View>
          <View className="bg-gray-600 rounded-full px-3 py-1.5">
            <Text className="text-white text-xs font-semibold">{quiz.duration}</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <Text className="text-white text-2xl font-bold mb-1.5">{quiz.title}</Text>
      <Text className="text-gray-300 text-sm mb-5">{quiz.quizCount} Quizzes</Text>

      {/* Bottom Row with author and CTA */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-400 text-xs font-medium mb-0.5">Shared By</Text>
            <Text className="text-white text-sm font-bold" numberOfLines={1}>{quiz.sharedBy.name}</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-blue-600 rounded-2xl px-6 py-2.5 ml-3"
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-white font-bold text-sm">Start Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// Your Quiz Card - Matching reference image style
const YourQuizCard = ({ quiz, onPress }: { quiz: Quiz; onPress: () => void }) => {
  // Dynamic icon and color based on quiz title
  const getQuizIcon = (title: string) => {
    if (title.toLowerCase().includes('integer') || title.toLowerCase().includes('math')) {
      return { icon: 'calculator-outline', color: '#8B5CF6', bg: '#EDE9FE' };
    }
    if (title.toLowerCase().includes('general') || title.toLowerCase().includes('knowledge')) {
      return { icon: 'book-outline', color: '#EC4899', bg: '#FCE7F3' };
    }
    return { icon: 'school-outline', color: '#3B82F6', bg: '#DBEAFE' };
  };

  const iconData = getQuizIcon(quiz.title);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mr-3 w-80"
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Header Row */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: iconData.bg }}
          >
            <Ionicons name={iconData.icon as any} size={24} color={iconData.color} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>
              {quiz.title}
            </Text>
            <Text className="text-gray-500 text-sm">{quiz.quizCount} Quizzes</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="rounded-xl px-3.5 py-2"
          style={{ backgroundColor: iconData.bg }}
        >
          <View className="flex-row items-center">
            <Ionicons name="bar-chart" size={14} color={iconData.color} />
            <Text className="text-sm font-bold ml-1.5" style={{ color: iconData.color }}>
              Result
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Participants Row */}
      <View className="flex-row items-center">
        <View className="flex-row mr-2">
          <View className="w-6 h-6 rounded-full border-2 border-white -mr-1.5" style={{ backgroundColor: '#F59E0B' }} />
          <View className="w-6 h-6 rounded-full border-2 border-white -mr-1.5" style={{ backgroundColor: '#10B981' }} />
          <View className="w-6 h-6 rounded-full border-2 border-white" style={{ backgroundColor: '#3B82F6' }} />
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          +{quiz.peopleJoined} People join
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Main Component
export default function HomeScreen() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [featuredQuizData, setFeaturedQuizData] = useState<FeaturedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ GOOD MORNING';
    if (hour < 18) return '🌤️ GOOD AFTERNOON';
    return '🌙 GOOD EVENING';
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));

    setFeaturedQuizData({
      id: '1',
      title: 'Saturday night Quiz',
      category: 'General Knowledge',
      duration: '2min',
      quizCount: 13,
      sharedBy: { name: 'Brandon Matrovs' },
    });

    setQuizzes([
      { id: '1', title: 'Integers Quiz', quizCount: 10, peopleJoined: 437 },
      { id: '2', title: 'General Knowledge', quizCount: 6, peopleJoined: 437 },
    ]);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#f5ede2' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4 font-medium">Loading your quizzes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']} style={{ backgroundColor: '#f5ede2' }}>
      {/* Enhanced Header with better contrast */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4" style={{ backgroundColor: '#f5ede2' }}>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-blue-600 mb-1 tracking-wide uppercase">
            {getGreeting()}
          </Text>
          <Text className="text-3xl font-bold text-gray-900">
            {(user?.name || 'Amitesh').split(' ')[0]}
          </Text>
        </View>
        <TouchableOpacity 
          className="w-14 h-14 rounded-full items-center justify-center"
          activeOpacity={0.85}
          style={{
            backgroundColor: '#F97316',
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-white font-bold text-2xl">
            {(user?.name?.charAt(0) || 'A').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Scroll */}
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#f5ede2' }}
      >
        {/* Quizzes Header with better visual hierarchy */}
        <View className="flex-row items-center justify-between px-5 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Quizzes</Text>
          <TouchableOpacity
            className="bg-blue-600 rounded-full px-4 py-2.5 flex-row items-center"
            onPress={() => Alert.alert('Join Quiz', 'Enter quiz code to join')}
            activeOpacity={0.85}
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Ionicons name="qr-code-outline" size={16} color="white" />
            <Text className="text-white font-bold ml-2 text-sm">Quiz code</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Card with improved presentation */}
        {featuredQuizData && (
          <FeaturedQuizCard 
            quiz={featuredQuizData} 
            onPress={() => Alert.alert('Start Quiz', `Starting "${featuredQuizData.title}"`)} 
          />
        )}

        {/* Your Quizzes Section with enhanced typography */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Your Quizzes</Text>
            <TouchableOpacity 
              onPress={() => Alert.alert('See All', 'Showing all your quizzes')}
              activeOpacity={0.7}
            >
              <Text className="text-blue-600 font-semibold text-sm">See all →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {quizzes.map(quiz => (
              <YourQuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onPress={() => Alert.alert('Quiz Details', quiz.title)} 
              />
            ))}
          </ScrollView>
        </View>

        {/* Empty State if no quizzes */}
        {quizzes.length === 0 && (
          <View className="items-center justify-center py-12 px-8">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="school-outline" size={40} color="#3B82F6" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2 text-center">
              No Quizzes Yet
            </Text>
            <Text className="text-gray-600 text-center text-sm">
              Create your first quiz to get started
            </Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Custom Bottom Navigation with Curved Design */}
      <BottomNavigation
        activeTab="home"
        onCreateQuiz={() => Alert.alert('Create Quiz', 'Create quiz feature coming soon!')}
        navigationItems={[
          {
            id: 'home',
            label: 'Home',
            icon: 'home-outline',
            activeIcon: 'home',
            onPress: () => Alert.alert('Home', 'Already on Home screen'),
          },
          {
            id: 'quizzes',
            label: 'Quizzes',
            icon: 'grid-outline',
            activeIcon: 'grid',
            onPress: () => Alert.alert('Quizzes', 'Quizzes screen coming soon!'),
          },
          {
            id: 'leaderboard',
            label: 'leaderboard',
            icon: 'bar-chart-outline',
            activeIcon: 'bar-chart',
            onPress: () => Alert.alert('Leaderboard', 'Leaderboard coming soon!'),
          },
          {
            id: 'friends',
            label: 'Friends',
            icon: 'people-outline',
            activeIcon: 'people',
            onPress: () => Alert.alert('Friends', 'Friends screen coming soon!'),
          },
        ]}
      />
    </SafeAreaView>
  );
}
