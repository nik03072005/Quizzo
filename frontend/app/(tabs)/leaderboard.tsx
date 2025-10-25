import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';

export default function Leaderboard() {
  const [filter, setFilter] = useState<'weekly' | 'alltime'>('weekly');

  const topUsers = [
    { rank: 2, name: 'Sarah K.', points: 2840, avatar: '👩', color: '#7950F2' },
    { rank: 1, name: 'Alex M.', points: 3250, avatar: '👨', color: '#F59F00' },
    { rank: 3, name: 'Mike R.', points: 2615, avatar: '👦', color: '#E64980' },
  ];

  const otherUsers = [
    { rank: 4, name: 'Emma W.', points: 2340, avatar: '👧', color: '#12B886' },
    { rank: 5, name: 'John D.', points: 2180, avatar: '🧑', color: '#3B82F6' },
    { rank: 6, name: 'Lisa P.', points: 2050, avatar: '👱', color: '#F97316' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366F1', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              RANKINGS
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2937' }}>
              Leaderboard
            </Text>
          </View>

          {/* Filter Tabs */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => setFilter('weekly')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: filter === 'weekly' ? '#6366F1' : 'white',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: filter === 'weekly' ? 'white' : '#6B7280' }}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('alltime')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: filter === 'alltime' ? '#6366F1' : 'white',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: filter === 'alltime' ? 'white' : '#6B7280' }}>
                All Time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Podium - Top 3 */}
          <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
              {/* 2nd Place */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: topUsers[0].color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{topUsers[0].avatar}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>{topUsers[0].name}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{topUsers[0].points} pts</Text>
                <LinearGradient
                  colors={['#C0C0C0', '#E8E8E8']}
                  style={{ width: '100%', height: 100, borderRadius: 12, alignItems: 'center', paddingTop: 12 }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#6B7280' }}>2</Text>
                </LinearGradient>
              </View>

              {/* 1st Place */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 28, marginBottom: 4 }}>👑</Text>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: topUsers[1].color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                >
                  <Text style={{ fontSize: 36 }}>{topUsers[1].avatar}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 }}>{topUsers[1].name}</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{topUsers[1].points} pts</Text>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={{ width: '100%', height: 140, borderRadius: 12, alignItems: 'center', paddingTop: 12 }}
                >
                  <Text style={{ fontSize: 28, fontWeight: '700', color: 'white' }}>1</Text>
                </LinearGradient>
              </View>

              {/* 3rd Place */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: topUsers[2].color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{topUsers[2].avatar}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>{topUsers[2].name}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{topUsers[2].points} pts</Text>
                <LinearGradient
                  colors={['#CD7F32', '#E8A87C']}
                  style={{ width: '100%', height: 80, borderRadius: 12, alignItems: 'center', paddingTop: 12 }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>3</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Rest of Rankings */}
          <View style={{ paddingHorizontal: 24, gap: 12, paddingBottom: 100 }}>
            {otherUsers.map((user) => (
              <View
                key={user.rank}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#9CA3AF', width: 32 }}>{user.rank}</Text>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: user.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{user.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>{user.name}</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>{user.points} points</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation
        activeTab="leaderboard"
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
