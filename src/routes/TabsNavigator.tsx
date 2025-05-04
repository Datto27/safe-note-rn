import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/HomeScreen';
import { useGlobalState } from '../contexts/GlobaState';
import ProfileScreen from '../screens/ProfileScreen';

const Tabs = createMaterialTopTabNavigator();

const TabsNavigator = () => {
  const { theme } = useGlobalState();

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        // tabBarShowLabel: false,
        tabBarStyle: {
          elevation: 0,
          backgroundColor: theme.colors.background2,
          overflow: 'hidden',
          paddingVertical: 4,
          borderBottomColor: theme.colors.modalBorder,
          borderBottomWidth: 1,
        },
        tabBarItemStyle: {
          flexDirection: 'row',
        },
        tabBarInactiveTintColor: theme.colors.btnText3,
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: {
          fontSize: 14,
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
              color={focused ? theme.colors.secondary : theme.colors.btnText3}
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
              color={focused ? theme.colors.secondary : theme.colors.btnText3}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabsNavigator;
