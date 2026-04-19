import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useGlobalState } from '../../contexts/GlobaState';
import CustomTextInput from '../Inputs/CustomTextInput';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';
import { getData, saveData } from '../../utils/storage';
import { decryptData, encryptData } from '../../utils/encrypt.private';

type Props = {
  visible: boolean;
  mode: string | null;
  title: string;
  text: string;
  cancelCb: () => void;
  successCb: () => void;
};

const EncryptionModal = ({
  visible,
  mode,
  title,
  text,
  cancelCb,
  successCb,
}: Props) => {
  const { theme } = useGlobalState();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setIsLoading(false);
    setError(null);
    cancelCb();
  };

  const encrypt = () => {
    if (!key) {
      return setError('Key is empty!');
    }
    if (key.length > 8) {
      return setError('More than 8 characters');
    }
    setIsLoading(true);
    getData('notes').then(async notes => {
      if (mode === 'encrypt-update') {
        const oldKey = await getData('key');
        Object.keys(notes).forEach(k => {
          notes[k] = {
            ...notes[k],
            info: decryptData(notes[k].info, oldKey),
          };
        });
      }

      Object.keys(notes).forEach(k => {
        notes[k] = { ...notes[k], info: encryptData(notes[k].info, key) };
      });

      saveData('notes', notes).then(() => {
        saveData('key', key).then(() => {
          setIsLoading(false);
          successCb();
        });
      });
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={cancelCb}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: 'rgba(0,0,0,0.5)' },
        ]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.container}>
          <View
            style={[
              styles.form,
              {
                backgroundColor: theme.colors.modalBg,
                borderColor: theme.colors.modalBorder,
                borderWidth: 1,
              },
            ]}>
            <Text style={[styles.title, { color: theme.colors.text1 }]}>
              {title}
            </Text>
            <Text style={[styles.text, { color: theme.colors.text2 }]}>
              {text}
            </Text>
            <CustomTextInput
              placeholder="Encryption Key"
              error={error}
              value={key}
              setValue={val => {
                setKey(val.toLowerCase());
                setError(null);
              }}
            />
            <View style={styles.btnsSection}>
              <SecondaryButton text="Cancel" onPress={handleCancel} />
              <PrimaryButton
                text="Submit"
                onPress={encrypt}
                icon={
                  isLoading && (
                    <ActivityIndicator
                      size={'small'}
                      color={theme.colors.text1}
                      style={{ marginRight: 4 }}
                    />
                  )
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default EncryptionModal;

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
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 32,
    opacity: 0.8,
  },
  btnsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 32,
  },
});
