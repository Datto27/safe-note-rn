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
  onPress: () => void;
  containerStyle?: ViewStyle;
  style?: TextStyle;
};

const PrimaryButton = ({
  text,
  icon,
  onPress,
  containerStyle,
  style,
}: Props) => {
  const { theme } = useGlobalState();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        globalStyles.shadow,
        containerStyle,
        {
          backgroundColor: theme.colors.btn1,
          borderColor: theme.colors.primary,
          shadowColor: theme.colors.shadowColor2,
        },
      ]}
      onPress={onPress}>
      {icon}
      <Text style={[styles.text, { ...style, color: theme.colors.btnText1 }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
    // fontFamily: 'JosefinSans-Medium',
    // marginTop: 2,
  },
});
