import {
  StyleSheet,
  TextInput,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, { Dispatch, useRef, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useGlobalState } from '../../contexts/GlobaState';

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
  const { theme } = useGlobalState();
  const [showEntry, setShowEntry] = useState(type === 'password');

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.container,
        containerStyles,
        {
          backgroundColor: theme.colors.background2_09,
          borderColor: theme.colors.primary,
        },
        error ? styles.error : {},
      ]}
      onPress={() => inputRef.current?.focus()}>
      {multiline ? (
        <TextInput
          ref={inputRef}
          style={[styles.textarea, textStyles, { color: theme.colors.text1 }]}
          multiline={true}
          numberOfLines={numberOfLines}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text3}
          value={value}
          onChangeText={setValue}
        />
      ) : (
        <TextInput
          ref={inputRef}
          secureTextEntry={showEntry}
          style={[styles.input, textStyles, { color: theme.colors.text1 }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text3}
          value={value}
          onChangeText={setValue}
        />
      )}
      {type === 'password' ? (
        showEntry ? (
          <TouchableOpacity onPress={() => setShowEntry(false)}>
            <FeatherIcon name="eye" color={theme.colors.text2} size={20} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowEntry(true)}>
            <FeatherIcon name="eye-off" color={theme.colors.text2} size={20} />
          </TouchableOpacity>
        )
      ) : null}
      <Text style={styles.errorMsg}>{error}</Text>
    </TouchableOpacity>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
  },
  error: {
    borderColor: 'red',
  },
  textarea: {
    flex: 1,
    alignSelf: 'flex-start',
    textAlignVertical: 'top',
    fontFamily: 'JosefinSans-Medium',
    fontSize: 17,
    backgroundColor: 'transparent',
    marginVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'JosefinSans-Medium',
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    marginRight: 5,
    marginVertical: 10,
  },
  errorMsg: {
    position: 'absolute',
    bottom: -19,
    right: 0,
    color: 'red',
  },
});
