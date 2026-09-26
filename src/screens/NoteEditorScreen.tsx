/* eslint-disable react-hooks/exhaustive-deps */
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getData, saveData } from '../utils/storage';
import { NoteI } from '../interfaces/note';
import TextButton from '../components/Buttons/TextButton';
import { useGlobalState } from '../contexts/GlobaState';

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
import { isFlatTheme, SCREEN_PADDING } from '../constants/globalStyles';

const { width, height } = Dimensions.get('window');

const BODY_FONT_SIZE = 17;
// Shared by the text and the notebook rules, so every line is written on one
const BODY_LINE_HEIGHT = 36;
const BODY_PADDING_TOP = 12;

// Roughly one dot every 10px; the row is clipped, so a few extra are harmless
const LINE_DOTS = '.'.repeat(Math.ceil(width / 10));

// Dotted notebook rules drawn behind the note body, one per line of text.
// Each rule is a row of periods set in the body's own font, size and line
// height, so the dots land on the same baseline as the letters above them.
// (A dotted border can't be used: Android spaces its dots by the border
// width, which can't be widened.)
const NotebookLines = ({ count, color }: { count: number; color: string }) => (
  <View pointerEvents="none" style={styles.lines}>
    {Array.from({ length: count }, (_, i) => (
      <Text
        key={i}
        numberOfLines={1}
        ellipsizeMode="clip"
        style={[styles.lineDots, { color }]}>
        {LINE_DOTS}
      </Text>
    ))}
  </View>
);

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const moreButtonRef = useRef<TouchableOpacity>(null);

  const [activateSearch, setActivateSearch] = useState(false);
  const [bodyViewportHeight, setBodyViewportHeight] = useState(0);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [showLines, setShowLines] = useState(true);
  const idRef = useRef('');
  let titleAnim = useRef(new Animated.Value(0)).current;
  let infoAnim = useRef(new Animated.Value(0)).current;
  let inputTimeout = useRef<NodeJS.Timeout>(undefined);

  // ── Auto-save, undo & redo ──────────────────────────────────────────────────
  type SaveStatus = 'idle' | 'saving' | 'saved';
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const savedStatusTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  // Undo: snapshots taken just before each auto-save commits
  const undoStack = useRef<Array<{ title: string; info: string }>>([]);
  const [undoCount, setUndoCount] = useState(0);
  // Redo: snapshots pushed when the user undoes; cleared on fresh edits
  const redoStack = useRef<Array<{ title: string; info: string }>>([]);
  const [redoCount, setRedoCount] = useState(0);
  // Tracks the last persisted state to detect real changes
  const lastSavedRef = useRef<{ title: string; info: string } | null>(null);
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    idRef.current = item ? item.id : Math.random().toString(16).slice(2);
    // Seed the undo baseline with the "create" empty state immediately
    if (mode === 'create') {
      lastSavedRef.current = { title: '', info: '' };
    }
    getData('key').then(res => {
      setEkey(res);
    });
    getData('notebookLines').then(res => {
      if (res === false) setShowLines(false);
    });
  }, []);

  // Editor-wide preference, so it sticks across notes and restarts
  const toggleLines = () => {
    const next = !showLines;
    setShowLines(next);
    saveData('notebookLines', next);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (mode === 'update' && item) {
      const decryptedInfo = ekey
        ? decryptData(item.info, ekey) ?? item.info
        : item.info;
      setTitle(item.title);
      noteType.current = item.type;
      setInfo(decryptedInfo);
      // Seed the undo baseline with the state as it was when the editor opened.
      // This ensures the first auto-save can push this snapshot so the user
      // can undo all the way back to the original note.
      lastSavedRef.current = { title: item.title, info: decryptedInfo };
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
    navigation.pop();
  };

  const saveNote = async (titleVal: string, infoVal: string) => {
    if (!titleVal) {
      return { field: 'title', msg: '' };
    }

    if (mode === 'create') {
      const note: NoteI = {
        id: idRef.current,
        title: titleVal,
        info: ekey ? encryptData(infoVal, ekey) : infoVal,
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
        title: titleVal,
        info: ekey ? encryptData(infoVal, ekey) : infoVal,
        type: noteType.current,
        updatedAt: new Date(),
      };

      let allNotes = await getData('notes');
      if (!allNotes || allNotes.length === 0) {
        allNotes = {};
      }

      allNotes[item.id] = note;
      await saveData('notes', allNotes);
    }
  };

  // Debounced auto-save: called whenever title or info changes
  const triggerAutoSave = useCallback(
    (newTitle: string, newInfo: string) => {
      clearTimeout(autoSaveTimer.current);
      clearTimeout(savedStatusTimer.current);

      autoSaveTimer.current = setTimeout(async () => {
        if (!newTitle) return; // don't save without a title

        // Push the previous saved state to undo stack before overwriting
        if (lastSavedRef.current !== null) {
          const prev = lastSavedRef.current;
          const isDifferent = prev.title !== newTitle || prev.info !== newInfo;
          if (isDifferent) {
            undoStack.current = [...undoStack.current, prev];
            setUndoCount(undoStack.current.length);
            // A fresh edit invalidates redo history
            redoStack.current = [];
            setRedoCount(0);
          }
        }

        setSaveStatus('saving');
        await saveNote(newTitle, newInfo);
        lastSavedRef.current = { title: newTitle, info: newInfo };
        setSaveStatus('saved');

        savedStatusTimer.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ekey, mode, notes, item],
  );

  const handleUndo = () => {
    if (undoStack.current.length === 0) return;
    const current = lastSavedRef.current;
    const previous = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    setUndoCount(undoStack.current.length);
    // Save current state onto redo stack so it can be re-applied
    if (current) {
      redoStack.current = [...redoStack.current, current];
      setRedoCount(redoStack.current.length);
    }
    setTitle(previous.title);
    setInfo(previous.info);
    clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    saveNote(previous.title, previous.info).then(() => {
      lastSavedRef.current = previous;
      setSaveStatus('saved');
      savedStatusTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
    });
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    const current = lastSavedRef.current;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    setRedoCount(redoStack.current.length);
    // Push current state back onto undo stack
    if (current) {
      undoStack.current = [...undoStack.current, current];
      setUndoCount(undoStack.current.length);
    }
    setTitle(next.title);
    setInfo(next.info);
    clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    saveNote(next.title, next.info).then(() => {
      lastSavedRef.current = next;
      setSaveStatus('saved');
      savedStatusTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
    });
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
    triggerAutoSave(title, txt);
  };

  const wordCount = info.trim() ? info.trim().split(/\s+/).length : 0;
  const lineCount = Math.ceil(
    (Math.max(bodyHeight, bodyViewportHeight) - BODY_PADDING_TOP) /
      BODY_LINE_HEIGHT,
  );

  const handleTitleUpdate = (txt: string) => {
    setTitle(txt);
    triggerAutoSave(txt, info);
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
              !isFlatTheme(theme.type) && styles.dropdownShadow,
              {
                top: dropdownPos.top,
                right: dropdownPos.right,
                backgroundColor: theme.colors.background2,
                borderColor: theme.colors.modalBorder,
              },
            ]}>
            <TextButton
              text={showLines ? 'Hide Lines' : 'Show Lines'}
              color={theme.colors.text1}
              onPress={toggleLines}
              style={styles.dropdownBtn}
            />
            {mode === 'update' && item && (
              <>
                {noteType.current === 'list' ? (
                  <TextButton
                    text="Convert To Text"
                    color={theme.colors.text1}
                    onPress={convertToNormal}
                    style={styles.dropdownBtn}
                  />
                ) : (
                  <TextButton
                    text="Add List Bullets   •"
                    color={theme.colors.text1}
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
              </>
            )}
          </View>
        </TouchableOpacity>
      )}
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

          {/* Save status indicator */}
          {saveStatus !== 'idle' && (
            <View style={styles.saveStatus}>
              {saveStatus === 'saving' ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.text1}
                  style={{ marginRight: 4 }}
                />
              ) : (
                <FeatherIcon
                  name="check"
                  size={13}
                  color={theme.colors.text1}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[styles.saveStatusText, { color: theme.colors.text1 }]}>
                {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Undo button */}
            <TouchableOpacity
              style={[styles.undoBtn, { opacity: undoCount > 0 ? 1 : 0.3 }]}
              disabled={undoCount === 0}
              onPress={handleUndo}>
              <FeatherIcon
                name="corner-up-left"
                size={22}
                color={theme.colors.text1}
              />
            </TouchableOpacity>
            {/* Redo button */}
            <TouchableOpacity
              style={[styles.undoBtn, { opacity: redoCount > 0 ? 1 : 0.3 }]}
              disabled={redoCount === 0}
              onPress={handleRedo}>
              <FeatherIcon
                name="corner-up-right"
                size={22}
                color={theme.colors.text1}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 8,
                marginLeft: 4,
                marginRight: 8,
              }}
              onPress={() => setActivateSearch(true)}>
              <FeatherIcon name="search" size={24} color={theme.colors.text1} />
            </TouchableOpacity>
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
          </View>
        </View>

        <Animated.View style={{ opacity: titleAnim }}>
          <TextInput
            placeholder="Title"
            placeholderTextColor={theme.colors.text3}
            value={title}
            onChangeText={handleTitleUpdate}
            style={[styles.titleInput, { color: theme.colors.inputText }]}
          />
          <Text style={[styles.meta, { color: theme.colors.text3 }]}>
            {item
              ? `Edited ${new Date(item.updatedAt).toLocaleDateString(
                  'en-US',
                )} · `
              : ''}
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </Text>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.modalBorder },
            ]}
          />
        </Animated.View>
        <Animated.View style={[styles.inputWrapper, { opacity: infoAnim }]}>
          {/* The input grows with its text and the ScrollView scrolls it, so
              the notebook lines behind it move together with the text */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            onLayout={e => setBodyViewportHeight(e.nativeEvent.layout.height)}>
            {showLines && (
              <NotebookLines
                count={Math.max(lineCount, 0)}
                color={theme.colors.text3}
              />
            )}
            <TextInput
              placeholder="What's in your mind?"
              placeholderTextColor={theme.colors.text3}
              multiline
              scrollEnabled={false}
              onChangeText={handleInputUpdate}
              onLayout={e => setBodyHeight(e.nativeEvent.layout.height)}
              style={[
                styles.bodyInput,
                styles.bodyText,
                {
                  color: theme.colors.inputText,
                  minHeight: bodyViewportHeight,
                  paddingBottom: insets.bottom + 24,
                },
              ]}>
              {/* Passed as a styled child rather than `value`: Android drops
                  lineHeight from text loaded through `value` (it only applies
                  to newly typed text), which pulls the lines off the rules */}
              <Text
                style={[styles.bodyText, { color: theme.colors.inputText }]}>
                {info}
              </Text>
            </TextInput>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
  },
  dropdownShadow: {
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
  // Editor fields sit directly on the page; the container already adds 8px
  titleInput: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: SCREEN_PADDING - 8,
    paddingVertical: 4,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: SCREEN_PADDING - 8,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: SCREEN_PADDING - 8,
    marginTop: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  bodyText: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: BODY_FONT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    // Android's extra font padding would push the text off the rules
    includeFontPadding: false,
  },
  bodyInput: {
    textAlignVertical: 'top',
    paddingHorizontal: SCREEN_PADDING - 8,
    paddingTop: BODY_PADDING_TOP,
  },
  lines: {
    position: 'absolute',
    top: BODY_PADDING_TOP,
    left: SCREEN_PADDING - 8,
    right: SCREEN_PADDING - 8,
    opacity: 0.5,
  },
  // Must match bodyInput's font metrics to stay on the text's baseline
  lineDots: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: BODY_FONT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    letterSpacing: 7,
    includeFontPadding: false,
    // Sit just under the letters instead of touching them
    transform: [{ translateY: 3 }],
  },
  undoBtn: {
    padding: 8,
  },
  saveStatus: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  saveStatusText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
});
