import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ClosetScreen from '../screens/ClosetScreen';
import ModelScreen from '../screens/ModelScreen';
import TryOnScreen from '../screens/TryOnScreen';
import AccountScreen from '../screens/AccountScreen';
import HomeScreen from '../screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Closet') {
            iconName = 'shirt-outline';
          } else if (route.name === 'Model') {
            iconName = 'person-outline';
          } else if (route.name === 'TryOn') {
            iconName = 'layers-outline';
          } else if (route.name === 'Account') {
            iconName = 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Closet" component={ClosetScreen} options={{ headerShown: true, title: '👚 My Closet', headerTitleAlign: 'left', tabBarLabel: 'Coset',}}/>
      <Tab.Screen name="Model" component={ModelScreen} options={{ headerShown: true, title: '🧍 Model Gallery', headerTitleAlign: 'left', tabBarLabel: 'Model',}} />
      <Tab.Screen name="TryOn" component={TryOnScreen} options={{ headerShown: true, title: '🧍 Try On Clothes', headerTitleAlign: 'left', tabBarLabel: 'Tryon',}}/>
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
