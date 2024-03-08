import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colorsDark } from '../constants/colors';
import NoteEditor, { EditorModeT } from '../components/Modals/NoteEditor';
import { NoteI } from '../interfaces/note';
import { getData } from '../utils/storage';
import { FlatList } from 'react-native-gesture-handler';
import NoteItem from '../components/NoteItem';

type EditorInfoT = {
  show: boolean;
  mode: EditorModeT;
  item: undefined | NoteI;
};

const HomeScreen = () => {
  const [notes, setNotes] = useState<{ [key: string]: NoteI }>({});
  const [editorInfo, setEditorInfo] = useState<EditorInfoT>({
    show: false,
    mode: 'create',
    item: undefined,
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    getData('notes').then(res => {
      setNotes(res);
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notes ? Object.keys(notes) : []}
        renderItem={({ item, index }) => (
          <NoteItem
            key={index}
            item={notes[item]}
            onPress={() => {
              setEditorInfo({ show: true, mode: 'update', item: notes[item] });
            }}
          />
        )}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          setEditorInfo({ show: true, mode: 'create', item: undefined })
        }>
        <FeatherIcon name="plus" size={32} color={colorsDark.text1} />
      </TouchableOpacity>
      <NoteEditor
        mode={editorInfo.mode}
        item={editorInfo.item}
        visible={editorInfo.show}
        setVisible={val =>
          setEditorInfo(state => ({ ...state, show: val, item: undefined }))
        }
        cb={fetchNotes}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsDark.background1,
    paddingTop: 5,
  },
  addBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsDark.primary,
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
});
