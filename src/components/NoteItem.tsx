import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { NoteI } from '../interfaces/note';
import { parseTime } from '../utils/time';

import { useGlobalState } from '../contexts/GlobaState';
import { globalStyles } from '../constants/globalStyles';

type Props = {
  item: NoteI;
  animationDelay?: number | null;
  deleteMode?: boolean;
  onPress: () => void;
  onLongPress: (id: string) => void;
  handleCheckboxMark: (id: string, action: 'add' | 'remove') => void;
};

type ArchivedProps = {
  item: NoteI;
  animationDelay?: number | null;
  onRecover: (id: string) => void;
  onDelete: (id: string) => void;
};

export const NoteItem = ({
  item,
  animationDelay = null,
  deleteMode = false,
  onPress,
  onLongPress,
  handleCheckboxMark,
}: Props) => {
  const { theme } = useGlobalState();
  const [pressed, setPressed] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const createdAt = new Date(item.updatedAt);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!deleteMode) {
      setIsChecked(false);
    }
  }, [deleteMode]);

  useEffect(() => {
    if (animationDelay) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: animationDelay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[
          styles.container,
          globalStyles.shadow,
          pressed && { transform: [{ scale: 0.98 }] },
          {
            backgroundColor: theme.colors.secondary05,
            shadowColor: theme.colors.shadowColor1,
          },
        ]}
        onPress={() => onPress()}
        onLongPress={() => {
          setIsChecked(true);
          onLongPress(item.id);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}>
        <View style={styles.containerLeft}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.text1 }]}>
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.info, { color: theme.colors.text2 }]}>
            {item.info}
          </Text>
        </View>
        <View style={styles.containerRight}>
          {deleteMode ? (
            <View style={styles.checkboxContainer}>
              <BouncyCheckbox
                size={32}
                fillColor={theme.colors.secondary}
                unFillColor={theme.colors.primary05}
                iconStyle={{ right: -10 }}
                isChecked={isChecked}
                onPress={() => {
                  setIsChecked(!isChecked);
                  handleCheckboxMark(item.id, isChecked ? 'remove' : 'add');
                }}
              />
            </View>
          ) : (
            <>
              <Text style={[styles.date, { color: theme.colors.text2 }]}>
                Updated At:
              </Text>
              <Text style={[styles.date, { color: theme.colors.text2 }]}>
                {createdAt.toLocaleDateString('en-US')}
              </Text>
              <Text style={[styles.date, { color: theme.colors.text2 }]}>
                {parseTime(createdAt.getHours())}:
                {parseTime(createdAt.getMinutes())}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ArchivedNoteItem = ({
  item,
  animationDelay,
  onRecover,
  onDelete,
}: ArchivedProps) => {
  const { theme } = useGlobalState();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animationDelay) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: animationDelay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor: theme.colors.secondary05 },
      ]}>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}>
        <FeatherIcon name="trash" size={32} color={'red'} />
      </TouchableOpacity>
      <View style={styles.containerLeft}>
        <Text style={[styles.title, { color: theme.colors.text1 }]}>
          {item.title}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.info, { color: theme.colors.text2 }]}>
          {item.info}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.recoverBtn}
        onPress={() => onRecover(item.id)}>
        <FeatherIcon name="repeat" size={32} color={theme.colors.btnText1} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 70,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 20,
    zIndex: 99,
  },
  containerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: 16,
    marginBottom: 5,
  },
  info: {
    fontFamily: 'JosefinSans-Light',
    color: 'white',
    flexWrap: 'wrap',
    // marginTop: 2,
  },
  containerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: 12,
    // marginTop: 1.5,
  },
  checkboxContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deleteBtn: {
    alignSelf: 'center',
    marginRight: 30,
    marginLeft: 5,
  },
  recoverBtn: {
    alignSelf: 'center',
    marginRight: 10,
  },
});
