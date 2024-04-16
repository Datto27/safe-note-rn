import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import React from 'react';
import { colorsDark } from '../../constants/colors';

type Props = {
  text: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
};

const PrimaryButton = ({ text, onPress, containerStyle }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorsDark.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colorsDark.secondary,
  },
  text: {
    fontFamily: 'JosefinSans-Medium',
    color: colorsDark.text1,
    marginTop: 2,
  },
});
