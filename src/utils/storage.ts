import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (key: string, value: any) => {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
    return 'ok';
  } catch (err) {
    console.error(err);
    return 'fail';
  }
};

/**
 * Same as `saveData`, but rejects with the real error instead of swallowing
 * it into a 'fail' string. Used where a caller needs to report *why* a write
 * failed rather than just that it did.
 */
export const saveDataOrThrow = async (key: string, value: any) => {
  const json = JSON.stringify(value);
  await AsyncStorage.setItem(key, json);
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value != null ? JSON.parse(value) : null;
  } catch (err) {
    console.error(err);
    return 'fail';
  }
};

export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    return 'ok';
  } catch (err) {
    console.error(err);
    return 'fail';
  }
};

export const getAll = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);

    return items;
  } catch (error) {
    console.log(error, 'problemo');
  }
};
