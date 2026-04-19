import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useGlobalState } from '../../contexts/GlobaState';
import CustomTextInput from '../Inputs/CustomTextInput';
import PrimaryButton from '../Buttons/PrimaryButton';
import { ProfileI } from '../../interfaces/profile';

type Props = {
  visible: boolean;
  text: string;
  profile: ProfileI | null;
  cancelCb: () => void;
  successCb: () => void;
};

const ValidationModal = ({
  visible,
  text,
  profile,
  cancelCb,
  successCb,
}: Props) => {
  const { theme } = useGlobalState();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!password) {
      return setError('Password Is Required!');
    }

    if (password === profile?.password) {
      successCb();
    } else {
      setError('Password Is Incorect!');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={cancelCb}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: 'rgba(0,0,0,0.5)' },
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.container}
          onPress={cancelCb}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View
              style={[styles.form, { backgroundColor: theme.colors.modalBg, borderColor: theme.colors.modalBorder, borderWidth: 1 }]}>
              <Text style={[styles.title, { color: theme.colors.text1 }]}>
                {text}
              </Text>
              <CustomTextInput
                placeholder="Enter password"
                type="password"
                containerStyles={{ marginBottom: 24 }}
                error={error}
                value={password}
                setValue={setPassword}
              />
              <PrimaryButton 
                text="Verify" 
                onPress={validate} 
                containerStyle={{ alignSelf: 'stretch' }}
              />
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

export default ValidationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  form: {
    width: '90%',
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 32,
    textAlign: 'center',
  },
});
