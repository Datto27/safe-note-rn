import {
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import FeatherIcons from 'react-native-vector-icons/Feather';
import SecondaryButton from '../Buttons/SecondaryButton';
import TextButton from '../Buttons/TextButton';
import { useGlobalState } from '../../contexts/GlobaState';

type Props = {
  visible: boolean;
  text: string;
  deleteCb: () => void;
  cancelCb: () => void;
};

const DeleteModal = ({ text, visible, deleteCb, cancelCb }: Props) => {
  const { theme } = useGlobalState();
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
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={cancelCb}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.modalBg }]}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.background2,
              borderColor: theme.colors.text3,
            },
          ]}>
          <Text style={[styles.title, { color: theme.colors.text1 }]}>
            {text}
          </Text>
          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ rotate: animateBin }] }}>
              <FeatherIcons name="trash-2" color="red" size={40} />
            </Animated.View>
          </View>
          <View style={styles.actionBtns}>
            <SecondaryButton text="Cancel" onPress={() => cancelCb()} />
            <TextButton text="Delete" color="red" onPress={() => deleteCb()} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DeleteModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  iconContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(244, 0, 0, 0.05)',
    borderRadius: 24,
    marginBottom: 16,
  },
  actionBtns: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
});
