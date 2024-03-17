import {
  StyleSheet,
  TextInput,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import React, { Dispatch, useRef, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colorsDark } from '../../constants/colors';

type Props = {
  placeholder: string;
  type?: 'password' | 'text';
  multiline?: boolean;
  numberOfLines?: number;
  value: string;
  setValue: Dispatch<React.SetStateAction<string>>;
  containerStyles?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
  error?: string | null;
};

const CustomTextInput = ({
  type = 'text',
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
  const [showEntry, setShowEntry] = useState(type === 'password');

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.container, containerStyles, error ? styles.error : {}]}
      onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        secureTextEntry={showEntry}
        style={[styles.input, textStyles]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
      />
      {type === 'password' ? (
        showEntry ? (
          <TouchableOpacity onPress={() => setShowEntry(false)}>
            <FeatherIcon name="eye" color={colorsDark.text2} size={22} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowEntry(true)}>
            <FeatherIcon name="eye-off" color={colorsDark.text2} size={22} />
          </TouchableOpacity>
        )
      ) : null}
    </TouchableOpacity>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    marginRight: 5,
  },
});
