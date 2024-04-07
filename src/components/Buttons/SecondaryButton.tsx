import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';

type Props = {
  text: string;
  onPress: () => void;
};

const SecondaryButton = ({ text, onPress }: Props) => {
  const {theme} = useGlobalState();

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.colors.secondary02}]} onPress={onPress}>
      <Text style={[styles.text, { color: theme.colors.secondary }]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  text: {
    fontFamily: 'JosefinSans-Medium',
    marginTop: 3,
  },
});
