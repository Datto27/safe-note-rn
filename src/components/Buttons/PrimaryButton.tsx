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
  text?: string;
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
        {
          backgroundColor: theme.colors.btn1,
          shadowColor: theme.colors.shadowColor2,
        },
        containerStyle,
      ]}
      onPress={onPress}>
      {icon}
      {text && (
        <Text style={[styles.text, { ...style, color: theme.colors.btnText1 }]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 100,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
