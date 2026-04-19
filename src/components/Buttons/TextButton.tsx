import { StyleSheet, Text, TextStyle, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';
import { globalStyles } from '../../constants/globalStyles';

type Props = {
  text: string;
  color?: string;
  style?: TextStyle;
  onPress: () => void;
};

const TextButton = ({ text, color, style, onPress }: Props) => {
  const { theme } = useGlobalState();

  return (
    <TouchableOpacity
      style={style ? style : styles.container}
      onPress={onPress}>
      <Text
        style={[
          styles.text,
          color
            ? { color }
            : {
                color: theme.colors.primary,
              },
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default TextButton;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
