import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather'
import { colorsDark } from '../constants/colors';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>HomeScreen</Text>
      <TouchableOpacity style={styles.addBtn}>
        <FeatherIcon name="plus" size={32} color={colorsDark.text1} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsDark.background1,
  },
  addBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsDark.primary,
    borderRadius: 50,
  },
});
