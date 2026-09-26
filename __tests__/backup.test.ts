import {
  BACKUP_FORMAT,
  buildBackup,
  mergeById,
  parseBackup,
  rewrapSecrets,
} from '../src/utils/backup';
import { encryptData, decryptData } from '../src/utils/encrypt.private';
import { NoteI } from '../src/interfaces/note';

const OLD = new Date('2026-01-01T00:00:00.000Z');
const NEW = new Date('2026-06-01T00:00:00.000Z');

const note = (id: string, info: string, extra: Partial<NoteI> = {}): NoteI => ({
  id,
  title: `note ${id}`,
  info,
  createdAt: OLD,
  updatedAt: OLD,
  ...extra,
});

describe('buildBackup', () => {
  it('carries notes, tasks and reminders and drops soft-deleted items', () => {
    const backup = buildBackup(
      {
        notes: {
          a: note('a', 'body'),
          b: note('b', 'gone', { deleted: true }),
        },
        tasks: { t: { id: 't', title: 'task', note: 'x', completed: false } },
        reminders: { r: { id: 'r', title: 'rem', triggerAt: '', note: 'y' } },
      } as any,
      null,
    );

    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(Object.keys(backup.notes)).toEqual(['a']);
    expect(Object.keys(backup.tasks)).toEqual(['t']);
    expect(Object.keys(backup.reminders)).toEqual(['r']);
  });
});

describe('parseBackup', () => {
  it('rejects malformed and non-backup input', () => {
    expect(parseBackup('{oops')).toEqual({ ok: false, error: 'Syntax Error!' });
    expect(parseBackup('123').ok).toBe(false);
    expect(parseBackup('[]').ok).toBe(false);
    expect(parseBackup('{"a":1}').ok).toBe(false);
    expect(parseBackup('{}')).toEqual({
      ok: false,
      error: 'Nothing to import!',
    });
  });

  it('refuses a backup from a newer app version', () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: 99,
      notes: {},
    });
    expect(parseBackup(raw).ok).toBe(false);
  });

  it('still reads the legacy bare notes map', () => {
    const res = parseBackup(JSON.stringify({ a: note('a', 'body') }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Object.keys(res.payload.notes)).toEqual(['a']);
      expect(res.payload.encrypted).toBeUndefined();
    }
  });
});

describe('rewrapSecrets', () => {
  const encryptedBackup = () =>
    buildBackup(
      {
        notes: { a: note('a', encryptData('secret body', 'src')) },
        tasks: {
          t: {
            id: 't',
            title: 'task',
            note: encryptData('task note', 'src'),
            completed: false,
          },
        },
        reminders: {},
      } as any,
      'src',
    );

  it('moves secrets from the backup key onto this device key', () => {
    const res = rewrapSecrets(encryptedBackup(), 'src', 'local');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(decryptData(res.collections.notes.a.info, 'local')).toBe(
        'secret body',
      );
      expect(decryptData(res.collections.tasks.t.note!, 'local')).toBe(
        'task note',
      );
    }
  });

  it('decrypts to plaintext when this device has no key', () => {
    const res = rewrapSecrets(encryptedBackup(), 'src', null);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.collections.notes.a.info).toBe('secret body');
    }
  });

  it('encrypts a plaintext backup for a device that has a key', () => {
    const plain = buildBackup(
      {
        notes: { a: note('a', 'plain body') },
        tasks: {},
        reminders: {},
      } as any,
      null,
    );
    const res = rewrapSecrets(plain, '', 'local');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.collections.notes.a.info).not.toBe('plain body');
      expect(decryptData(res.collections.notes.a.info, 'local')).toBe(
        'plain body',
      );
    }
  });

  it('fails instead of writing garbage when the key is wrong', () => {
    const res = rewrapSecrets(encryptedBackup(), 'nope', 'local');
    expect(res).toEqual({ ok: false, error: 'Wrong encryption key!' });
  });

  it('fails when an encrypted backup comes with no key', () => {
    const res = rewrapSecrets(encryptedBackup(), '', 'local');
    expect(res.ok).toBe(false);
  });

  it('catches a wrong key on a legacy backup that has no key check', () => {
    const legacy = parseBackup(
      JSON.stringify({ a: note('a', encryptData('secret body', 'src')) }),
    );
    expect(legacy.ok).toBe(true);
    if (!legacy.ok) return;

    expect(rewrapSecrets(legacy.payload, 'nope', 'local').ok).toBe(false);
    expect(rewrapSecrets(legacy.payload, 'src', 'local').ok).toBe(true);
  });
});

describe('mergeById', () => {
  it('keeps local items the backup never had, including the archive', () => {
    const merged = mergeById(
      { a: note('a', 'local'), z: note('z', 'trashed', { deleted: true }) },
      { b: note('b', 'imported') },
    );
    expect(Object.keys(merged).sort()).toEqual(['a', 'b', 'z']);
    expect(merged.z.deleted).toBe(true);
  });

  it('does not roll back a newer local edit', () => {
    const merged = mergeById(
      { a: note('a', 'fresh', { updatedAt: NEW }) },
      { a: note('a', 'stale', { updatedAt: OLD }) },
    );
    expect(merged.a.info).toBe('fresh');
  });

  it('applies a newer imported edit', () => {
    const merged = mergeById(
      { a: note('a', 'stale', { updatedAt: OLD }) },
      { a: note('a', 'fresh', { updatedAt: NEW }) },
    );
    expect(merged.a.info).toBe('fresh');
  });
});

describe('round trip', () => {
  it('survives export -> import on a device with a different key', () => {
    const stored = {
      notes: {
        a: note('a', encryptData('body a', 'keyone')),
        d: note('d', encryptData('gone', 'keyone'), { deleted: true }),
      },
      tasks: {},
      reminders: {},
    };
    const raw = JSON.stringify(buildBackup(stored as any, 'keyone'));

    const parsed = parseBackup(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const rewrapped = rewrapSecrets(parsed.payload, 'keyone', 'keytwo');
    expect(rewrapped.ok).toBe(true);
    if (!rewrapped.ok) return;

    const merged = mergeById(stored.notes as any, rewrapped.collections.notes);
    expect(decryptData(merged.a.info, 'keytwo')).toBe('body a');
    // The archived note was not exported, but it is still in storage.
    expect(merged.d.deleted).toBe(true);
  });
});
