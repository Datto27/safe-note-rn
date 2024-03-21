import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { NoteI } from '../interfaces/note';
import { colorsDark } from '../constants/colors';
import { parseTime } from '../utils/time';

type Props = {
  item: NoteI;
  animationDelay?: number | null;
  onPress: () => void;
  onLongPress: (id: string) => void;
};

const NoteItem = ({
  item,
  animationDelay = null,
  onPress,
  onLongPress,
}: Props) => {
  const [pressed, setPressed] = useState(false);
  const createdAt = new Date(item.updatedAt);
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
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[styles.container, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => onPress()}
        onLongPress={() => onLongPress(item.id)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}>
        <View style={styles.containerLeft}>
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.info}>
            {item.info}
          </Text>
        </View>
        <View style={styles.containerRight}>
          <Text style={styles.date}>Updated At:</Text>
          <Text style={styles.date}>{createdAt.toLocaleDateString('en-US')}</Text>
          <Text style={styles.date}>
            {parseTime(createdAt.getHours())}:{parseTime(createdAt.getMinutes())}
          </Text>
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
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colorsDark.text1,
  },
  info: {
    color: 'white',
    flexWrap: 'wrap',
  },
  containerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    fontWeight: '300',
    color: colorsDark.text2,
  },
});
