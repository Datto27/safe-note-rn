import { Image, StyleSheet, View } from 'react-native';
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
      <View style={styles.header}>
        <Image
          source={
            theme.type === ThemeEnum.YELLOW
              ? require('../assets/safe_note_yellow.png')
              : require('../assets/safe_note.png')
          }
          style={styles.safeImage}
        />
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingRight: 10,
  },
  safeImage: {
    height: 80,
    width: 80,
  },
});
