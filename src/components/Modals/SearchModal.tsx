import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { ReactNode, useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import PrimaryButton from '../Buttons/PrimaryButton';
import CustomTextInput from '../Inputs/CustomTextInput';
import { useGlobalState } from '../../contexts/GlobaState';

type Props = {
  visible: boolean;
  text?: string;
  onClose: () => void;
};

const SearchModal = ({ visible, text = '', onClose }: Props) => {
  const { theme } = useGlobalState();
  const [phrase, setPhrase] = useState('');

  useEffect(() => {
    let to: NodeJS.Timeout;

    to = setTimeout(() => {}, 500);

    return () => {
      clearTimeout(to);
    };
  }, [phrase]);

  const highlightText = (phrase: string): ReactNode => {
    if (!phrase.trim()) {
      return (
        <Text style={[styles.text, { color: theme.colors.inputText }]}>
          {text}
        </Text>
      );
    }

    const regex = new RegExp(`(${phrase})`, 'gi');
    const parts = text?.split(regex);

    return parts.map((part, i) => {
      return regex.test(part) ? (
        <Text
          key={i}
          style={[
            styles.text,
            {
              backgroundColor: theme.colors.primary,
              color: theme.colors.inputText,
            },
          ]}>
          {part}
        </Text>
      ) : (
        <Text key={i} style={[styles.text, { color: theme.colors.inputText }]}>
          {part}
        </Text>
      );
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background1 },
        ]}>
        <View style={styles.header}>
          <CustomTextInput
            placeholder="Search"
            containerStyles={{
              flex: 1,
              marginRight: 5,
              backgroundColor: 'red',
            }}
            value={phrase}
            setValue={setPhrase}
          />
          <PrimaryButton
            icon={
              <FeatherIcon name="x" color={theme.colors.btnText1} size={20} />
            }
            containerStyle={{
              marginVertical: 0,
              marginHorizontal: 0,
            }}
            onPress={onClose}
          />
        </View>
        <View
          style={[
            styles.textContainer,
            {
              backgroundColor: theme.colors.background2,
              borderColor: theme.colors.primary05,
            },
          ]}>
          <ScrollView style={styles.container}>
            <Text style={{ fontSize: 16, lineHeight: 22 }}>
              {highlightText(phrase)}
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    marginTop: 5,
    paddingVertical: 10,
    marginHorizontal: 15,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    padding: 10,
  },
  text: {
    flex: 1,
    fontFamily: 'JosefinSans-Medium',
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    marginRight: 5,
    marginVertical: 10,
  },
});
