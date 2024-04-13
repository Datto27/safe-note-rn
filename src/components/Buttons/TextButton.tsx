import { StyleSheet, Text, TextStyle, TouchableOpacity } from 'react-native';
import React from 'react';
import { colorsDark } from '../../constants/colors';

type Props = {
  text: string;
  color?: string;
  style?: TextStyle;
  onPress: () => void;
};

const TextButton = ({ text, color, style, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={style ? style : styles.container}
      onPress={onPress}>
      <Text style={[styles.text, color ? { color } : {}]}>{text}</Text>
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
    fontFamily: 'JosefinSans-Medium',
    fontSize: 15,
<<<<<<< Updated upstream
    color: colorsDark.secondary,
    marginTop: 2,
=======
>>>>>>> Stashed changes
  },
});
