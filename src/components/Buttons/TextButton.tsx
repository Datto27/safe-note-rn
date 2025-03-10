import { StyleSheet, Text, TextStyle, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGlobalState } from '../../contexts/GlobaState';
import { globalStyles } from '../../constants/globalStyles';

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
          globalStyles.textShadow,
          color
            ? { color, textShadowColor: theme.colors.textShadow }
            : {
                color: theme.colors.btnText2,
                textShadowColor: theme.colors.textShadow,
              },
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default TextButton;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
  },
});
