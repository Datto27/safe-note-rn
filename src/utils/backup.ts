import { NoteI } from '../interfaces/note';
import { TaskI } from '../interfaces/task';
import { ReminderI } from '../interfaces/reminder';
import { encryptData, tryDecryptData } from './encrypt.private';

export const BACKUP_FORMAT = 'safe-note-backup';
export const BACKUP_VERSION = 1;

/**
 * Known plaintext stored encrypted alongside an encrypted backup. A wrong key
 * does not reliably make CryptoES throw - it often just yields an empty string
 * - so the typed key is checked against this instead of against the notes.
 */
export const KEY_CHECK_PLAINTEXT = 'safe-note';

export type CollectionName = 'notes' | 'tasks' | 'reminders';
export const COLLECTIONS: CollectionName[] = ['notes', 'tasks', 'reminders'];

/** The one field per collection that holds the user's private text. */
const SECRET_FIELD: { [key in CollectionName]: 'info' | 'note' } = {
  notes: 'info',
  tasks: 'note',
  reminders: 'note',
};

type ItemMap<T> = { [id: string]: T };

export type Collections = {
  notes: ItemMap<NoteI>;
  tasks: ItemMap<TaskI>;
  reminders: ItemMap<ReminderI>;
};

export type BackupPayload = Collections & {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  /**
   * Whether the secret fields are encrypted. `undefined` for legacy exports,
   * which carried no metadata at all - there we can only trust the key the
   * user types on the import screen.
   */
  encrypted?: boolean;
  /** `KEY_CHECK_PLAINTEXT` encrypted with the exporting device's key. */
  keyCheck?: string;
};

const emptyCollections = (): Collections => ({
  notes: {},
  tasks: {},
  reminders: {},
});

const timeOf = (item: { updatedAt?: Date | string }): number => {
  const time = new Date(item?.updatedAt as string).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const withoutDeleted = <T extends { id: string; deleted?: boolean }>(
  map: ItemMap<T> | null,
): ItemMap<T> =>
  Object.values(map || {})
    .filter(item => item?.deleted !== true)
    .reduce((obj, cur) => ({ ...obj, [cur.id]: cur }), {});

/**
 * Accepts anything shaped like `{ [id]: { id, ... } }` and re-keys it by the
 * item's own id. Returns null when the value is not an item map at all.
 */
const normalizeMap = <T extends { id: string }>(
  value: unknown,
): ItemMap<T> | null => {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const out: ItemMap<T> = {};
  for (const item of Object.values(value as { [key: string]: unknown })) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return null;
    }
    const id = (item as { id?: unknown }).id;
    if (typeof id !== 'string' || !id) {
      return null;
    }
    out[id] = item as T;
  }
  return out;
};

export const countItems = (collections: Collections): number =>
  COLLECTIONS.reduce(
    (total, name) => total + Object.keys(collections[name]).length,
    0,
  );

/**
 * Builds the export payload. Soft-deleted items stay behind - the archive is a
 * local trash can, not something worth carrying to another device.
 */
export const buildBackup = (
  collections: {
    notes: ItemMap<NoteI> | null;
    tasks: ItemMap<TaskI> | null;
    reminders: ItemMap<ReminderI> | null;
  },
  localKey: string | null,
): BackupPayload => ({
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  encrypted: !!localKey,
  keyCheck: localKey ? encryptData(KEY_CHECK_PLAINTEXT, localKey) : undefined,
  notes: withoutDeleted(collections.notes),
  tasks: withoutDeleted(collections.tasks),
  reminders: withoutDeleted(collections.reminders),
});

export type ParseResult =
  | { ok: true; payload: BackupPayload }
  | { ok: false; error: string };

