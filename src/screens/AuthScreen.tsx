import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { ProfileI } from '../interfaces/profile';
import { getData } from '../utils/storage';
import CustomTextInput from '../components/Inputs/CustomTextInput';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import { useGlobalState } from '../contexts/GlobaState';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { theme } = useGlobalState();
  const [profile, setProfile] = useState<ProfileI>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getData('profile').then(res => {
      setProfile(res);
    });
  }, []);

  const handleAuthorization = () => {
    if (!password) {
      return setError('Password Is Required!');
    }

    if (password === profile?.password) {
      navigation.dispatch(StackActions.replace('TabsNavigator'));
    } else {
      setError('Password Is Incorect!');
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <View
        style={[
          styles.inputsContainer,
          { backgroundColor: theme.colors.primary05 },
        ]}>
        <Text style={[styles.title, { color: theme.colors.text1 }]}>
          Welcome back {profile?.username}!
        </Text>
        <CustomTextInput
          type="password"
          placeholder="Password"
          error={error}
          value={password}
          setValue={setPassword}
        />
        {profile?.hint && (
          <Text style={[styles.hint, { color: theme.colors.text2 }]}>
            {profile.hint}
          </Text>
        )}
        <PrimaryButton
          text="Authorize"
          onPress={handleAuthorization}
          containerStyle={styles.authBtn}
        />
      </View>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputsContainer: {
    width: '90%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  authBtn: {
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 0,
  },
});
