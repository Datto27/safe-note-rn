import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { TaskI } from '../interfaces/task';
import { useGlobalState } from '../contexts/GlobaState';
import {
  globalStyles,
  isFlatTheme,
  SCREEN_PADDING,
} from '../constants/globalStyles';
import { priorityColor } from './Modals/TaskEditorModal';

type Props = {
  item: TaskI;
  animationDelay?: number | null;
  deleteMode?: boolean;
  onToggleComplete: (id: string) => void;
  onPress: () => void;
  onLongPress: (id: string) => void;
  handleCheckboxMark: (id: string, action: 'add' | 'remove') => void;
};

export const TaskItem = ({
  item,
  animationDelay = null,
  deleteMode = false,
  onToggleComplete,
  onPress,
  onLongPress,
  handleCheckboxMark,
}: Props) => {
  const { theme } = useGlobalState();
  const [pressed, setPressed] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
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
    } else {
      fadeAnim.setValue(1);
    }
  }, [fadeAnim, animationDelay]);

  const due = item.dueDate ? new Date(item.dueDate) : null;
  const overdue = due ? due.getTime() < Date.now() && !item.completed : false;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[
          styles.container,
          !isFlatTheme(theme.type) && globalStyles.shadow,
          pressed && { transform: [{ scale: 0.98 }] },
          {
            backgroundColor: theme.colors.secondary05,
            shadowColor: theme.colors.shadowColor1,
          },
        ]}
        onPress={onPress}
        onLongPress={() => {
          setIsChecked(true);
          onLongPress(item.id);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}>
        {!deleteMode && (
          <BouncyCheckbox
            size={26}
            fillColor={theme.colors.primary}
            unFillColor={theme.colors.background2_09}
            iconStyle={{ borderColor: theme.colors.primary }}
            isChecked={item.completed}
            useBuiltInState={false}
            disableText
            style={styles.completeBox}
            onPress={() => onToggleComplete(item.id)}
          />
        )}

        <View style={styles.center}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: theme.colors.text1 },
              item.completed && styles.completedTitle,
              item.completed && { color: theme.colors.text3 },
            ]}>
            {item.title}
          </Text>
          {due ? (
            <View style={styles.metaRow}>
              <FeatherIcon
                name="calendar"
                size={12}
                color={overdue ? '#ef4444' : theme.colors.text3}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: overdue ? '#ef4444' : theme.colors.text3 },
                ]}>
                {due.toLocaleDateString('en-US')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.right}>
          {deleteMode ? (
            <BouncyCheckbox
              size={28}
              fillColor={theme.colors.secondary}
              unFillColor={theme.colors.primary05}
              iconStyle={{ right: -10 }}
              isChecked={isChecked}
              disableText
              onPress={() => {
                setIsChecked(!isChecked);
                handleCheckboxMark(item.id, isChecked ? 'remove' : 'add');
              }}
            />
          ) : (
            <View
              style={[
                styles.priorityDot,
                {
                  backgroundColor: priorityColor(
                    item.priority,
                    theme.colors.text3,
                  ),
                },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: SCREEN_PADDING,
    marginVertical: 4,
    borderRadius: 24,
  },
  completeBox: {
    width: 30,
  },
  center: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  right: {
    marginLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
