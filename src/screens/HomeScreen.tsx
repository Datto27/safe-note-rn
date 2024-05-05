import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import NoteEditor from '../components/Modals/NoteEditor';
import { NoteI } from '../interfaces/note';
import { getData, saveData } from '../utils/storage';
import { FlatList } from 'react-native-gesture-handler';
import { NoteItem } from '../components/NoteItem';
import DeleteModal from '../components/Modals/DeleteModal';
import { EditorInfoT } from '../interfaces/editor-info.type';
import { useGlobalState } from '../contexts/GlobaState';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = () => {
  const isFocused = useIsFocused();
  const { theme } = useGlobalState();
  const [notes, setNotes] = useState<{ [key: string]: NoteI }>({});
  const [editorInfo, setEditorInfo] = useState<EditorInfoT>({
    show: false,
    mode: 'create',
    item: undefined,
  });
  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteArr, setDeleteArr] = useState<string[]>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchNotes();
    animateScale();
  }, [isFocused]);

  const fetchNotes = () => {
    getData('notes').then((res: { [key: string]: NoteI }) => {
      if (!res) {
        return;
      }
      const items = Object.values(res)
        .filter(obj => obj.deleted !== true)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .reduce((obj, cur) => ({ ...obj, [cur.id]: cur }), {});
      setNotes(items);
    });
  };

  const markDeleteItem = (id: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      setDeleteArr(state => [...new Set([...state, id])]);
    } else {
      setDeleteArr(state => state.filter(item => item !== id));
    }
  };

  const deleteItems = () => {
    if (deleteArr.length > 0) {
      Object.values(notes).forEach((note: NoteI) => {
        if (deleteArr.includes(note.id)) {
          notes[note.id].deleted = true;
        }
      });

      saveData('notes', notes).then(() => {
        fetchNotes();
      });
    }

    setShowDeleteModal(false);
    setDeleteArr([]);
    setDeleteMode(false);
  };

  const cancelDeletion = () => {
    setShowDeleteModal(false);
    setDeleteArr([]);
    setDeleteMode(false);
  };

  const animateScale = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 0.8,
      bounciness: 0.5,
      useNativeDriver: true,
    }).start();
  };
  const animateBounc = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.5,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        });
      });
    });
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <FlatList
        data={notes ? Object.keys(notes) : []}
        renderItem={({ item, index }) => (
          <NoteItem
            key={index}
            item={notes[item]}
            animationDelay={50 * (index * 2.4 + 1)}
            deleteMode={deleteMode}
            handleCheckboxMark={markDeleteItem}
            onPress={() => {
              setEditorInfo({ show: true, mode: 'update', item: notes[item] });
            }}
            onLongPress={(id: string) => {
              setDeleteMode(true);
              setDeleteArr([id]);
            }}
          />
        )}
      />
      {deleteMode ? (
        deleteArr.length > 0 ? (
          <Animated.View style={[styles.floatingBtnContainer, { transform: [{ scale: scaleAnim}]}]}>
            <TouchableOpacity
              style={[
                styles.floatingBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setShowDeleteModal(true)}>
              <FeatherIcon name="trash" size={32} color={'red'} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.floatingBtnContainer, { transform: [{ scale: scaleAnim}]}]}>
            <TouchableOpacity
              style={[
                styles.floatingBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setDeleteMode(false)}>
              <FeatherIcon
                name="slash"
                size={32}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          </Animated.View>
        )
      ) : (
        <Animated.View style={[styles.floatingBtnContainer, { transform: [{ scale: scaleAnim}]}]}>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: theme.colors.btn1 }]}
            onPress={() => {
              animateBounc();
              setEditorInfo({ show: true, mode: 'create', item: undefined })
            }}>
            <FeatherIcon name="plus" size={32} color={theme.colors.btnText1} />
          </TouchableOpacity>
        </Animated.View>
      )}
      <NoteEditor
        mode={editorInfo.mode}
        item={editorInfo.item}
        visible={editorInfo.show}
        notes={notes}
        setVisible={val =>
          setEditorInfo(state => ({ ...state, show: val, item: undefined }))
        }
        cb={fetchNotes}
        showDeleteModal={(id: string) => {
          setEditorInfo(state => ({ ...state, show: false, item: undefined }));
          setDeleteArr([id]);
          setShowDeleteModal(true);
        }}
      />
      <DeleteModal
        visible={showDeleteModal}
        text="Do you want to delete this note?"
        deleteCb={deleteItems}
        cancelCb={cancelDeletion}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
  },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    height: 60,
    width: 60,
  },
  floatingBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
});
