import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import { colorsDark } from '../constants/colors';
import ProfileScreen from '../screens/ProfileScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: colorsDark.background2,
        },
        headerTintColor: colorsDark.text1,
        drawerActiveTintColor: colorsDark.text1,
        drawerInactiveTintColor: colorsDark.text2,
        drawerActiveBackgroundColor: colorsDark.primary,
        drawerInactiveBackgroundColor: colorsDark.primary05,
        drawerStyle: {
          backgroundColor: colorsDark.background1,
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Safe Notes',
          drawerLabel: 'Safe Notes',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profile',
          drawerLabel: 'Profile',
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
