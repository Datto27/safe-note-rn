import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomTextInput from '../Inputs/CustomTextInput';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';
import { useGlobalState } from '../../contexts/GlobaState';
import { TaskI } from '../../interfaces/task';
import ModalCard from './ModalCard';
import { dangerColor } from '../../constants/colors';

export type TaskDraft = {
  title: string;
  note: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
};

type Props = {
  visible: boolean;
  mode: 'create' | 'update';
  // task.note is expected already decrypted by the caller
  task?: TaskI;
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
  onDelete?: () => void;
};

const PRIORITIES: TaskDraft['priority'][] = ['low', 'medium', 'high'];

export const priorityColor = (
  priority: TaskI['priority'],
  fallback: string,
): string => {
  switch (priority) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#22c55e';
    default:
      return fallback;
  }
};

const TaskEditorModal = ({
  visible,
  mode,
  task,
  onClose,
  onSave,
  onDelete,
}: Props) => {
  const { theme } = useGlobalState();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<TaskDraft['priority']>('low');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(task?.title ?? '');
      setNote(task?.note ?? '');
      setPriority(task?.priority ?? 'low');
      setDueDate(task?.dueDate);
      setError(false);
    }
  }, [visible, task]);

  const handleSave = () => {
    if (!title.trim()) {
      setError(true);
      return;
    }
    onSave({ title: title.trim(), note, priority, dueDate });
  };

  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      icon="check-square"
      title={mode === 'create' ? 'New Task' : 'Edit Task'}
      subtitle="Set a priority and an optional due date"
      headerAction={
        mode === 'update' && onDelete ? (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <FeatherIcon name="trash-2" size={20} color={dangerColor} />
          </TouchableOpacity>
        ) : undefined
      }
      footer={
        <>
          <SecondaryButton text="Cancel" onPress={onClose} />
          <PrimaryButton
            text={mode === 'create' ? 'Add' : 'Save'}
            onPress={handleSave}
          />
        </>
      }>
      <CustomTextInput
        placeholder="Task title"
        value={title}
        setValue={txt => {
          setTitle(txt);
          if (error) setError(false);
        }}
        error={error ? 'Title is required' : null}
        containerStyles={{ marginBottom: 16 }}
      />

      <CustomTextInput
        placeholder="Notes (optional)"
        multiline
        numberOfLines={4}
        value={note}
        setValue={setNote}
        containerStyles={{ marginBottom: 16, minHeight: 90 }}
      />

      <Text style={[styles.label, { color: theme.colors.text2 }]}>
        Priority
      </Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map(p => {
          const active = priority === p;
          const color = priorityColor(p, theme.colors.text3);
          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityChip,
                {
                  borderColor: color,
                  backgroundColor: active ? color : 'transparent',
                },
              ]}
              onPress={() => setPriority(p)}>
              <Text
                style={[
                  styles.priorityText,
                  { color: active ? '#ffffff' : color },
                ]}>
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.colors.text2 }]}>
        Due date
      </Text>
      <View style={styles.dueRow}>
        <TouchableOpacity
          style={[
            styles.dueBtn,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={() => setShowPicker(true)}>
          <FeatherIcon name="calendar" size={18} color={theme.colors.text2} />
          <Text style={[styles.dueText, { color: theme.colors.text1 }]}>
            {dueDate
              ? new Date(dueDate).toLocaleDateString('en-US')
              : 'No due date'}
          </Text>
        </TouchableOpacity>
        {dueDate ? (
          <TouchableOpacity onPress={() => setDueDate(undefined)}>
            <FeatherIcon name="x" size={20} color={theme.colors.text3} />
          </TouchableOpacity>
        ) : null}
      </View>

      {showPicker && (
        <DateTimePicker
          value={dueDate ? new Date(dueDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (event.type === 'set' && date) {
              setDueDate(date.toISOString());
            }
          }}
        />
      )}
    </ModalCard>
  );
};

export default TaskEditorModal;

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  dueText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
});
