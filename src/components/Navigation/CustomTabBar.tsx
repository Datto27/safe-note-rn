import React, { useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalState } from '../../contexts/GlobaState';
import { isFlatTheme, SCREEN_PADDING } from '../../constants/globalStyles';

const TAB_BAR_MARGIN = SCREEN_PADDING;
const TAB_BAR_PADDING = 4;
const ICON_SIZE = 22;
const SPRING = { damping: 20, stiffness: 90 };

const TAB_ICONS: Record<string, string> = {
  Home: 'list',
  Todo: 'check-square',
  Reminders: 'bell',
  Profile: 'user',
};

type TabItemProps = {
  label: string;
  icon?: string;
  isFocused: boolean;
  width: number;
  inactiveColor: string;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
};

// Inactive tabs show only the icon; the focused tab widens to fit its label
const TabItem = ({
  label,
  icon,
  isFocused,
  width,
  inactiveColor,
  accessibilityLabel,
  onPress,
  onLongPress,
}: TabItemProps) => {
  const animatedWidth = useAnimatedStyle(() => ({
    width: withSpring(width, SPRING),
  }));
  // Opacity only: a layout (entering) animation would pin the label to the
  // position it had while the tab was still narrow, on top of the icon
  const labelOpacity = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    labelOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, labelOpacity]);
  const animatedLabel = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));
  const color = isFocused ? '#ffffff' : inactiveColor;

  return (
    <Animated.View style={animatedWidth}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabItem}>
        {icon && <FeatherIcon name={icon} size={ICON_SIZE} color={color} />}
        {isFocused && (
          <Animated.Text
            numberOfLines={1}
            style={[styles.label, animatedLabel, { color }]}>
            {label}
          </Animated.Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

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

  // The focused tab takes two shares of the width, every other tab one
  const innerWidth = TAB_BAR_WIDTH - TAB_BAR_PADDING * 2;
  const inactiveWidth = innerWidth / (state.routes.length + 1);
  const activeWidth = inactiveWidth * 2;

  useEffect(() => {
    translateX.value = withSpring(
      TAB_BAR_PADDING + state.index * inactiveWidth,
      SPRING,
    );
  }, [state.index, inactiveWidth, translateX]);

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
          !isFlatTheme(theme.type) && styles.tabBarShadow,
          { backgroundColor: theme.colors.background2, width: TAB_BAR_WIDTH },
        ]}>
        <Animated.View
          style={[
            styles.indicator,
            animatedIndicatorStyle,
            { width: activeWidth, backgroundColor: theme.colors.primary },
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

          return (
            <TabItem
              key={route.key}
              label={label as string}
              icon={TAB_ICONS[route.name]}
              isFocused={isFocused}
              width={isFocused ? activeWidth : inactiveWidth}
              inactiveColor={theme.colors.text3}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
            />
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
    padding: TAB_BAR_PADDING,
  },
  tabBarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    position: 'absolute',
    height: 46, // 54 - 4*2
    top: TAB_BAR_PADDING,
    left: 0,
    borderRadius: 23,
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  label: {
    // Shrink with the tab while it springs open instead of overlapping
    flexShrink: 1,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});
