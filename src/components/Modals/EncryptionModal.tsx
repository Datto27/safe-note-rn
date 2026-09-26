import { ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useGlobalState } from '../../contexts/GlobaState';
import CustomTextInput from '../Inputs/CustomTextInput';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';
import ModalCard from './ModalCard';
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
            // Keep the original on failure - re-encrypting a null would
            // destroy the note body.
            info: decryptData(notes[k].info, oldKey) ?? notes[k].info,
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
    <ModalCard
      visible={visible}
      onClose={handleCancel}
      icon="lock"
      title={title}
      subtitle={text}
      footer={
        <>
          <SecondaryButton text="Cancel" onPress={handleCancel} />
          <PrimaryButton
            text="Submit"
            onPress={encrypt}
            icon={
              isLoading && (
                <ActivityIndicator
                  size={'small'}
                  color={theme.colors.btnText1}
                  style={{ marginRight: 4 }}
                />
              )
            }
          />
        </>
      }>
      <CustomTextInput
        placeholder="Encryption Key"
        error={error}
        containerStyles={{ marginBottom: 24 }}
        value={key}
        setValue={val => {
          setKey(val.toLowerCase());
          setError(null);
        }}
      />
    </ModalCard>
  );
};

export default EncryptionModal;
