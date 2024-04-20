import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';

type Props = {
  text: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
};

const PrimaryButton = ({ text, onPress, containerStyle }: Props) => {
  const { theme } = useGlobalState();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: theme.colors.btn1,
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={onPress}>
      <Text style={[styles.text, { color: theme.colors.btnText1 }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    // fontFamily: 'JosefinSans-Medium',
    // marginTop: 2,
  },
});
