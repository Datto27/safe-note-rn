import { StyleSheet } from 'react-native';
import { colorsNeon } from './colors';

export const globalStyles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  textShadow: {
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  card: {
    borderRadius: 24,
    padding: 16,
  },
});
