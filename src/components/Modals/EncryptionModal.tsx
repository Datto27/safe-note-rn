import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
      animationType="fade"
      onRequestClose={cancelCb}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background1 },
        ]}>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={styles.container}
          >
          <View
            style={[
              styles.form,
              {
                backgroundColor: theme.colors.modalBg,
                shadowColor: theme.colors.shadowColor1,
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
    width: '96%',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 30,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontFamily: 'JosefinSans-Medium',
    textAlign: 'center',
    fontSize: 22,
    marginTop: 20,
  },
  text: {
    fontFamily: 'JosefinSans-Medium',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 50,
  },
  btnsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
  },
});
