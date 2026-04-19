import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/HomeScreen';
import { useGlobalState } from '../contexts/GlobaState';
import ProfileScreen from '../screens/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomTabBar } from '../components/Navigation/CustomTabBar';

const Tabs = createMaterialTopTabNavigator();

const TabsNavigator = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useGlobalState();

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        lazy: true,
      }}>
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tabs.Navigator>
  );
};

export default TabsNavigator;
