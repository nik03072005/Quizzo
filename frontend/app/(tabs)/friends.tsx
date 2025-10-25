import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState('');

  const friends = [
    { id: 1, name: 'Brandon Matrovs', points: 3250, avatar: '👨‍💼', color: '#7950F2' },
    { id: 2, name: 'Sarah Johnson', points: 2840, avatar: '👩‍💻', color: '#E64980' },
    { id: 3, name: 'Mike Anderson', points: 2615, avatar: '👨‍🎓', color: '#F59F00' },
    { id: 4, name: 'Emma Williams', points: 2340, avatar: '👩‍🎨', color: '#12B886' },
    { id: 5, name: 'John Smith', points: 2180, avatar: '👨‍🔧', color: '#3B82F6' },
  ];

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366F1', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              CONNECTIONS
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2937' }}>
              Friends
            </Text>
          </View>

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search friends..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  color: '#1F2937',
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Friends List */}
          <View style={{ paddingHorizontal: 24, gap: 12, paddingBottom: 100 }}>
            {filteredFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: friend.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{friend.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                    {friend.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    {friend.points} points
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation
        activeTab="friends"
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
