import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ProfileI } from '../../interfaces/profile';
import CustomTextInput from '../Inputs/CustomTextInput';
import SecondaryButton from '../Buttons/SecondaryButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import { saveData } from '../../utils/storage';
import { EditorModeT } from '../../interfaces/editor-info.type';
import ModalCard from './ModalCard';

type Props = {
  profile?: ProfileI | null;
  mode: EditorModeT;
  visible: boolean;
  setVisible: (val: boolean) => void;
};

const ProfileEditor = ({ profile, mode, visible, setVisible }: Props) => {
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
    <ModalCard
      visible={visible}
      onClose={handleClose}
      icon="user"
      title={mode === 'create' ? 'Create Profile' : 'Edit Profile'}
      subtitle="Your password locks the app and protects your data"
      footer={
        <>
          <SecondaryButton text="Cancel" onPress={() => handleClose()} />
          <PrimaryButton
            text={mode === 'create' ? 'Create' : 'Update'}
            onPress={() => createProfile()}
          />
        </>
      }>
      <CustomTextInput
        placeholder="Username"
        containerStyles={styles.input}
        error={error.field === 'username' ? error.msg : null}
        value={username}
        setValue={setUsername}
      />
      <CustomTextInput
        type="password"
        placeholder="Password"
        containerStyles={styles.input}
        error={error.field === 'password' ? error.msg : null}
        value={password}
        setValue={setPassword}
      />
      <CustomTextInput
        type="password"
        placeholder="Repeat Password"
        containerStyles={styles.input}
        error={error.field === 'rePassword' ? error.msg : null}
        value={rePassword}
        setValue={setRePassword}
      />
      <CustomTextInput
        placeholder="Hint for the password"
        containerStyles={styles.input}
        value={hint}
        setValue={setHint}
      />
    </ModalCard>
  );
};

export default ProfileEditor;

const styles = StyleSheet.create({
  // Room below each field for its error label
  input: {
    marginBottom: 24,
  },
});
