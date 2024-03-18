import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { colorsDark } from '../constants/colors';
import { ProfileI } from '../interfaces/profile';
import { getData } from '../utils/storage';
import CustomTextInput from '../components/Inputs/CustomTextInput';
import PrimaryButton from '../components/Buttons/PrimaryButton';

const AuthScreen = () => {
  const navigation = useNavigation();
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
      return setError('Password is required!');
    }

    if (password === profile?.password) {
      navigation.dispatch(StackActions.replace('DrawerNav'));
    } else {
      setError('Password is incorect!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <Text style={styles.title}>Welcome back {profile?.username}!</Text>
        <CustomTextInput
          type="password"
          placeholder="Password"
          error={error}
          value={password}
          setValue={setPassword}
        />
        {profile?.hint && <Text style={styles.hint}>{profile.hint}</Text>}
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
    backgroundColor: colorsDark.background1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: colorsDark.text1,
    marginBottom: 40,
  },
  inputsContainer: {
    width: '90%',
    backgroundColor: colorsDark.primary05,
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
    color: colorsDark.text3,
    marginTop: 2,
    marginLeft: 10,
  },
  authBtn: {
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 0,
  },
});
