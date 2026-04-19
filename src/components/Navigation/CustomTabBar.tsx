import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalState } from '../../contexts/GlobaState';

const TAB_BAR_MARGIN = 16;

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { theme } = useGlobalState();
  const { width } = useWindowDimensions();
  const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN * 2;
  const translateX = useSharedValue(0);

  const tabWidth = TAB_BAR_WIDTH / state.routes.length;
  // Bake in the 4px left padding so translateX(0) === first tab position
  const INDICATOR_PADDING = 4;

  useEffect(() => {
    translateX.value = withSpring(
      INDICATOR_PADDING + state.index * tabWidth,
      { damping: 20, stiffness: 90 },
    );
  }, [state.index, tabWidth, translateX, INDICATOR_PADDING]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top + 8, backgroundColor: theme.colors.background1 },
      ]}>
      <View
        style={[
          styles.tabBarContainer,
          { backgroundColor: theme.colors.background2, width: TAB_BAR_WIDTH },
        ]}>
        <Animated.View
          style={[
            styles.indicator,
            animatedIndicatorStyle,
            { width: tabWidth - INDICATOR_PADDING * 2, backgroundColor: theme.colors.primary },
          ]}
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon from options or default
          const renderIcon = () => {
            if (route.name === 'Home') {
              return <FeatherIcon name="list" size={20} color={isFocused ? '#ffffff' : theme.colors.text3} />;
            }
            if (route.name === 'Profile') {
              return <FeatherIcon name="user" size={20} color={isFocused ? '#ffffff' : theme.colors.text3} />;
            }
            return null;
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}>
              {renderIcon()}
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? '#ffffff' : theme.colors.text3 },
                ]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    position: 'relative',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    position: 'absolute',
    height: 46, // 54 - 4*2
    top: 4,
    left: 0,
    borderRadius: 23,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
