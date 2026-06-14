import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TodoScreen from '../screens/TodoScreen';
import RemindersScreen from '../screens/RemindersScreen';
import { CustomTabBar } from '../components/Navigation/CustomTabBar';

export type TabsNavigatorParamList = {
  Home: undefined;
  Todo: undefined;
  Reminders: undefined;
  Profile: undefined;
};

const Tabs = createMaterialTopTabNavigator<TabsNavigatorParamList>();

const TabsNavigator = () => {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        lazy: true,
      }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Todo" component={TodoScreen} />
      <Tabs.Screen name="Reminders" component={RemindersScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
};

export default TabsNavigator;
