/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomTextInput from '../components/Inputs/CustomTextInput';
import { getData, saveData } from '../utils/storage';
import { NoteI } from '../interfaces/note';
import TextButton from '../components/Buttons/TextButton';
import { useGlobalState } from '../contexts/GlobaState';
import { globalStyles } from '../constants/globalStyles';
import { decryptData, encryptData } from '../utils/encrypt.private';
import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { MainStackNavigatorParamList } from '../routes/MainStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import SearchModal from '../components/Modals/SearchModal';

const { width, height } = Dimensions.get('window');

const NoteEditorScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const route =
    useRoute<RouteProp<MainStackNavigatorParamList, 'NoteEditor'>>();
  let { item, mode, notes } = route.params;
  const { theme } = useGlobalState();
  const [ekey, setEkey] = useState(null);
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState('');
  const noteType = useRef<'list' | 'normal' | undefined>(undefined);
  const [error, setError] = useState({
    field: '',
    msg: '',
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const moreButtonRef = useRef<TouchableOpacity>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activateSearch, setActivateSearch] = useState(false);
  const idRef = useRef('');
  let titleAnim = useRef(new Animated.Value(0)).current;
  let infoAnim = useRef(new Animated.Value(0)).current;
  let inputTimeout = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    idRef.current = item ? item.id : Math.random().toString(16).slice(2);
    getData('key').then(res => {
      setEkey(res);
    });
  }, []);

  useEffect(() => {
    if (mode === 'update' && item) {
      setTitle(item.title);
      noteType.current = item.type;
      if (ekey) {
        setInfo(decryptData(item.info, ekey) ?? item.info);
      } else {
        setInfo(item.info);
      }
    }
  }, [item, ekey]);

  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      delay: 200,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    Animated.timing(infoAnim, {
      toValue: 1,
      delay: 400,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    return () => {
      infoAnim.setValue(0);
      titleAnim.setValue(0);
    };
  }, [titleAnim]);

  const handleClose = () => {
    setTitle('');
    setInfo('');
    setError({ field: '', msg: '' });
    navigation.pop();
  };

  const saveNote = async () => {
    if (!title) {
      return { field: 'title', msg: '' };
    }

    if (mode === 'create') {
      const note: NoteI = {
        id: idRef.current,
        title,
        info: ekey ? encryptData(info, ekey) : info,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!notes || Object.keys(notes).length === 0) {
        notes = {};
      }

      notes[idRef.current] = note;
      await saveData('notes', notes);
    } else {
      if (!item) {
        return;
      }

      const note: NoteI = {
        ...item,
        title,
        info: ekey ? encryptData(info, ekey) : info,
        type: noteType.current,
        updatedAt: new Date(),
      };

      let notes = await getData('notes');
      if (!notes || notes.length === 0) {
        notes = {};
      }

      notes[item.id] = note;
      await saveData('notes', notes);
    }
    setIsLoading(false);
  };

  const convertToList = (txt?: string) => {
    let lines = txt !== undefined ? txt.split('\n') : info.split('\n');
    lines = lines.map(line => {
      if (
        line !== '' &&
        line[0] !== '•' &&
        line[0] !== '#' &&
        line[0] !== '#' &&
        line[0] !== ' '
      ) {
        line = '• ' + line;
      }
      return line;
    });
    setInfo(lines.join('\n'));
    noteType.current = 'list';
  };

  const convertToNormal = () => {
    let lines = info.split('\n');
    lines = lines.map(line => {
      if (line !== '' && line[0] === '•') {
        line = line.slice(2);
      }
      return line;
    });
    setInfo(lines.join('\n'));
    noteType.current = 'normal';
  };

  const handleInputUpdate = (txt: string) => {
    clearTimeout(inputTimeout.current);
    if (noteType.current === 'list') {
      setInfo(txt);
      inputTimeout.current = setTimeout(() => {
        convertToList(txt);
      }, 500);
    } else {
      setInfo(txt);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      {showDropdown && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dropdownContainer}
          onPress={() => setShowDropdown(false)}>
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownPos.top,
                right: dropdownPos.right,
                backgroundColor: theme.colors.background2,
                borderColor: theme.colors.modalBorder,
              },
            ]}>
            {noteType.current === 'list' ? (
              <TextButton
                text="Convert To Text"
                color={theme.colors.btnText1}
                onPress={convertToNormal}
                style={styles.dropdownBtn}
              />
            ) : (
              <TextButton
                text="Add List Bullets   •"
                color={theme.colors.btnText1}
                onPress={() => convertToList()}
                style={styles.dropdownBtn}
              />
            )}
            <TextButton
              text="Delete"
              color="red"
              onPress={() => navigation.pop()}
              style={styles.dropdownBtn}
            />
          </View>
        </TouchableOpacity>
      )}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.header, { marginTop: insets.top + 10 }]}>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleClose}>
              <FeatherIcon
                name="chevron-left"
                size={28}
                color={theme.colors.text1}
              />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  padding: 8,
                  marginRight: mode === 'update' && item ? 8 : 0,
                }}
                onPress={() => setActivateSearch(true)}>
                <FeatherIcon
                  name="search"
                  size={24}
                  color={theme.colors.text1}
                />
              </TouchableOpacity>
              {mode === 'update' && item && (
                <>
                  <TouchableOpacity
                    ref={moreButtonRef}
                    style={{ padding: 8 }}
                    onPress={() => {
                      moreButtonRef.current?.measure((_x, _y, w, h, px, py) => {
                        setDropdownPos({
                          top: py + h + 4,
                          right: Dimensions.get('window').width - px - w,
                        });
                        setShowDropdown(!showDropdown);
                      });
                    }}>
                    <FeatherIcon
                      name="more-horizontal"
                      size={24}
                      color={theme.colors.text1}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <Animated.View style={{ opacity: titleAnim }}>
            <CustomTextInput
              placeholder="Title"
              value={title}
              setValue={setTitle}
              containerStyles={{ marginHorizontal: 5, borderWidth: 0 }}
              textStyles={{
                fontSize: 24,
                fontWeight: '700',
                color: theme.colors.text1,
              }}
              error={error.field === 'title' ? error.msg : null}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                opacity: infoAnim,
              },
            ]}>
            <CustomTextInput
              placeholder="What's in your mind?"
              multiline
              numberOfLines={20}
              value={info}
              setValue={handleInputUpdate}
              textStyles={{
                color: theme.colors.text1,
                fontSize: 16,
                lineHeight: 26,
              }}
              containerStyles={[styles.inputContainer, { borderWidth: 0 }]}
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                globalStyles.shadow,
                {
                  backgroundColor: theme.colors.btn1,
                },
              ]}
              onPress={async () => {
                const res = await saveNote();
                if (res?.field) {
                  setError(res);
                } else {
                  handleClose();
                }
              }}>
              {isLoading ? (
                <ActivityIndicator size={32} color={theme.colors.btnText1} />
              ) : (
                <FeatherIcon
                  name="save"
                  color={theme.colors.btnText1}
                  size={30}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <SearchModal
        visible={activateSearch}
        text={item?.info}
        onClose={() => setActivateSearch(false)}
      />
    </SafeAreaView>
  );
};

export default NoteEditorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height,
    width: width,
    zIndex: 9999,
  },
  dropdown: {
    position: 'absolute',
    width: 200,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 10,
    borderRadius: 25,
  },
  saveBtn: {
    position: 'absolute',
    bottom: 14,
    right: 10,
    height: 64,
    width: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
