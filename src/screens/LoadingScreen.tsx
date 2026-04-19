import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';
import { useGlobalState } from '../contexts/GlobaState';

const LoadingScreen = () => {
  const { theme } = useGlobalState();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
