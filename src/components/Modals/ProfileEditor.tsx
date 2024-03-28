import { Modal, SafeAreaView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ProfileI } from '../../interfaces/profile';
import { colorsDark } from '../../constants/colors';
import CustomTextInput from '../Inputs/CustomTextInput';
import SecondaryButton from '../Buttons/SecondaryButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import { saveData } from '../../utils/storage';
import { EditorModeT } from '../../interfaces/editor-info.type';

type Props = {
  profile?: ProfileI | null;
  mode: EditorModeT;
  visible: boolean;
  setVisible: (val: boolean) => void;
};

const ProfileEditor = ({ profile, mode, visible, setVisible }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      return setError({ field: 'username', msg: 'Username is required' });
    }
    if (!password) {
      return setError({ field: 'password', msg: 'Password is required' });
    }

    saveData('profile', { username, password, hint }).then(() => {
      handleClose();
    });
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setHint('');
    setError({ field: '', msg: '' });
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.inputsContainer}>
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
            containerStyles={{ marginVertical: 7 }}
            error={error.field === 'password' ? error.msg : null}
            value={password}
            setValue={setPassword}
          />
          <CustomTextInput
            placeholder="Hint for remember the password"
            containerStyles={{ marginVertical: 7 }}
            value={hint}
            setValue={setHint}
          />
          <View style={styles.actionBtns}>
            <SecondaryButton text="Cancel" onPress={() => handleClose()} />
            {mode === 'create' ? (
              <PrimaryButton text="Create" onPress={() => createProfile()} />
            ) : (
              <PrimaryButton text="Update" onPress={() => createProfile()} />
            )}
          </View>
        </View>
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
    backgroundColor: colorsDark.background2,
  },
  inputsContainer: {
    backgroundColor: colorsDark.primary05,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtns: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
