import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useGlobalState } from '../contexts/GlobaState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import { getData, saveData } from '../utils/storage';
import { NoteI } from '../interfaces/note';
import { ArchivedNoteItem } from '../components/NoteItem';
import { useIsFocused } from '@react-navigation/native';

const ArchiveScreen = () => {
  const insets = useSafeAreaInsets();
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
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background1,
          paddingBottom: insets.bottom,
        },
      ]}>
      <FlatList
        data={
          notes ? Object.values(notes).filter(obj => obj.deleted === true) : []
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <FeatherIcon name="archive" size={48} color={theme.colors.text3} style={{ marginBottom: 16 }} />
            <Text style={[styles.empty, { color: theme.colors.text2 }]}>
              Your archive is empty
            </Text>
          </View>
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
  },
  emptyContainer: {
    flex: 1,
    height: 400, // Approximate height for centering in empty list
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
