import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useGlobalState } from '../contexts/GlobaState';
import { FlatList } from 'react-native-gesture-handler';
import { getData, saveData } from '../utils/storage';
import { NoteI } from '../interfaces/note';
import { ArchivedNoteItem } from '../components/NoteItem';
import { useIsFocused } from '@react-navigation/native';

const ArchiveScreen = () => {
  const isFocused = useIsFocused();
  const { theme } = useGlobalState();
  const [notes, setNotes] = useState<{ [key: string]: NoteI }>({});

  useEffect(() => {
    fetchNotes();
  }, [isFocused]);

  const fetchNotes = () => {
    getData('notes').then((res: { [key: string]: NoteI }) => {
      if (!res) {
        return;
      }
      setNotes(res);
    });
  };

  const recoverNote = (id: string) => {
    Object.values(notes).forEach((note: NoteI) => {
      if (note.id === id) {
        notes[note.id].deleted = false;
      }
    });

    saveData('notes', notes).then(() => {
      fetchNotes();
    });
  };

  const deleteNote = (id: string) => {
    delete notes[id];
    saveData('notes', notes).then(() => {
      fetchNotes();
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <FlatList
        data={
          notes ? Object.values(notes).filter(obj => obj.deleted === true) : []
        }
        ListEmptyComponent={() => (
          <Text style={[styles.empty, { color: theme.colors.text1 }]}>
            Archive is empty.
          </Text>
        )}
        renderItem={({ item, index }) => (
          <ArchivedNoteItem
            key={index}
            item={item}
            animationDelay={150 * (index + 1)}
            onRecover={id => recoverNote(id)}
            onDelete={id => deleteNote(id)}
          />
        )}
      />
    </View>
  );
};

export default ArchiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  empty: {
    textAlign: 'center',
  },
});
