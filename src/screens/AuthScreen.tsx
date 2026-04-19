import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { ProfileI } from '../interfaces/profile';
import { getData } from '../utils/storage';
import CustomTextInput from '../components/Inputs/CustomTextInput';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalState } from '../contexts/GlobaState';

const AuthScreen = () => {
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      <View style={styles.inputsContainer}>
        <View style={styles.iconContainer}>
          <FeatherIcon name="lock" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text1 }]}>
          Welcome back, <Text style={{ color: theme.colors.primary }}>{profile?.username}</Text>!
        </Text>
        <CustomTextInput
          type="password"
          placeholder="Password"
          error={error}
          value={password}
          setValue={setPassword}
          containerStyles={styles.inputMargin}
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
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputsContainer: {
    width: '100%',
    paddingHorizontal: 32,
  },
  inputMargin: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    marginTop: 4,
    marginLeft: 8,
    textAlign: 'center',
  },
  authBtn: {
    alignSelf: 'stretch',
    marginTop: 24,
    marginBottom: 0,
  },
});
