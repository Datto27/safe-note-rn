import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getData, saveDataOrThrow } from '../../utils/storage';
import { useGlobalState } from '../../contexts/GlobaState';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';
import CustomTextInput from '../Inputs/CustomTextInput';
import {
  BackupPayload,
  buildBackup,
  mergeById,
  parseBackup,
  rewrapSecrets,
} from '../../utils/backup';
import { ReminderI } from '../../interfaces/reminder';
import { cancelReminder, scheduleReminder } from '../../utils/notifications';

type Props = {
  visible: boolean;
  type: string | null;
  onClose: () => void;
};

const DataReviewModal = ({ visible, type, onClose }: Props) => {
  const { theme } = useGlobalState();
  const [backup, setBackup] = useState<BackupPayload | null>(null);
  const [key, setKey] = useState('');
  const [newData, setNewData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Refs, not plain locals: a local would belong to the render that scheduled
  // it, so the cleanup below would clear a different (stale) timer id.
  const closeTo = useRef<NodeJS.Timeout | undefined>(undefined);
  const doneTo = useRef<NodeJS.Timeout | undefined>(undefined);

  const isExport = type === 'export';

  useEffect(() => {
    if (visible) {
      Promise.all([
        getData('notes'),
        getData('tasks'),
        getData('reminders'),
        getData('key'),
      ]).then(([notes, tasks, reminders, localKey]) => {
        setBackup(buildBackup({ notes, tasks, reminders }, localKey));
      });
    }
    return () => {
      clearTimeout(closeTo.current);
      clearTimeout(doneTo.current);
      setIsLoading(false);
      setCopied(false);
      setError(null);
      setKey('');
      setNewData('');
    };
  }, [visible]);

  const finishWithSuccess = () => {
    setIsLoading(false);
    setCopied(true);
    closeTo.current = setTimeout(onClose, 600);
  };

  const copyToClipboard = () => {
    if (!backup) {
      return;
    }
    setIsLoading(true);
    Clipboard.setString(JSON.stringify(backup));
    doneTo.current = setTimeout(finishWithSuccess, 1000);
  };

  /**
   * Imported reminders point at notification ids that only ever existed on the
   * device that made the backup, so each one is re-armed here. Without this
   * they would show up in the list and simply never fire.
   */
  const rescheduleReminders = async (reminders: {
    [id: string]: ReminderI;
  }) => {
    for (const reminder of Object.values(reminders)) {
      await cancelReminder(reminder.notificationId || reminder.id);
      if (reminder.deleted || reminder.completed) {
        reminder.notificationId = undefined;
        continue;
      }
      reminder.notificationId = await scheduleReminder(reminder);
    }
  };

  const saveImport = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const parsed = parseBackup(newData);
      if (!parsed.ok) {
        setError(parsed.error);
        setIsLoading(false);
        return;
      }

      const localKey = await getData('key');
      const rewrapped = rewrapSecrets(parsed.payload, key, localKey);
      if (!rewrapped.ok) {
        setError(rewrapped.error);
        setIsLoading(false);
        return;
      }
      const incoming = rewrapped.collections;

      // Merge against storage, not against the filtered copy shown on screen -
      // that one drops every soft-deleted item and importing would wipe them.
      const [notes, tasks, reminders] = await Promise.all([
        getData('notes'),
        getData('tasks'),
        getData('reminders'),
      ]);

      const mergedReminders = mergeById(reminders, incoming.reminders);
      await rescheduleReminders(
        Object.keys(incoming.reminders)
          .filter(id => mergedReminders[id] === incoming.reminders[id])
          .reduce(
            (obj, id) => ({ ...obj, [id]: mergedReminders[id] }),
            {} as { [id: string]: ReminderI },
          ),
      );

      await Promise.all([
        saveDataOrThrow('notes', mergeById(notes, incoming.notes)),
        saveDataOrThrow('tasks', mergeById(tasks, incoming.tasks)),
        saveDataOrThrow('reminders', mergedReminders),
      ]);
      finishWithSuccess();
    } catch (err) {
      // Surface the real cause (a storage write failure, a malformed item
      // that slipped past parseBackup, etc.) instead of a generic message -
      // otherwise there's no way to tell what actually went wrong.
      const message = err instanceof Error ? err.message : String(err);
      setError(`Import failed: ${message}`);
      setIsLoading(false);
    }
  };

  const btnIcon = (idleIcon: string) =>
    isLoading ? (
      <ActivityIndicator
        color={theme.colors.btnText1}
        size={'small'}
        style={{ marginRight: 10 }}
      />
    ) : copied ? (
      <FeatherIcon name="check" color={'#4ade80'} style={{ marginRight: 5 }} />
    ) : (
      <FeatherIcon
        name={idleIcon}
        color={theme.colors.btnText1}
        style={{ marginRight: 5 }}
      />
    );

  const Badge = ({
    icon,
    label,
    strong,
  }: {
    icon: string;
    label: string;
    strong?: boolean;
  }) => (
    <View
      style={[
        styles.badge,
        {
          borderColor: strong ? theme.colors.primary : theme.colors.primary05,
        },
      ]}>
      <FeatherIcon
        name={icon}
        size={12}
        color={strong ? theme.colors.primary : theme.colors.text2}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.badgeText,
          { color: strong ? theme.colors.primary : theme.colors.text2 },
        ]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[
            styles.formContainer,
            {
              backgroundColor: theme.colors.modalBg,
              borderColor: theme.colors.modalBorder,
              borderWidth: 1,
            },
          ]}>
          <View style={styles.header}>
            <View
              style={[
                styles.headerIconWrap,
                { backgroundColor: theme.colors.primary02 },
              ]}>
              <FeatherIcon
                name={isExport ? 'download' : 'upload'}
                size={18}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, { color: theme.colors.text1 }]}>
                {isExport ? 'Export Data' : 'Import Data'}
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: theme.colors.text2 }]}>
                {isExport
                  ? 'Copy a backup of everything below'
                  : 'Merges in — matching items keep the newest edit'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <FeatherIcon name="x" size={20} color={theme.colors.text2} />
            </TouchableOpacity>
          </View>

          {isExport && backup && (
            <View style={styles.badgeRow}>
              <Badge
                icon="file-text"
                label={`${Object.keys(backup.notes).length} notes`}
              />
              <Badge
                icon="check-square"
                label={`${Object.keys(backup.tasks).length} tasks`}
              />
              <Badge
                icon="bell"
                label={`${Object.keys(backup.reminders).length} reminders`}
              />
              {backup.encrypted && (
                <Badge icon="lock" label="Encrypted" strong />
              )}
            </View>
          )}

          <ScrollView contentContainerStyle={[styles.dataScroll]}>
            {isExport ? (
              <View
                style={[
                  styles.jsonCard,
                  { backgroundColor: theme.colors.background1 },
                ]}>
                <Text style={[styles.jsonText, { color: theme.colors.text2 }]}>
                  {backup ? JSON.stringify(backup, null, 2) : ''}
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.hint,
                    { backgroundColor: theme.colors.primary02 },
                  ]}>
                  <FeatherIcon
                    name="info"
                    size={14}
                    color={theme.colors.primary}
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <Text
                    style={[styles.hintText, { color: theme.colors.text2 }]}>
                    Nothing on this device is deleted. Items only in the backup
                    are added; items that exist on both keep whichever was
                    edited most recently.
                  </Text>
                </View>
                <CustomTextInput
                  placeholder="Encryption Key (of the backup)"
                  containerStyles={{
                    width: '100%',
                    marginBottom: 10,
                  }}
                  value={key}
                  setValue={val => {
                    setKey(val.toLowerCase());
                    setError(null);
                  }}
                />
                <CustomTextInput
                  multiline
                  placeholder={'Paste your exported backup here'}
                  containerStyles={{
                    flex: 1,
                    height: '100%',
                    width: '100%',
                  }}
                  error={error}
                  hideErrorMessage
                  value={newData}
                  setValue={val => {
                    setNewData(val);
                    setError(null);
                  }}
                />
              </>
            )}
          </ScrollView>
          {!isExport && error && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: theme.colors.background2 },
              ]}>
              <FeatherIcon
                name="alert-circle"
                size={16}
                color={'red'}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}
          <View style={styles.btnsContainer}>
            <SecondaryButton text="Cancel" onPress={onClose} />
            {isExport ? (
              <PrimaryButton
                text="Copy"
                icon={btnIcon('copy')}
                onPress={copyToClipboard}
              />
            ) : (
              <PrimaryButton
                text="Save"
                icon={btnIcon('save')}
                onPress={saveImport}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default DataReviewModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  formContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 560,
    width: '90%',
    paddingVertical: 24,
    borderRadius: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataScroll: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  jsonCard: {
    borderRadius: 16,
    padding: 14,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    lineHeight: 17,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginTop: 4,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  errorBannerText: {
    flex: 1,
    color: 'red',
    fontSize: 13,
    lineHeight: 18,
  },
  btnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 16,
  },
});
