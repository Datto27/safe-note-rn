import { Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import FeatherIcons from 'react-native-vector-icons/Feather';
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
          <View style={styles.iconContainer}>
            <FeatherIcons name="trash-2" color="red" size={40} />
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
    backgroundColor: colorsDark.background2_09,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    alignItems: 'center',
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
    color: colorsDark.text1,
    marginBottom: 20,
  },
  iconContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(244, 0, 0, 0.2)',
    borderRadius: 10,
  },
  actionBtns: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
});
