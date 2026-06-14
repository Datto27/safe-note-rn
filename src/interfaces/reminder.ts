export type ReminderRepeat = 'none' | 'daily' | 'weekly';

export interface ReminderI {
  id: string;
  title: string; // plaintext (shown in the OS notification)
  note?: string; // encrypted at rest
  triggerAt: string; // ISO datetime the notification fires
  repeat?: ReminderRepeat;
  notificationId?: string; // Notifee trigger id, kept so we can cancel/reschedule
  completed?: boolean;
  deleted?: boolean; // soft delete
  createdAt: Date;
  updatedAt: Date;
}
