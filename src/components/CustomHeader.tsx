import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderProps } from '@react-navigation/stack';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useGlobalState } from '../contexts/GlobaState';
import TextButton from './Buttons/TextButton';

const CustomHeader = ({ route }: StackHeaderProps) => {
  const navigation = useNavigation();
  const { theme } = useGlobalState();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background2,
          borderBottomColor: theme.colors.modalBorder,
        },
      ]}>
      <TextButton
        text="Go Back"
        style={{ width: 80 }}
        onPress={() => navigation.goBack()}
      />
      <Text style={[styles.title, { color: theme.colors.text1 }]}>
        {route.name}
      </Text>
      <View style={styles.emptyView} />
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    fontFamily: 'JosefinSans-Medium',
    fontSize: 17,
    fontWeight: '500',
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyView: {
    width: 80,
    backgroundColor: 'red',
  },
});
