import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { colorsDark } from '../../constants/colors';

type Props = {
  text: string;
  onPress: () => void;
};

const SecondaryButton = ({ text, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorsDark.secondary02,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colorsDark.background2,
  },
  text: {
<<<<<<< Updated upstream
    fontFamily: 'JosefinSans-Medium',
    color: colorsDark.secondary,
    marginTop: 2,
=======
    // fontFamily: 'JosefinSans-Medium',
>>>>>>> Stashed changes
  },
});
