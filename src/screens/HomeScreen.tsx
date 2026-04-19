import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  FlatList,
  ListRenderItemInfo,
  Text,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { NoteI } from '../interfaces/note';
import { getData, saveData } from '../utils/storage';
import { NoteItem } from '../components/NoteItem';
import DeleteModal from '../components/Modals/DeleteModal';
import { useGlobalState } from '../contexts/GlobaState';
import { globalStyles } from '../constants/globalStyles';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamList } from '../routes/MainStackNavigator';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation =
    useNavigation<StackNavigationProp<MainStackNavigatorParamList>>();
  const { theme } = useGlobalState();
  const [notes, setNotes] = useState<{ [key: string]: NoteI }>({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteArr, setDeleteArr] = useState<string[]>([]);
  const [listType, setListType] = useState<'list' | 'grid'>('list');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const btnBgAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    fetchNotes();
    animateScale();
  }, [isFocused]);

  const fetchNotes = async () => {
    const key = await getData('key');
    getData('notes').then((res: { [key: string]: NoteI }) => {
      if (!res) {
        return;
      }
      getData('listType').then(res => {
        if (res === 'grid') {
          setListType('grid');
          Animated.timing(btnBgAnim, {
            toValue: 10,
            duration: 150,
            useNativeDriver: true,
          }).start();
        } else {
          setListType('list');
          Animated.timing(btnBgAnim, {
            toValue: 55,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      });
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

  const deleteItems = async () => {
    const allNotes: { [key: string]: NoteI } = await getData('notes');
    if (deleteArr.length > 0) {
      Object.values(allNotes).forEach((note: NoteI) => {
        if (deleteArr.includes(note.id)) {
          allNotes[note.id].deleted = true;
        }
      });

      await saveData('notes', allNotes).then(() => {
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
  };

  const _renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => (
      <NoteItem
        key={index}
        item={notes[item]}
        animationDelay={(index + 1) * 150}
        deleteMode={deleteMode}
        handleCheckboxMark={markDeleteItem}
        onPress={() => {
          navigation.navigate('NoteEditor', {
            item: notes[item],
            mode: 'update',
            notes,
          });
        }}
        onLongPress={(id: string) => {
          setDeleteMode(true);
          setDeleteArr([id]);
        }}
      />
    ),
    [notes, deleteMode],
  );

  const handleListTypeUpdate = async (type: 'list' | 'grid') => {
    setListType(type);
    if (type === 'grid') {
      Animated.timing(btnBgAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }).start();
      await saveData('listType', 'grid');
    } else {
      Animated.timing(btnBgAnim, {
        toValue: 55,
        duration: 150,
        useNativeDriver: true,
      }).start();
      await saveData('listType', 'list');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.background1,
        },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text1 }]}>Notes</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => handleListTypeUpdate('grid')}>
            <FeatherIcon
              name="grid"
              size={22}
              color={
                listType === 'grid' ? theme.colors.primary : theme.colors.text3
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => handleListTypeUpdate('list')}>
            <FeatherIcon
              name="list"
              size={24}
              color={
                listType === 'list' ? theme.colors.primary : theme.colors.text3
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        key={listType}
        numColumns={listType === 'grid' ? 2 : 1}
        contentContainerStyle={styles.flashlist}
        data={notes ? Object.keys(notes) : []}
        renderItem={_renderItem}
      />
      {deleteMode ? (
        deleteArr.length > 0 ? (
          <Animated.View
            style={[
              styles.floatingBtnContainer,
              globalStyles.shadow,
              {
                transform: [{ scale: scaleAnim }],
                shadowColor: theme.colors.shadowColor2,
                bottom: insets.bottom + 15,
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.floatingBtn,
                { backgroundColor: theme.colors.btn2 },
              ]}
              onPress={() => setShowDeleteModal(true)}>
              <FeatherIcon name="trash" size={32} color={'red'} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.floatingBtnContainer,
              globalStyles.shadow,
              {
                transform: [{ scale: scaleAnim }],
                shadowColor: theme.colors.shadowColor2,
                bottom: insets.bottom + 15,
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.floatingBtn,
                { backgroundColor: theme.colors.btn2 },
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
        <Animated.View
          style={[
            styles.floatingBtnContainer,
            globalStyles.shadow,
            {
              transform: [{ scale: scaleAnim }],
              shadowColor: theme.colors.shadowColor2,
              bottom: insets.bottom + 15,
            },
          ]}>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: theme.colors.btn1 }]}
            onPress={() => {
              animateBounc();
              navigation.navigate('NoteEditor', {
                item: undefined,
                mode: 'create',
                notes: notes,
              });
            }}>
            <FeatherIcon name="plus" size={32} color={theme.colors.btnText1} />
          </TouchableOpacity>
        </Animated.View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerBtns: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: 35,
    marginLeft: 10,
  },
  activeOverlay: {
    position: 'absolute',
    height: 35,
    width: 35,
    borderRadius: 10,
    transform: [{ translateX: 10 }],
  },
  flashlist: {
    paddingBottom: 80,
  },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    height: 64,
    width: 64,
  },
  floatingBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
});
