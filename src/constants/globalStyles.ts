import { StyleSheet } from 'react-native';
import { colorsNeon } from './colors';

export const globalStyles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  textShadow: {
    textShadowRadius: 15,
    textShadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
});
