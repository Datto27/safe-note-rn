import { Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import SecondaryButton from '../Buttons/SecondaryButton';
import TextButton from '../Buttons/TextButton';
import { colorsDark } from '../../constants/colors';

type Props = {
  visible: boolean;
  text: string;
  deleteCb: () => void;
  cancelCb: () => void;
};

const DeleteModal = ({ text, visible, deleteCb, cancelCb }: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{text}</Text>
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
    backgroundColor: colorsDark.background2_09,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: colorsDark.background2,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colorsDark.text3,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: colorsDark.text1,
    marginBottom: 20,
  },
  actionBtns: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
