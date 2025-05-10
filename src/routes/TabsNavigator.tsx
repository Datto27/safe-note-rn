import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/HomeScreen';
import { useGlobalState } from '../contexts/GlobaState';
import ProfileScreen from '../screens/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tabs = createMaterialTopTabNavigator();

const TabsNavigator = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useGlobalState();

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          elevation: 0,
          backgroundColor: theme.colors.background2,
          overflow: 'hidden',
          borderBottomColor: theme.colors.modalBorder,
          borderBottomWidth: 1,
          marginTop: insets.top,
          margin: 4,
          borderRadius: 10,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.primary,
        },
        tabBarItemStyle: {
          flexDirection: 'row',
        },
        tabBarInactiveTintColor: theme.colors.btnText3,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <FeatherIcon
              name="list"
              size={22}
              color={focused ? theme.colors.primary : theme.colors.btnText3}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <FeatherIcon
              name="user"
              size={22}
              color={focused ? theme.colors.primary : theme.colors.btnText3}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabsNavigator;
