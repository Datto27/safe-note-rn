import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';

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
        { backgroundColor: theme.colors.btn2 },
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  text: {
    // fontFamily: 'JosefinSans-Medium',
    // marginTop: 3,
  },
});
