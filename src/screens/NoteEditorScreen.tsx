/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
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
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomTextInput from '../components/Inputs/CustomTextInput';
import { getData, saveData } from '../utils/storage';
import { NoteI } from '../interfaces/note';
import TextButton from '../components/Buttons/TextButton';
import { EditorModeT } from '../interfaces/editor-info.type';
import SecondaryButton from '../components/Buttons/SecondaryButton';
import { useGlobalState } from '../contexts/GlobaState';
import { globalStyles } from '../constants/globalStyles';
import { decryptData, encryptData } from '../utils/encrypt.private';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { MainStackNavigatorParamList } from '../routes/MainStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

type Props = {
  // item?: NoteI;
  // mode: EditorModeT;
  // visible: boolean;
  // notes: { [key: string]: NoteI };
  // setVisible: (val: boolean) => void;
  // showDeleteModal: (id: string) => void;
  // cb: () => void;
};

const NoteEditorScreen = () => {
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
  const [isLoading, setIsLoading] = useState(false);
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
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
          <View style={styles.header}>
            <SecondaryButton text="Cancel" onPress={handleClose} />
            {mode === 'update' && item && (
              <>
                <PrimaryButton
                  icon={
                    <FeatherIcon
                      name="more-horizontal"
                      size={17}
                      color={theme.colors.btnText1}
                    />
                  }
                  onPress={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.dropdownContainer}
                    onPress={() => setShowDropdown(false)}>
                    <View
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: theme.colors.background2,
                          borderColor: theme.colors.primary,
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
              </>
            )}
          </View>
          <Animated.View style={{ opacity: titleAnim }}>
            <CustomTextInput
              placeholder="Title"
              value={title}
              setValue={setTitle}
              containerStyles={{ marginHorizontal: 5 }}
              textStyles={{ fontSize: 18, color: theme.colors.text1 }}
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
              textStyles={{ color: theme.colors.text1 }}
              containerStyles={styles.inputContainer}
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                globalStyles.shadow,
                {
                  backgroundColor: theme.colors.btn1,
                  shadowColor: theme.colors.shadowColor2,
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
    </SafeAreaView>
  );
};

export default NoteEditorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 15,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    height: height,
    width: width,
    zIndex: 9999,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 5,
    width: 200,
    paddingVertical: 5,
    borderWidth: 2,
    borderRadius: 20,
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
    bottom: 7,
    right: 5,
    padding: 15,
    borderRadius: 50,
    borderWidth: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});
