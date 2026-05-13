import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#65b87470', 
        tabBarInactiveTintColor: '#65b874ff',
        tabBarShowLabel: false,
        tabBarIconStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: { 
          position: 'absolute',
          bottom: 30,
          marginHorizontal: 34,

          height: 70,
          borderRadius: 40,
          borderTopWidth: 0,

          elevation: 65,
          backgroundColor: '#fff',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,

          paddingBottom: 0,
          paddingTop: 0,
         },
        headerShown: false,
        // tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />

      <Tabs.Screen 
        name="add"
        options={{
          title: '',
          tabBarStyle: { display: 'none'},
          tabBarIcon: () => (
            <View style={{
              backgroundColor: '#65b874ff',
              width: 78,
              height: 78,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              top: -34,
            }} > 
              <Ionicons name="add" size={50} color="#fff" />
            </View>
          )
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: '',
          tabBarStyle: { display: 'none'},
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
