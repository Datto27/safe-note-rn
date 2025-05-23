import {
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ProfileI } from '../../interfaces/profile';
import CustomTextInput from '../Inputs/CustomTextInput';
import SecondaryButton from '../Buttons/SecondaryButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import { saveData } from '../../utils/storage';
import { EditorModeT } from '../../interfaces/editor-info.type';
import { useGlobalState } from '../../contexts/GlobaState';

type Props = {
  profile?: ProfileI | null;
  mode: EditorModeT;
  visible: boolean;
  setVisible: (val: boolean) => void;
};

const ProfileEditor = ({ profile, mode, visible, setVisible }: Props) => {
  const { theme } = useGlobalState();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState({ field: '', msg: '' });

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setHint(profile.hint);
    }
  }, [profile]);

  const createProfile = () => {
    if (!username) {
      return setError({ field: 'username', msg: 'Username Is Required' });
    }
    if (!password) {
      return setError({ field: 'password', msg: 'Password Is Required' });
    }
    if (password !== rePassword) {
      return setError({
        field: 'rePassword',
        msg: 'Passwords Should Be Identical',
      });
    }

    saveData('profile', { username, password, hint }).then(() => {
      handleClose();
    });
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setRePassword('');
    setHint('');
    setError({ field: '', msg: '' });
    setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background1 },
        ]}>
        <KeyboardAvoidingView behavior={'padding'}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View
              style={[
                styles.wrapper,
                { shadowColor: theme.colors.modalShadow },
              ]}>
              <View
                style={[
                  styles.inputsContainer,
                  {
                    backgroundColor: theme.colors.modalBg,
                    borderColor: theme.colors.modalBorder,
                  },
                ]}>
                <CustomTextInput
                  placeholder="Username"
                  containerStyles={{ marginVertical: 7 }}
                  error={error.field === 'username' ? error.msg : null}
                  value={username}
                  setValue={setUsername}
                />
                <CustomTextInput
                  type="password"
                  placeholder="Password"
                  containerStyles={{ marginVertical: 10 }}
                  error={error.field === 'password' ? error.msg : null}
                  value={password}
                  setValue={setPassword}
                />
                <CustomTextInput
                  type="password"
                  placeholder="Repeat Password"
                  containerStyles={{ marginVertical: 10 }}
                  error={error.field === 'rePassword' ? error.msg : null}
                  value={rePassword}
                  setValue={setRePassword}
                />
                <CustomTextInput
                  placeholder="Hint for remember the password"
                  containerStyles={{ marginVertical: 10 }}
                  value={hint}
                  setValue={setHint}
                />
                <View style={styles.actionBtns}>
                  <SecondaryButton
                    text="Cancel"
                    onPress={() => handleClose()}
                  />
                  {mode === 'create' ? (
                    <PrimaryButton
                      text="Create"
                      onPress={() => createProfile()}
                    />
                  ) : (
                    <PrimaryButton
                      text="Update"
                      onPress={() => createProfile()}
                    />
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default ProfileEditor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    marginHorizontal: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    borderRadius: 20,
  },
  inputsContainer: {
    width: '95%',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
  },
  actionBtns: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});
