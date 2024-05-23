import {
  Modal,
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
          { backgroundColor: theme.colors.background2_09 },
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.container}
          onPress={cancelCb}>
          <View
            style={[styles.form, { backgroundColor: theme.colors.primary05 }]}>
            <Text style={[styles.title, { color: theme.colors.text1 }]}>
              {text}
            </Text>
            <CustomTextInput
              placeholder="Enter User Password"
              containerStyles={{ marginBottom: 20 }}
              error={error}
              value={password}
              setValue={setPassword}
            />
            <PrimaryButton text="Submit" onPress={validate} />
          </View>
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
    width: '96%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontFamily: 'JosefinSans-Bold',
    fontSize: 24,
    marginTop: 20,
    marginBottom: 40,
  },
});
