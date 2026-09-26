import { StyleSheet } from 'react-native';
import { colorsNeon } from './colors';
import { ThemeEnum } from '../enums/theme';

// Horizontal gap between the screen edge and every top-level component
export const SCREEN_PADDING = 16;

// Flat themes draw no shadows or elevation at all
export const isFlatTheme = (type: ThemeEnum) => type === ThemeEnum.LIGHT;

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