export const parseBackup = (raw: string): ParseResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: 'Syntax Error!' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Unrecognized data format!' };
  }
  const obj = parsed as { [key: string]: unknown };

  if (obj.format === BACKUP_FORMAT) {
    if (typeof obj.version !== 'number' || obj.version > BACKUP_VERSION) {
      return { ok: false, error: 'Backup made by a newer app version!' };
    }
    const notes = normalizeMap<NoteI>(obj.notes);
    const tasks = normalizeMap<TaskI>(obj.tasks);
    const reminders = normalizeMap<ReminderI>(obj.reminders);
    if (!notes || !tasks || !reminders) {
      return { ok: false, error: 'Unrecognized data format!' };
    }
    const payload: BackupPayload = {
      format: BACKUP_FORMAT,
      version: obj.version,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
      encrypted: typeof obj.encrypted === 'boolean' ? obj.encrypted : undefined,
      keyCheck: typeof obj.keyCheck === 'string' ? obj.keyCheck : undefined,
      notes,
      tasks,
      reminders,
    };
    if (countItems(payload) === 0) {
      return { ok: false, error: 'Nothing to import!' };
    }
    return { ok: true, payload };
  }

  // Legacy export: a bare `{ [id]: NoteI }` map with no metadata.
  const notes = normalizeMap<NoteI>(obj);
  if (!notes) {
    return { ok: false, error: 'Unrecognized data format!' };
  }
  if (Object.keys(notes).length === 0) {
    return { ok: false, error: 'Nothing to import!' };
  }
  return {
    ok: true,
    payload: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: '',
      encrypted: undefined,
      notes,
      tasks: {},
      reminders: {},
    },
  };
};

export type RewrapResult =
  | { ok: true; collections: Collections }
  | { ok: false; error: string };

/**
 * Moves every secret field from the backup's key onto this device's key.
 *
 * Nothing is written unless the whole payload decrypts, so a mistyped key can
 * never leave half-decrypted garbage behind.
 */
export const rewrapSecrets = (
  payload: BackupPayload,
  sourceKey: string,
  localKey: string | null,
): RewrapResult => {
  if (payload.encrypted === true && !sourceKey) {
    return {
      ok: false,
      error: 'This backup is encrypted - enter its key.',
    };
  }
  // Legacy backups carry no flag, so the typed key is the only hint we have.
  const shouldDecrypt = !!sourceKey && payload.encrypted !== false;

  if (shouldDecrypt && payload.keyCheck) {
    const probe = tryDecryptData(payload.keyCheck, sourceKey);
    if (!probe.ok || probe.value !== KEY_CHECK_PLAINTEXT) {
      return { ok: false, error: 'Wrong encryption key!' };
    }
  }

  const out = emptyCollections();
  let encryptedFields = 0;
  let recoveredFields = 0;

  for (const name of COLLECTIONS) {
    const field = SECRET_FIELD[name];
    const source = payload[name] as unknown as ItemMap<{
      [key: string]: unknown;
    }>;
    const target = out[name] as unknown as ItemMap<{
      [key: string]: unknown;
    }>;

    for (const id of Object.keys(source)) {
      const item = source[id];
      const original = item[field];
      let secret: string = typeof original === 'string' ? original : '';

      if (secret.length > 0) {
        if (shouldDecrypt) {
          encryptedFields += 1;
          const decrypted = tryDecryptData(secret, sourceKey);
          if (!decrypted.ok) {
            return { ok: false, error: 'Wrong encryption key!' };
          }
          secret = decrypted.value;
          if (secret.length > 0) {
            recoveredFields += 1;
          }
        }
        if (localKey && secret.length > 0) {
          secret = encryptData(secret, localKey);
        }
      }

      // Items that never had a secret field keep whatever they had (undefined
      // for an optional task/reminder note), rather than gaining an empty one.
      target[id] =
        typeof original === 'string'
          ? { ...item, [field]: secret }
          : { ...item };
    }
  }

  // Legacy backups have no key check. A wrong key blanks every field instead of
  // throwing, so recovering nothing at all from a payload that clearly held
  // something means the key was wrong - refuse rather than blank the import.
  if (!payload.keyCheck && encryptedFields > 0 && recoveredFields === 0) {
    return { ok: false, error: 'Wrong encryption key!' };
  }

  return { ok: true, collections: out };
};

/**
 * Merges imported items into what is already stored. The newer `updatedAt`
 * wins, so restoring an old backup never silently rolls back fresh edits, and
 * items missing from the backup (including the soft-deleted archive) are kept.
 */
export const mergeById = <T extends { id: string; updatedAt?: Date | string }>(
  existing: ItemMap<T> | null,
  incoming: ItemMap<T>,
): ItemMap<T> => {
  // `getData` hands back the string 'fail' when storage is unreadable; spreading
  // that would turn the merge into a map of single characters.
  const base = existing && typeof existing === 'object' ? existing : {};
  const merged: ItemMap<T> = { ...base };
  for (const item of Object.values(incoming)) {
    const current = merged[item.id];
    if (!current || timeOf(item) >= timeOf(current)) {
      merged[item.id] = item;
    }
  }
  return merged;
};
