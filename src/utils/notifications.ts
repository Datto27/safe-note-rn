import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { ReminderI, ReminderRepeat } from '../interfaces/reminder';

export const REMINDER_CHANNEL_ID = 'reminders';
// Android resolves this to android/app/src/main/res/raw/reminder.<ext>.
// iOS uses the bundled `reminder.wav` (falls back to the default sound if absent).
const REMINDER_SOUND_ANDROID = 'reminder';
const REMINDER_SOUND_IOS = 'reminder.wav';

/** Prompts for notification permission (Android 13+ runtime + iOS). */
export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

/** Creates the high-importance reminder channel (Android no-op on iOS). */
export const ensureReminderChannel = async (): Promise<void> => {
  await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'Reminders',
    importance: AndroidImportance.HIGH,
    sound: REMINDER_SOUND_ANDROID,
    vibration: true,
  });
};

const toRepeatFrequency = (
  repeat?: ReminderRepeat,
): RepeatFrequency | undefined => {
  switch (repeat) {
    case 'daily':
      return RepeatFrequency.DAILY;
    case 'weekly':
      return RepeatFrequency.WEEKLY;
    default:
      return undefined;
  }
};

/**
 * Schedules a local notification for the reminder. Uses the reminder's own id as
 * the notification id so it can be cancelled/rescheduled deterministically.
 * Returns the notification id, or undefined if a one-off reminder is in the past.
 */
export const scheduleReminder = async (
  reminder: ReminderI,
): Promise<string | undefined> => {
  const timestamp = new Date(reminder.triggerAt).getTime();
  const repeatFrequency = toRepeatFrequency(reminder.repeat);

  if (!repeatFrequency && timestamp <= Date.now()) {
    return undefined;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    repeatFrequency,
    alarmManager: { allowWhileIdle: true },
  };

  const id = await notifee.createTriggerNotification(
    {
      id: reminder.id,
      title: reminder.title,
      body:
        reminder.repeat && reminder.repeat !== 'none'
          ? `Repeats ${reminder.repeat}`
          : 'Reminder',
      android: {
        channelId: REMINDER_CHANNEL_ID,
        sound: REMINDER_SOUND_ANDROID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
      },
      ios: {
        sound: REMINDER_SOUND_IOS,
      },
    },
    trigger,
  );

  return id;
};

/** Cancels a pending/scheduled reminder notification. */
export const cancelReminder = async (
  notificationId?: string,
): Promise<void> => {
  if (!notificationId) return;
  await notifee.cancelTriggerNotification(notificationId);
};
