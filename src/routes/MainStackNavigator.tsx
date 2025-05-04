import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabsNavigatorigator from './TabsNavigator';
import AuthScreen from '../screens/AuthScreen';
import { ProfileI } from '../interfaces/profile';
import { getData } from '../utils/storage';
import LoadingScreen from '../screens/LoadingScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import { useGlobalState } from '../contexts/GlobaState';
import CustomHeader from '../components/CustomHeader';

const Stack = createStackNavigator();

const MainStack = () => {
  const { theme } = useGlobalState();
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
      initialRouteName={profile ? 'Auth' : 'TabsNavigator'}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="TabsNavigator" component={TabsNavigatorigator} />
      <Stack.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          header: props => <CustomHeader {...props} />,
          headerShown: true,
          headerBackTitle: 'Go Back',
          headerStyle: {
            backgroundColor: theme.colors.background2,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.modalBorder,
          },
          headerTintColor: theme.colors.text1,
          headerBackTitleStyle: {
            color: theme.colors.secondary,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
