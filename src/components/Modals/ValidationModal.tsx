import React, { useState } from 'react';
import CustomTextInput from '../Inputs/CustomTextInput';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';
import ModalCard from './ModalCard';
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
    <ModalCard
      visible={visible}
      onClose={cancelCb}
      icon="shield"
      title={text}
      subtitle="Enter your password to continue"
      footer={
        <>
          <SecondaryButton text="Cancel" onPress={cancelCb} />
          <PrimaryButton text="Verify" onPress={validate} />
        </>
      }>
      <CustomTextInput
        placeholder="Enter password"
        type="password"
        containerStyles={{ marginBottom: 24 }}
        error={error}
        value={password}
        setValue={setPassword}
      />
    </ModalCard>
  );
};

export default ValidationModal;
