import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';
import AuthScreen from '../screens/AuthScreen';
import { ProfileI } from '../interfaces/profile';
import { getData } from '../utils/storage';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const MainStack = () => {
  const [profile, setProfile] = useState<ProfileI>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData('profile')
      .then(res => {
        setProfile(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={profile ? 'Auth' : 'DrawerNav'}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="DrawerNav" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

export default MainStack;
