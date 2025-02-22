import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useGlobalState } from '../contexts/GlobaState';
import { ThemeEnum } from '../enums/theme';

const CustomDrawer = (props: DrawerContentComponentProps) => {
  const { theme } = useGlobalState();

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={[styles.header, { backgroundColor: theme.colors.background2 }]}>
        <Image
          source={
            theme.type === ThemeEnum.YELLOW
              ? require('../assets/safe_note_yellow.png')
              : require('../assets/safe_note.png')
          }
          style={styles.safeImage}
        />
        <Text style={[styles.title, { color: theme.colors.text1 }]}>
          Safe Note
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: 'JosefinSans-Bold',
    fontSize: 24,
  },
  safeImage: {
    height: 60,
    width: 60,
    marginRight: 15,
  },
});
