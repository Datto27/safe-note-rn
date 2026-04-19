import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';
import { globalStyles } from '../../constants/globalStyles';

type Props = {
  text: string;
  icon?: any;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  onPress: () => void;
};

const SecondaryButton = ({
  text,
  icon,
  style,
  containerStyle,
  onPress,
}: Props) => {
  const { theme } = useGlobalState();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: 1,
        },
        containerStyle,
      ]}
      onPress={onPress}>
      {icon}
      <Text style={[styles.text, { color: theme.colors.btnText2 }, style]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 100,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
