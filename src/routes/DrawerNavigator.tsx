import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/HomeScreen';
import { colorsDark } from '../constants/colors';
import ProfileScreen from '../screens/ProfileScreen';
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colorsDark.background2,
        },
        headerTintColor: colorsDark.text1,
        drawerActiveTintColor: colorsDark.secondary,
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
          drawerLabel: 'Notes',
          drawerIcon: ({ focused }) => (
            <FeatherIcon
              name="list"
              size={22}
              color={focused ? colorsDark.secondary : colorsDark.text2}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profile',
          drawerLabel: 'Profile',
          drawerIcon: ({ focused }) => (
            <FeatherIcon
              name="user"
              size={22}
              color={focused ? colorsDark.secondary : colorsDark.text2}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
