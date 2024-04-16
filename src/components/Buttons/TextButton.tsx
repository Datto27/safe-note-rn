import { StyleSheet, Text, TextStyle, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';

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
          color ? { color } : { color: theme.colors.secondary },
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
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  text: {
    // fontFamily: 'JosefinSans-Medium',
    fontSize: 15,
    marginTop: 2,
  },
});
