import { Image, StyleSheet, View } from 'react-native';
import React from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

const CustomDrawer = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={require('../assets/safe_note.png')}
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
    // alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingLeft: 10,
  },
  safeImage: {
    height: 80,
    width: 80,
  },
});
