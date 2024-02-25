import {
  StyleSheet,
  TextInput,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import React, { Dispatch, useRef } from 'react';
import { colorsDark } from '../../constants/colors';

type Props = {
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  value: string;
  setValue: Dispatch<React.SetStateAction<string>>;
  containerStyles?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
  error?: string | null;
};

const CustomTextInput = ({
  value,
  setValue,
  placeholder,
  multiline,
  numberOfLines,
  containerStyles,
  textStyles,
  error,
}: Props) => {
  const inputRef = useRef<TextInput | null>(null);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.container, containerStyles, error ? styles.error : {}]}
      onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        style={[styles.input, textStyles]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
      />
    </TouchableOpacity>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorsDark.secondary04,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colorsDark.primary,
  },
  error: {
    borderColor: 'red',
  },
  input: {
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});
