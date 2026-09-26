import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ReminderI } from '../interfaces/reminder';
import { getData, saveData } from '../utils/storage';
import { decryptData, encryptData } from '../utils/encrypt.private';
import {
  cancelReminder,
  scheduleReminder,
} from '../utils/notifications';
import ReminderEditorModal, {
  ReminderDraft,
} from '../components/Modals/ReminderEditorModal';
import { useGlobalState } from '../contexts/GlobaState';
import {
  globalStyles,
  isFlatTheme,
  SCREEN_PADDING,
} from '../constants/globalStyles';
import { parseTime } from '../utils/time';

const newId = () => Math.random().toString(16).slice(2);

const dayKey = (input: Date | string): string => {
  const d = new Date(input);
  return `${d.getFullYear()}-${parseTime(d.getMonth() + 1)}-${parseTime(
    d.getDate(),
  )}`;
};

const RemindersScreen = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { theme } = useGlobalState();

  const [reminders, setReminders] = useState<{ [key: string]: ReminderI }>({});
  const [ekey, setEkey] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(dayKey(new Date()));

  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'update'>('create');
  const [editing, setEditing] = useState<ReminderI | undefined>(undefined);
  const [createDate, setCreateDate] = useState<string | undefined>(undefined);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchReminders();
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 0.8,
      bounciness: 0.5,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const fetchReminders = async () => {
    const k = await getData('key');
    setEkey(k);
    const res: { [key: string]: ReminderI } = await getData('reminders');
    if (!res) {
      setReminders({});
      return;
    }
    const items = (Object.values(res) as ReminderI[])
      .filter(r => r.deleted !== true)
      .reduce((obj, cur) => ({ ...obj, [cur.id]: cur }), {});
    setReminders(items);
  };

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    Object.values(reminders).forEach(r => {
      const key = dayKey(r.triggerAt);
      marks[key] = {
        ...marks[key],
        marked: true,
        dotColor: theme.colors.primary,
      };
    });
    marks[selectedDay] = {
      ...marks[selectedDay],
      selected: true,
      selectedColor: theme.colors.primary,
    };
    return marks;
  }, [reminders, selectedDay, theme]);

  const dayReminders = useMemo(
    () =>
      Object.values(reminders)
        .filter(r => dayKey(r.triggerAt) === selectedDay)
        .sort(
          (a, b) =>
            new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime(),
        ),
    [reminders, selectedDay],
  );

  const openCreate = () => {
    const d = new Date(`${selectedDay}T00:00:00`);
    const now = new Date();
    d.setHours(now.getHours() + 1, 0, 0, 0);
    setCreateDate(d.toISOString());
    setEditing(undefined);
    setEditorMode('create');
    setEditorVisible(true);
  };

  const openEdit = (reminder: ReminderI) => {
    const decryptedNote = reminder.note
      ? ekey
        ? decryptData(reminder.note, ekey) ?? reminder.note
        : reminder.note
      : '';
    setEditing({ ...reminder, note: decryptedNote });
    setEditorMode('update');
    setEditorVisible(true);
  };

  const handleSave = async (draft: ReminderDraft) => {
    const all: { [key: string]: ReminderI } = (await getData('reminders')) || {};
    const encNote = draft.note
      ? ekey
        ? encryptData(draft.note, ekey)
        : draft.note
      : '';
    const id = editorMode === 'update' && editing ? editing.id : newId();

    // Cancel any previously scheduled notification before rescheduling
    await cancelReminder(all[id]?.notificationId || id);

    const reminder: ReminderI = {
      ...all[id],
      id,
      title: draft.title,
      note: encNote,
      triggerAt: draft.triggerAt,
      repeat: draft.repeat,
      completed: false,
      createdAt: all[id]?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    reminder.notificationId = await scheduleReminder(reminder);

    all[id] = reminder;
    await saveData('reminders', all);
    setEditorVisible(false);
    setEditing(undefined);
    setSelectedDay(dayKey(reminder.triggerAt));
    fetchReminders();
  };

  const handleDelete = async () => {
    if (!editing) return;
    const all: { [key: string]: ReminderI } = await getData('reminders');
    if (all && all[editing.id]) {
      await cancelReminder(all[editing.id].notificationId || editing.id);
      all[editing.id].deleted = true;
      await saveData('reminders', all);
    }
    setEditorVisible(false);
    setEditing(undefined);
    fetchReminders();
  };

  const handleToggleComplete = async (id: string) => {
    const all: { [key: string]: ReminderI } = await getData('reminders');
    if (!all || !all[id]) return;
    const completed = !all[id].completed;
    all[id].completed = completed;
    all[id].updatedAt = new Date();
    if (completed) {
      await cancelReminder(all[id].notificationId || id);
    } else {
      all[id].notificationId = await scheduleReminder(all[id]);
    }
    await saveData('reminders', all);
    fetchReminders();
  };

  const renderReminder = ({ item }: { item: ReminderI }) => {
    const time = new Date(item.triggerAt);
    return (
      <TouchableOpacity
        style={[
          styles.reminderRow,
          !isFlatTheme(theme.type) && globalStyles.shadow,
          {
            backgroundColor: theme.colors.secondary05,
            shadowColor: theme.colors.shadowColor1,
          },
        ]}
        onPress={() => openEdit(item)}>
        <BouncyCheckbox
          size={26}
          fillColor={theme.colors.primary}
          unFillColor={theme.colors.background2_09}
          iconStyle={{ borderColor: theme.colors.primary }}
          isChecked={!!item.completed}
          useBuiltInState={false}
          disableText
          style={styles.completeBox}
          onPress={() => handleToggleComplete(item.id)}
        />
        <View style={styles.reminderCenter}>
          <Text
            numberOfLines={1}
            style={[
              styles.reminderTitle,
              { color: theme.colors.text1 },
              item.completed && styles.completed,
              item.completed && { color: theme.colors.text3 },
            ]}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <FeatherIcon name="clock" size={12} color={theme.colors.text3} />
            <Text style={[styles.metaText, { color: theme.colors.text3 }]}>
              {parseTime(time.getHours())}:{parseTime(time.getMinutes())}
            </Text>
            {item.repeat && item.repeat !== 'none' ? (
              <View
                style={[
                  styles.repeatBadge,
                  { backgroundColor: theme.colors.primary02 },
                ]}>
                <FeatherIcon
                  name="repeat"
                  size={10}
                  color={theme.colors.primary}
                />
                <Text style={[styles.repeatText, { color: theme.colors.primary }]}>
                  {item.repeat}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text1 }]}>
          Reminders
        </Text>
      </View>

      <FlatList
        style={styles.flex}
        data={dayReminders}
        keyExtractor={item => item.id}
        renderItem={renderReminder}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.calendarWrap}>
            <Calendar
              key={theme.type}
              current={selectedDay}
              onDayPress={day => setSelectedDay(day.dateString)}
              markedDates={markedDates}
              theme={{
                calendarBackground: theme.colors.background1,
                monthTextColor: theme.colors.text1,
                dayTextColor: theme.colors.text1,
                textDisabledColor: theme.colors.text3,
                todayTextColor: theme.colors.primary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#ffffff',
                arrowColor: theme.colors.primary,
                dotColor: theme.colors.primary,
                selectedDotColor: '#ffffff',
                textSectionTitleColor: theme.colors.text3,
              }}
            />
            <Text style={[styles.dayHeading, { color: theme.colors.text2 }]}>
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <FeatherIcon name="bell-off" size={40} color={theme.colors.text3} />
            <Text style={[styles.emptyText, { color: theme.colors.text3 }]}>
              No reminders for this day.
            </Text>
          </View>
        }
      />

      <Animated.View
        style={[
          styles.floatingBtnContainer,
          !isFlatTheme(theme.type) && globalStyles.shadow,
          {
            transform: [{ scale: scaleAnim }],
            shadowColor: theme.colors.shadowColor2,
            bottom: insets.bottom + 20,
          },
        ]}>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: theme.colors.btn1 }]}
          onPress={openCreate}>
          <FeatherIcon name="plus" size={32} color={theme.colors.btnText1} />
        </TouchableOpacity>
      </Animated.View>

      <ReminderEditorModal
        visible={editorVisible}
        mode={editorMode}
        reminder={editing}
        initialDate={createDate}
        onClose={() => {
          setEditorVisible(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  );
};

export default RemindersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    marginHorizontal: SCREEN_PADDING,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 100,
  },
  calendarWrap: {
    marginBottom: 8,
  },
  dayHeading: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
    marginHorizontal: SCREEN_PADDING,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: SCREEN_PADDING,
    marginVertical: 4,
    borderRadius: 20,
  },
  completeBox: {
    width: 30,
  },
  reminderCenter: {
    flex: 1,
    marginLeft: 4,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 8,
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  repeatText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
    textTransform: 'capitalize',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  floatingBtnContainer: {
    position: 'absolute',
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
