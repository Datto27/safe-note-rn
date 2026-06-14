import {
  Modal,
  Platform,
  SafeAreaView,
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
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.modalBg }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background2,
              borderColor: theme.colors.modalBorder,
            },
          ]}>
          <View style={styles.headerRow}>
            <Text style={[styles.heading, { color: theme.colors.text1 }]}>
              {mode === 'create' ? 'New reminder' : 'Edit reminder'}
            </Text>
            {mode === 'update' && onDelete ? (
              <TouchableOpacity onPress={onDelete}>
                <FeatherIcon name="trash-2" size={22} color="red" />
              </TouchableOpacity>
            ) : null}
          </View>

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

          <Text style={[styles.label, { color: theme.colors.text2 }]}>
            When
          </Text>
          <View style={styles.whenRow}>
            <TouchableOpacity
              style={[styles.whenBtn, { borderColor: theme.colors.primary05 }]}
              onPress={() => setPicker('date')}>
              <FeatherIcon
                name="calendar"
                size={18}
                color={theme.colors.text2}
              />
              <Text style={[styles.whenText, { color: theme.colors.text1 }]}>
                {date.toLocaleDateString('en-US')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.whenBtn, { borderColor: theme.colors.primary05 }]}
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

          <Text style={[styles.label, { color: theme.colors.text2 }]}>
            Repeat
          </Text>
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

          <View style={styles.actions}>
            <SecondaryButton text="Cancel" onPress={onClose} />
            <PrimaryButton
              text={mode === 'create' ? 'Add' : 'Save'}
              onPress={handleSave}
              containerStyle={styles.saveBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ReminderEditorModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
  },
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
});
