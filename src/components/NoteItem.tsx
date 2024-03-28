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
import { NoteI } from '../interfaces/note';
import { colorsDark } from '../constants/colors';
import { parseTime } from '../utils/time';

type Props = {
  item: NoteI;
  animationDelay?: number | null;
  deleteMode?: boolean;
  onPress: () => void;
  onLongPress: (id: string) => void;
  handleCheckboxMark: (id: string, action: 'add' | 'remove') => void;
};

const NoteItem = ({
  item,
  animationDelay = null,
  deleteMode = false,
  onPress,
  onLongPress,
  handleCheckboxMark,
}: Props) => {
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
        style={[styles.container, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => onPress()}
        onLongPress={() => {
          setIsChecked(true);
          onLongPress(item.id);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}>
        <View style={styles.containerLeft}>
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.info}>
            {item.info}
          </Text>
        </View>
        <View style={styles.containerRight}>
          {deleteMode ? (
            <View style={styles.checkboxContainer}>
              <BouncyCheckbox
                size={32}
                fillColor={colorsDark.secondary}
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
              <Text style={styles.date}>Updated At:</Text>
              <Text style={styles.date}>
                {createdAt.toLocaleDateString('en-US')}
              </Text>
              <Text style={styles.date}>
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

export default NoteItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 70,
    backgroundColor: colorsDark.secondary02,
    padding: 10,
    margin: 3,
    borderRadius: 20,
    zIndex: 99,
  },
  containerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: 16,
    color: colorsDark.text1,
  },
  info: {
    fontFamily: 'JosefinSans-Light',
    color: 'white',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  containerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    fontFamily: 'JosefinSans-Medium',
    fontSize: 12,
    color: colorsDark.text2,
    marginTop: 1.5,
  },
  checkboxContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
