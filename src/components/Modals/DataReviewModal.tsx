import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getData, saveData } from '../../utils/storage';
import { useGlobalState } from '../../contexts/GlobaState';
import SecondaryButton from '../Buttons/SecondaryButton';
import TextButton from '../Buttons/TextButton';
import { colorsYellow } from '../../constants/colors';
import CustomTextInput from '../Inputs/CustomTextInput';
import { decryptData, encryptData } from '../../utils/encrypt.private';
import { NoteI } from '../../interfaces/note';

type Props = {
  visible: boolean;
  type: string | null;
  text: string;
  onClose: () => void;
};

const DataReviewModal = ({ visible, type, text, onClose }: Props) => {
  const { theme } = useGlobalState();
  const [data, setData] = useState({});
  const [key, setKey] = useState('');
  const [newData, setNewData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let to1: NodeJS.Timeout, to2: NodeJS.Timeout;

  useEffect(() => {
    if (visible) {
      getData('notes').then((res: { [key: string]: NoteI }) => {
        console.log('fetch');
        const items = Object.values(res)
          .filter(obj => obj.deleted !== true)
          .reduce((obj, cur) => ({ ...obj, [cur.id]: cur }), {});
        setData(items);
      });
    }
    return () => {
      clearTimeout(to1);
      clearTimeout(to2);
      setIsLoading(false);
      setCopied(false);
      setNewData('');
    };
  }, [visible]);

  const copyToClipboard = () => {
    setIsLoading(true);
    Clipboard.setString(JSON.stringify(data));
    to1 = setTimeout(() => {
      setIsLoading(false);
      setCopied(true);
      to2 = setTimeout(() => {
        onClose();
      }, 600);
    }, 1000);
  };

  const saveImport = async () => {
    setIsLoading(true);
    try {
      const parse = JSON.parse(newData);
      const localKey = await getData('key');
      if (key) {
        Object.keys(parse).forEach(k => {
          let info = decryptData(parse[k]?.info, key);
          if (localKey && info) {
            info = encryptData(info, localKey);
          }
          parse[k] = { ...parse[k], info: info };
        });
      }
      saveData('notes', { ...data, ...parse }).then(res => {
        setIsLoading(false);
        setCopied(true);
        to2 = setTimeout(() => {
          onClose();
        }, 600);
      });
    } catch (err) {
      setError('Syntax Error!');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background2_09 },
        ]}>
        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.colors.background2 },
          ]}>
          <ScrollView contentContainerStyle={[styles.dataScroll]}>
            {type === 'export' ? (
              <Text style={[{ color: theme.colors.text2 }]}>
                {JSON.stringify(data, null, 2)}
              </Text>
            ) : (
              <>
                <CustomTextInput
                  placeholder="Encryption Key"
                  containerStyles={{
                    width: '100%',
                    marginBottom: 10,
                  }}
                  value={key}
                  setValue={val => setKey(val.toLowerCase())}
                />
                <CustomTextInput
                  multiline
                  placeholder="Input Data For import"
                  containerStyles={{
                    flex: 1,
                    height: '100%',
                    width: '100%',
                  }}
                  error={error}
                  value={newData}
                  setValue={setNewData}
                />
              </>
            )}
          </ScrollView>
        </View>
        <View style={styles.btnsContainer}>
          <TextButton
            text="Cancel"
            color={colorsYellow.primary}
            onPress={onClose}
          />
          {type === 'export' ? (
            <SecondaryButton
              text="Copy"
              icon={
                isLoading ? (
                  <ActivityIndicator
                    color={theme.colors.secondary}
                    size={'small'}
                    style={{ marginRight: 10 }}
                  />
                ) : copied ? (
                  <FeatherIcon
                    name="check"
                    color={'green'}
                    style={{ marginRight: 5 }}
                  />
                ) : (
                  <FeatherIcon
                    name="copy"
                    color={theme.colors.text2}
                    style={{ marginRight: 5 }}
                  />
                )
              }
              onPress={copyToClipboard}
            />
          ) : (
            <SecondaryButton
              text="Save"
              icon={
                isLoading ? (
                  <ActivityIndicator
                    color={theme.colors.secondary}
                    size={'small'}
                    style={{ marginRight: 10 }}
                  />
                ) : copied ? (
                  <FeatherIcon
                    name="check"
                    color={'green'}
                    style={{ marginRight: 5 }}
                  />
                ) : (
                  <FeatherIcon
                    name="save"
                    color={theme.colors.text2}
                    style={{ marginRight: 5 }}
                  />
                )
              }
              onPress={saveImport}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DataReviewModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  formContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 400,
    width: '96%',
    marginVertical: 40,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  dataScroll: {
    flexGrow: 1,
    width: '90%',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  btnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
});
