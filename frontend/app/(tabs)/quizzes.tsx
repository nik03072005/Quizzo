import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';

export default function Quizzes() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const quizzes = [
    { id: 1, title: 'React Native Basics', icon: '⚛️', participants: 234, myResult: '85%' },
    { id: 2, title: 'TypeScript Fundamentals', icon: '📘', participants: 189, myResult: '92%' },
    { id: 3, title: 'JavaScript ES6+', icon: '🟨', participants: 321, myResult: '78%' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366F1', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              MY QUIZZES
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2937' }}>
              Created Quizzes
            </Text>
          </View>

          {/* Quiz Cards */}
          <View style={{ paddingHorizontal: 24, gap: 16, paddingBottom: 100 }}>
            {quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {/* Quiz Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{quiz.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                      {quiz.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6B7280' }}>
                      {quiz.participants} participants
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>

                {/* Results Section */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 13, color: '#6B7280' }}>My Result:</Text>
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#16A34A' }}>{quiz.myResult}</Text>
                    </View>
                  </View>
                  
                  {/* Avatar Stack */}
                  <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                    {[0, 1, 2].map((i) => (
                      <View
                        key={i}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: ['#E64980', '#7950F2', '#F59F00'][i],
                          marginLeft: i > 0 ? -8 : 0,
                          borderWidth: 2,
                          borderColor: 'white',
                        }}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation
        activeTab="quizzes"
        onCreateQuiz={() => Alert.alert('Create Quiz', 'Create quiz feature coming soon!')}
        navigationItems={[
          {
            id: 'home',
            label: 'Home',
            icon: 'home-outline',
            activeIcon: 'home',
            onPress: () => router.push('/(tabs)'),
          },
          {
            id: 'quizzes',
            label: 'Quizzes',
            icon: 'grid-outline',
            activeIcon: 'grid',
            onPress: () => router.push('/(tabs)/quizzes'),
          },
          {
            id: 'leaderboard',
            label: 'Leaderboard',
            icon: 'trophy-outline',
            activeIcon: 'trophy',
            onPress: () => router.push('/(tabs)/leaderboard'),
          },
          {
            id: 'friends',
            label: 'Friends',
            icon: 'people-outline',
            activeIcon: 'people',
            onPress: () => router.push('/(tabs)/friends'),
          },
        ]}
      />
    </View>
  );
}
