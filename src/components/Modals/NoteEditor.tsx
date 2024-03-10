import { Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { colorsDark } from '../../constants/colors';
import CustomTextInput from '../Inputs/CustomTextInput';
import { getData, saveData } from '../../utils/storage';
import { NoteI } from '../../interfaces/note';

export type EditorModeT = 'create' | 'update';

type Props = {
  item?: NoteI;
  mode: EditorModeT;
  visible: boolean;
  setVisible: (val: boolean) => void;
  cb: () => void;
};

const NoteEditor = ({ item, mode, visible, setVisible, cb }: Props) => {
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState({
    field: '',
    msg: '',
  });

  useEffect(() => {
    if (mode === 'update' && item) {
      setTitle(item.title);
      setInfo(item.info);
    }
  }, [item]);

  const handleClose = () => {
    setTitle('');
    setInfo('');
    setError({ field: '', msg: '' });
    setVisible(false);
  };

  const saveNote = async () => {
    if (!title) {
      return setError({ field: 'title', msg: 'Title is required!' });
    }

    if (mode === 'create') {
      const id = Math.random().toString(16).slice(2);
      const note: NoteI = {
        id,
        title,
        info,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let notes = await getData('notes');
      if (!notes || notes.length === 0) {
        notes = {};
      }

      notes[id] = note;
      saveData('notes', notes).then(res => {
        if (res === 'ok') {
          handleClose();
        }
      });
    } else {
      if (!item) {
        return;
      }

      const note: NoteI = {
        ...item,
        title,
        info,
        updatedAt: new Date(),
      };

      let notes = await getData('notes');
      if (!notes || notes.length === 0) {
        notes = {};
      }

      notes[item.id] = note;
      saveData('notes', notes).then(res => {
        if (res === 'ok') {
          handleClose();
        }
      });
    }
    cb();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={saveNote}>
            <Text style={styles.saveTxt}>Save Note</Text>
          </TouchableOpacity>
        </View>
        <CustomTextInput
          placeholder="Title"
          value={title}
          setValue={setTitle}
          containerStyles={{ marginHorizontal: 5 }}
          textStyles={{ fontSize: 18 }}
          error={error.field === 'title' ? error.msg : null}
        />
        <CustomTextInput
          placeholder="What you want to save?"
          multiline
          numberOfLines={20}
          value={info}
          setValue={setInfo}
          containerStyles={{
            flex: 1,
            marginHorizontal: 5,
            marginVertical: 10,
            borderRadius: 25,
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default NoteEditor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsDark.background2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelBtn: {
    backgroundColor: colorsDark.secondary02,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colorsDark.background2,
  },
  cancelTxt: {
    color: colorsDark.secondary,
  },
  saveBtn: {
    backgroundColor: colorsDark.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colorsDark.secondary,
  },
  saveTxt: {
    color: colorsDark.text1,
  },
});
