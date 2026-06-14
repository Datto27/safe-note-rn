import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { TaskI } from '../interfaces/task';
import { getData, saveData } from '../utils/storage';
import { decryptData, encryptData } from '../utils/encrypt.private';
import { TaskItem } from '../components/TaskItem';
import TaskEditorModal, { TaskDraft } from '../components/Modals/TaskEditorModal';
import DeleteModal from '../components/Modals/DeleteModal';
import { useGlobalState } from '../contexts/GlobaState';
import { globalStyles } from '../constants/globalStyles';

const newId = () => Math.random().toString(16).slice(2);

const TodoScreen = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { theme } = useGlobalState();

  const [tasks, setTasks] = useState<{ [key: string]: TaskI }>({});
  const [ekey, setEkey] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState('');

  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'update'>('create');
  const [editingTask, setEditingTask] = useState<TaskI | undefined>(undefined);

  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteArr, setDeleteArr] = useState<string[]>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTasks();
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 0.8,
      bounciness: 0.5,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const fetchTasks = async () => {
    const k = await getData('key');
    setEkey(k);
    const res: { [key: string]: TaskI } = await getData('tasks');
    if (!res) {
      setTasks({});
      return;
    }
    const items = (Object.values(res) as TaskI[])
      .filter(t => t.deleted !== true)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .reduce((obj, cur) => ({ ...obj, [cur.id]: cur }), {});
    setTasks(items);
  };

  const handleQuickAdd = async () => {
    const title = quickAdd.trim();
    if (!title) return;
    const all: { [key: string]: TaskI } = (await getData('tasks')) || {};
    const id = newId();
    all[id] = {
      id,
      title,
      completed: false,
      priority: 'low',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await saveData('tasks', all);
    setQuickAdd('');
    fetchTasks();
  };

  const handleToggleComplete = async (id: string) => {
    const all: { [key: string]: TaskI } = await getData('tasks');
    if (!all || !all[id]) return;
    all[id] = {
      ...all[id],
      completed: !all[id].completed,
      updatedAt: new Date(),
    };
    await saveData('tasks', all);
    fetchTasks();
  };

  const openEditor = (task: TaskI) => {
    const decryptedNote = task.note
      ? ekey
        ? decryptData(task.note, ekey) ?? task.note
        : task.note
      : '';
    setEditingTask({ ...task, note: decryptedNote });
    setEditorMode('update');
    setEditorVisible(true);
  };

  const handleSaveTask = async (draft: TaskDraft) => {
    const all: { [key: string]: TaskI } = (await getData('tasks')) || {};
    const encNote = draft.note
      ? ekey
        ? encryptData(draft.note, ekey)
        : draft.note
      : '';
    if (editorMode === 'update' && editingTask) {
      all[editingTask.id] = {
        ...all[editingTask.id],
        title: draft.title,
        note: encNote,
        priority: draft.priority,
        dueDate: draft.dueDate,
        updatedAt: new Date(),
      };
    } else {
      const id = newId();
      all[id] = {
        id,
        title: draft.title,
        note: encNote,
        priority: draft.priority,
        dueDate: draft.dueDate,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    await saveData('tasks', all);
    setEditorVisible(false);
    setEditingTask(undefined);
    fetchTasks();
  };

  const handleDeleteFromEditor = async () => {
    if (!editingTask) return;
    const all: { [key: string]: TaskI } = await getData('tasks');
    if (all && all[editingTask.id]) {
      all[editingTask.id].deleted = true;
      await saveData('tasks', all);
    }
    setEditorVisible(false);
    setEditingTask(undefined);
    fetchTasks();
  };

  const markDeleteItem = (id: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      setDeleteArr(state => [...new Set([...state, id])]);
    } else {
      setDeleteArr(state => state.filter(item => item !== id));
    }
  };

  const deleteItems = async () => {
    const all: { [key: string]: TaskI } = await getData('tasks');
    if (all && deleteArr.length > 0) {
      deleteArr.forEach(id => {
        if (all[id]) all[id].deleted = true;
      });
      await saveData('tasks', all);
      fetchTasks();
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

  const _renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => (
      <TaskItem
        item={tasks[item]}
        animationDelay={(index + 1) * 100}
        deleteMode={deleteMode}
        onToggleComplete={handleToggleComplete}
        handleCheckboxMark={markDeleteItem}
        onPress={() => {
          if (!deleteMode) openEditor(tasks[item]);
        }}
        onLongPress={(id: string) => {
          setDeleteMode(true);
          setDeleteArr([id]);
        }}
      />
    ),
    [tasks, deleteMode, ekey],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}>
        <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text1 }]}>Tasks</Text>
        {deleteMode ? (
          <TouchableOpacity onPress={cancelDeletion}>
            <FeatherIcon name="x" size={26} color={theme.colors.text1} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        style={styles.flex}
        contentContainerStyle={styles.list}
        data={Object.keys(tasks)}
        keyExtractor={item => item}
        renderItem={_renderItem}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <FeatherIcon
              name="check-circle"
              size={48}
              color={theme.colors.text3}
            />
            <Text style={[styles.emptyText, { color: theme.colors.text3 }]}>
              No tasks yet. Add one below.
            </Text>
          </View>
        }
      />

      {deleteMode && deleteArr.length > 0 ? (
        <Animated.View
          style={[
            styles.floatingBtnContainer,
            globalStyles.shadow,
            {
              transform: [{ scale: scaleAnim }],
              shadowColor: theme.colors.shadowColor2,
              bottom: insets.bottom + 80,
            },
          ]}>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: theme.colors.btn2 }]}
            onPress={() => setShowDeleteModal(true)}>
            <FeatherIcon name="trash" size={30} color={'red'} />
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      <View
        style={[
          styles.quickAddRow,
          {
            backgroundColor: theme.colors.background2,
            borderColor: theme.colors.modalBorder,
            paddingBottom: insets.bottom + 10,
          },
        ]}>
        <TextInput
          style={[styles.quickAddInput, { color: theme.colors.inputText }]}
          placeholder="Add a task…"
          placeholderTextColor={theme.colors.text3}
          value={quickAdd}
          onChangeText={setQuickAdd}
          onSubmitEditing={handleQuickAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.quickAddBtn, { backgroundColor: theme.colors.btn1 }]}
          onPress={handleQuickAdd}>
          <FeatherIcon name="plus" size={26} color={theme.colors.btnText1} />
        </TouchableOpacity>
      </View>

      </KeyboardAvoidingView>

      <TaskEditorModal
        visible={editorVisible}
        mode={editorMode}
        task={editingTask}
        onClose={() => {
          setEditorVisible(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteFromEditor}
      />

      <DeleteModal
        visible={showDeleteModal}
        text="Delete the selected tasks?"
        deleteCb={deleteItems}
        cancelCb={cancelDeletion}
      />
    </View>
  );
};

export default TodoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  floatingBtnContainer: {
    position: 'absolute',
    right: 24,
    height: 60,
    width: 60,
    zIndex: 99,
  },
  floatingBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  quickAddInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'JosefinSans-Medium',
    paddingVertical: 10,
    marginRight: 12,
  },
  quickAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
