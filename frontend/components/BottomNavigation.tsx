import React from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface NavigationItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface BottomNavigationProps {
  activeTab: string;
  onCreateQuiz: () => void;
  navigationItems: NavigationItem[];
}

// Improved curved tab bar with downward curve in center
const CurvedTabBar: React.FC = () => {
  const screenWidth = Dimensions.get('window').width;
  const centerX = screenWidth / 2;
  
  // Curve parameters for circular cutout in center
  const circleRadius = 40; // Radius of the circular cutout
  const curveStart = centerX - circleRadius;
  const curveEnd = centerX + circleRadius;
  
  // Circular cutout path - creates a perfect semicircle notch
  const mainPath = `
    M 0,0
    L ${curveStart},0
    A ${circleRadius} ${circleRadius} 0 0 1 ${curveEnd} 0
    L ${screenWidth},0
    L ${screenWidth},75
    L 0,75
    Z
  `;

  return (
    <Svg
      width="100%"
      height="75"
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
    >
      <Defs>
        <LinearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      
      {/* Subtle shadow for depth */}
      <Path
        d={mainPath}
        fill="url(#shadowGradient)"
        transform="translate(0, 1)"
      />
      
      {/* Main white background */}
      <Path
        d={mainPath}
        fill="white"
        stroke="none"
      />
    </Svg>
  );
};

// Reusable Navigation Item Component
interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
}

const NavigationButton: React.FC<NavItemProps> = ({ item, isActive }) => (
  <TouchableOpacity
    className="items-center justify-center"
    onPress={item.onPress}
    activeOpacity={0.7}
    style={{ 
      width: 70,
      height: 70,
      paddingBottom: 8,
    }}
  >
    {/* Icon Container with fixed size to prevent layout shift */}
    <View 
      className="items-center justify-center"
      style={{
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: isActive ? '#3B82F6' : 'transparent',
      }}
    >
      <Ionicons
        name={isActive ? item.activeIcon : item.icon}
        size={24}
        color={isActive ? 'white' : '#9CA3AF'}
      />
    </View>
    
    {/* Label with fixed typography */}
    <Text 
      className="text-xs font-medium mt-1"
      style={{ 
        color: isActive ? '#3B82F6' : '#6B7280',
        fontSize: 11,
        letterSpacing: 0.2,
      }}
      numberOfLines={1}
    >
      {item.label}
    </Text>
  </TouchableOpacity>
);

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onCreateQuiz,
  navigationItems,
}) => {
  return (
    <View 
      className="absolute bottom-0 left-0 right-0" 
      style={{ 
        borderTopWidth: 0,
        backgroundColor: 'transparent',
      }}
    >
      {/* Background with downward curve */}
      <View style={{ height: 75, backgroundColor: 'transparent' }}>
        <CurvedTabBar />
      </View>

      {/* Navigation Items Container - Split Layout */}
      <View 
        className="absolute bottom-0 left-0 right-0 flex-row items-center"
        style={{ 
          height: 75,
          paddingHorizontal: 20,
        }}
      >
        {/* Left Side - 2 Items with constant spacing */}
        <View className="flex-row items-center" style={{ gap: 16 }}>
          <NavigationButton 
            item={navigationItems[0]} 
            isActive={activeTab === navigationItems[0]?.id} 
          />
          <NavigationButton 
            item={navigationItems[1]} 
            isActive={activeTab === navigationItems[1]?.id} 
          />
        </View>

        {/* Center Space - Flex to push buttons apart and create more space around FAB */}
        <View style={{ flex: 1 }} />

        {/* Right Side - 2 Items with constant spacing */}
        <View className="flex-row items-center" style={{ gap: 16 }}>
          <NavigationButton 
            item={navigationItems[2]} 
            isActive={activeTab === navigationItems[2]?.id} 
          />
          <NavigationButton 
            item={navigationItems[3]} 
            isActive={activeTab === navigationItems[3]?.id} 
          />
        </View>
      </View>

      {/* Floating Action Button - Centered in circular cutout */}
      <View 
        className="absolute left-1/2"
        style={{ top: -10, marginLeft: -32 }}
      >
        {/* Outer glow effect */}
        <View 
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: 40,
            backgroundColor: '#3B82F6',
            opacity: 0.2,
          }}
        />
        
        {/* Main FAB Button */}
        <TouchableOpacity
          className="w-[64px] h-[64px] bg-blue-600 rounded-full items-center justify-center"
          onPress={onCreateQuiz}
          activeOpacity={0.85}
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomNavigation;