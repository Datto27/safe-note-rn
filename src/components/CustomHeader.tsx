import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderProps } from '@react-navigation/stack';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useGlobalState } from '../contexts/GlobaState';
import TextButton from './Buttons/TextButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomHeader = ({ route }: StackHeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useGlobalState();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'transparent',
          borderBottomColor: theme.colors.modalBorder,
          marginTop: insets.top,
        },
      ]}>
      <TouchableOpacity
        style={{ width: 80, padding: 10 }}
        onPress={() => navigation.goBack()}>
        <FeatherIcon name="chevron-left" size={28} color={theme.colors.text1} />
      </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '600',
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyView: {
    width: 80,
  },
});
