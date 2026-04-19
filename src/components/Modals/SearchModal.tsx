import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <View style={styles.header}>
            <CustomTextInput
              placeholder="Search in note..."
              containerStyles={{
                flex: 1,
                marginRight: 12,
              }}
              value={phrase}
              setValue={setPhrase}
            />
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.colors.background2, borderColor: theme.colors.modalBorder }]}
              onPress={onClose}>
              <FeatherIcon name="x" color={theme.colors.text1} size={24} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.textContainer,
              {
                backgroundColor: theme.colors.background1,
              },
            ]}>
            <ScrollView 
              style={styles.container}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={{ fontSize: 16, lineHeight: 28, color: theme.colors.text1 }}>
                {highlightText(phrase)}
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});
