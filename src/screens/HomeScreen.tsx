import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colorsDark } from '../constants/colors';
import NoteEditor, { EditorModeT } from '../components/Modals/NoteEditor';
import { NoteI } from '../interfaces/note';
import { getData, saveData } from '../utils/storage';
import { FlatList } from 'react-native-gesture-handler';
import NoteItem from '../components/NoteItem';
import DeleteModal from '../components/Modals/DeleteModal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const idForDelete = useRef<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    getData('notes').then((res: { [key: string]: NoteI }) => {
      const items = Object.values(res)
        .filter(obj => obj.deleted !== true)
        .reduce((obj, cur) => ({ ...obj, [cur.id]: cur }), {});
      setNotes(items);
    });
  };

  const deleteItem = () => {
    if (idForDelete) {
      // delete notes[`${idForDelete.current}`];
      notes[`${idForDelete.current}`].deleted = true;
      saveData('notes', notes).then(() => {
        fetchNotes();
      });
    }

    idForDelete.current = null;
    setShowDeleteModal(false);
  };

  const cancelDeletion = () => {
    idForDelete.current = null;
    setShowDeleteModal(false);
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
            onLongPress={id => {
              idForDelete.current = id;
              setShowDeleteModal(true);
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
      <DeleteModal
        visible={showDeleteModal}
        text="Do you want to delete this note?"
        deleteCb={deleteItem}
        cancelCb={cancelDeletion}
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
