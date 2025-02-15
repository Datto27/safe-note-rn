/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomTextInput from '../Inputs/CustomTextInput';
import { getData, saveData } from '../../utils/storage';
import { NoteI } from '../../interfaces/note';
import TextButton from '../Buttons/TextButton';
import { EditorModeT } from '../../interfaces/editor-info.type';
import SecondaryButton from '../Buttons/SecondaryButton';
import { useGlobalState } from '../../contexts/GlobaState';
import { globalStyles } from '../../constants/globalStyles';
import { decryptData, encryptData } from '../../utils/encrypt.private';
import PrimaryButton from '../Buttons/PrimaryButton';

type Props = {
  item?: NoteI;
  mode: EditorModeT;
  visible: boolean;
  notes: { [key: string]: NoteI };
  setVisible: (val: boolean) => void;
  showDeleteModal: (id: string) => void;
  cb: () => void;
};

const NoteEditor = ({
  item,
  mode,
  visible,
  notes,
  setVisible,
  showDeleteModal,
  cb,
}: Props) => {
  const idRef = useRef('');
  const { theme } = useGlobalState();
  const [ekey, setEkey] = useState(null);
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState('');
  const noteType = useRef<'list' | 'normal'>();
  const [error, setError] = useState({
    field: '',
    msg: '',
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let titleAnim = useRef(new Animated.Value(0)).current;
  let infoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      idRef.current = item ? item.id : Math.random().toString(16).slice(2);
      getData('key').then(res => {
        setEkey(res);
      });
    }
  }, [visible]);

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
    // let to: NodeJS.Timeout;
    // if (title !== '' && info !== '' && mode !== 'create') {
    //   setIsLoading(true);
    //   to = setTimeout(() => {
    //     saveNote();
    //   }, 1000);
    // }
    // return () => {
    //   clearTimeout(to);
    // };
  }, [title, info]);

  useEffect(() => {
    if (visible) {
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
    } else {
      infoAnim.setValue(0);
      titleAnim.setValue(0);
    }
  }, [titleAnim, visible]);

  const handleClose = () => {
    setTitle('');
    setInfo('');
    setError({ field: '', msg: '' });
    setVisible(false);
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
    cb();
  };

  const convertToList = (txt?: string) => {
    let lines = txt !== undefined ? txt.split('\n') : info.split('\n');
    lines = lines.map((line, i) => {
      if (line !== '' && line[0] !== '•') {
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background1 },
        ]}>
        <View style={{ flex: 1 }}>
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
                      />
                    ) : (
                      <TextButton
                        text="Add List Bullets   •"
                        color={theme.colors.btnText1}
                        onPress={() => convertToList()}
                      />
                    )}
                    <TextButton
                      text="Delete"
                      color="red"
                      onPress={() => showDeleteModal(item.id)}
                    />
                  </View>
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
          <Animated.View style={{ flex: 1, opacity: infoAnim }}>
            <CustomTextInput
              placeholder="What's in your mind?"
              multiline
              numberOfLines={20}
              value={info}
              setValue={txt =>
                noteType.current === 'list' ? convertToList(txt) : setInfo(txt)
              }
              textStyles={{ color: theme.colors.text1 }}
              containerStyles={styles.inputContainer}
            />
          </Animated.View>
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
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default NoteEditor;

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
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 5,
    width: 200,
    paddingVertical: 5,
    borderWidth: 2,
    borderRadius: 20,
    zIndex: 999,
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
