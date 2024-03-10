import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { colorsDark } from '../../constants/colors';

type Props = {
  text: string;
  color?: string;
  onPress: () => void;
};

const TextButton = ({ text, color, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
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
    fontSize: 15,
    color: colorsDark.secondary,
  },
});
