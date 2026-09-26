import { Animated, Easing, StyleSheet } from 'react-native';
import React, { useEffect, useRef } from 'react';
import FeatherIcons from 'react-native-vector-icons/Feather';
import SecondaryButton from '../Buttons/SecondaryButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import ModalCard from './ModalCard';
import { dangerColor } from '../../constants/colors';

type Props = {
  visible: boolean;
  text: string;
  deleteCb: () => void;
  cancelCb: () => void;
};

const DeleteModal = ({ text, visible, deleteCb, cancelCb }: Props) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const animateBin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-7deg', '7deg'],
  });

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [visible]);

  return (
    <ModalCard
      visible={visible}
      onClose={cancelCb}
      tone="danger"
      icon={
        <Animated.View style={{ transform: [{ rotate: animateBin }] }}>
          <FeatherIcons name="trash-2" color={dangerColor} size={18} />
        </Animated.View>
      }
      title={text}
      footer={
        <>
          <SecondaryButton text="Cancel" onPress={() => cancelCb()} />
          <PrimaryButton
            text="Delete"
            onPress={() => deleteCb()}
            containerStyle={styles.deleteBtn}
            style={styles.deleteText}
          />
        </>
      }
    />
  );
};

export default DeleteModal;

const styles = StyleSheet.create({
  deleteBtn: {
    backgroundColor: dangerColor,
  },
  deleteText: {
    color: '#ffffff',
  },
});
