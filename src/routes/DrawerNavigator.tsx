import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomDrawer from '../components/CustomDrawer';
import { useGlobalState } from '../contexts/GlobaState';
import ArchiveScreen from '../screens/ArchiveScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { theme } = useGlobalState();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background2,
        },
        headerTintColor: theme.colors.text1,
        drawerActiveTintColor: theme.colors.btnText1,
        drawerInactiveTintColor: theme.colors.btnText3,
        drawerActiveBackgroundColor: theme.colors.btn1,
        drawerInactiveBackgroundColor: theme.colors.btn2,
        drawerStyle: {
          backgroundColor: theme.colors.background1,
        },
        drawerItemStyle: {
          borderRadius: 20,
          shadowColor: theme.colors.shadowColor1,
          shadowOffset: { width: 0, height: 0 },
          marginTop: 10,
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 5,
        },
        drawerLabelStyle: {
          fontFamily: 'JosefinSans-Medium',
          fontSize: 16,
          textShadowColor: theme.colors.textShadow,
          textShadowRadius: 10,
          textShadowOffset: { width: 0, height: 0 },
          paddingHorizontal: 5,
        },
        headerTitleStyle: {
          fontFamily: 'JosefinSans-Bold',
          textAlign: 'center',
          textShadowColor: theme.colors.textShadow,
          textShadowRadius: 10,
          textShadowOffset: { width: 0, height: 0 },
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
              color={focused ? theme.colors.btnText1 : theme.colors.btnText3}
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
              color={focused ? theme.colors.btnText1 : theme.colors.btnText3}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          headerTitle: 'Archive',
          drawerLabel: 'Archive',
          drawerIcon: ({ focused }) => (
            <FeatherIcon
              name="archive"
              size={22}
              color={focused ? theme.colors.btnText1 : theme.colors.btnText3}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
