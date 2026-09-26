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
import TextButton from '../Buttons/TextButton';
import { useGlobalState } from '../../contexts/GlobaState';
import { ReminderI, ReminderRepeat } from '../../interfaces/reminder';
import { parseTime } from '../../utils/time';
import ModalCard from './ModalCard';
import { dangerColor } from '../../constants/colors';

export type ReminderDraft = {
  title: string;
  note: string;
  triggerAt: string; // ISO
  repeat: ReminderRepeat;
};

type Props = {
  visible: boolean;
  mode: 'create' | 'update';
  // reminder.note is expected already decrypted by the caller
  reminder?: ReminderI;
  initialDate?: string; // ISO, used to preselect the day tapped in the calendar
  onClose: () => void;
  onSave: (draft: ReminderDraft) => void;
  onDelete?: () => void;
};

const REPEATS: ReminderRepeat[] = ['none', 'daily', 'weekly'];

const defaultDate = (iso?: string): Date => {
  if (iso) return new Date(iso);
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
};

const ReminderEditorModal = ({
  visible,
  mode,
  reminder,
  initialDate,
  onClose,
  onSave,
  onDelete,
}: Props) => {
  const { theme } = useGlobalState();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(defaultDate());
  const [repeat, setRepeat] = useState<ReminderRepeat>('none');
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(reminder?.title ?? '');
      setNote(reminder?.note ?? '');
      setDate(defaultDate(reminder?.triggerAt ?? initialDate));
      setRepeat(reminder?.repeat ?? 'none');
      setPicker(null);
      setError(false);
    }
  }, [visible, reminder, initialDate]);

  const handleSave = () => {
    if (!title.trim()) {
      setError(true);
      return;
    }
    onSave({
      title: title.trim(),
      note,
      triggerAt: date.toISOString(),
      repeat,
    });
  };

  const onPickerChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPicker(null);
    }
    if (event.type === 'dismissed' || !selected) return;
    const next = new Date(date);
    if (picker === 'date') {
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
    } else {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    setDate(next);
  };

  const inPast = date.getTime() <= Date.now() && repeat === 'none';

  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      icon="bell"
      title={mode === 'create' ? 'New Reminder' : 'Edit Reminder'}
      subtitle="You'll get a notification at the chosen time"
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
        placeholder="Reminder title"
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
        numberOfLines={3}
        value={note}
        setValue={setNote}
        containerStyles={{ marginBottom: 16, minHeight: 80 }}
      />

      <Text style={[styles.label, { color: theme.colors.text2 }]}>When</Text>
      <View style={styles.whenRow}>
        <TouchableOpacity
          style={[
            styles.whenBtn,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={() => setPicker('date')}>
          <FeatherIcon name="calendar" size={18} color={theme.colors.text2} />
          <Text style={[styles.whenText, { color: theme.colors.text1 }]}>
            {date.toLocaleDateString('en-US')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.whenBtn,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={() => setPicker('time')}>
          <FeatherIcon name="clock" size={18} color={theme.colors.text2} />
          <Text style={[styles.whenText, { color: theme.colors.text1 }]}>
            {parseTime(date.getHours())}:{parseTime(date.getMinutes())}
          </Text>
        </TouchableOpacity>
      </View>
      {inPast ? (
        <Text style={styles.warn}>
          This time is in the past — it won't fire unless repeating.
        </Text>
      ) : null}

      {picker && (
        <View>
          <DateTimePicker
            value={date}
            mode={picker}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange}
          />
          {Platform.OS === 'ios' && (
            <TextButton
              text="Done"
              onPress={() => setPicker(null)}
              style={styles.iosDone}
            />
          )}
        </View>
      )}

      <Text style={[styles.label, { color: theme.colors.text2 }]}>Repeat</Text>
      <View style={styles.repeatRow}>
        {REPEATS.map(r => {
          const active = repeat === r;
          return (
            <TouchableOpacity
              key={r}
              style={[
                styles.repeatChip,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: active
                    ? theme.colors.primary
                    : 'transparent',
                },
              ]}
              onPress={() => setRepeat(r)}>
              <Text
                style={[
                  styles.repeatText,
                  { color: active ? '#ffffff' : theme.colors.text2 },
                ]}>
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ModalCard>
  );
};

export default ReminderEditorModal;

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  whenRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  whenBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  whenText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
  warn: {
    color: '#f59e0b',
    fontSize: 12,
    marginBottom: 12,
  },
  iosDone: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  repeatRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 24,
  },
  repeatChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  repeatText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
