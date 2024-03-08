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
