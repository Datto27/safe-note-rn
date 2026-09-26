import { ThemeT } from '../../App';

// Destructive actions look the same in every theme
export const dangerColor = '#ef4444';
export const dangerTint = 'rgba(239, 68, 68, 0.12)';

export const colorsDark: ThemeT['colors'] = {
  primary: '#01497c', // Deep Ocean Blue
  primary05: 'rgba(1, 73, 124, 0.5)',
  primary02: 'rgba(1, 73, 124, 0.2)',
  secondary: '#0d1b2a', // Deep Navy
  secondary05: 'rgba(13, 27, 42, 0.5)',
  secondary04: 'rgba(13, 27, 42, 0.4)',
  secondary02: 'rgba(13, 27, 42, 0.2)',
  tertiary: '#060e17',
  background1: '#060e17', // Abyss
  background2: '#0d1b2a', // Deep Navy
  background2_09: 'rgba(13, 27, 42, 0.9)',
  text1: '#f8fafc',
  text2: '#a9d6e5',
  text3: '#64748b',
  inputText: '#f8fafc',
  btn1: '#01497c',
  btn2: 'transparent',
  btnText1: '#ffffff',
  btnText2: '#48cae4', // Aqua
  btnText3: '#94a3b8',
  textShadow: 'transparent',
  shadowColor1: 'rgba(0, 0, 0, 0.1)',
  shadowColor2: 'rgba(0, 0, 0, 0.2)',
  modalBg: '#10243a',
  modalShadow: 'rgba(0, 0, 0, 0.5)',
  modalBorder: '#1b3a4b',
  inputBg: '#060e17',
  inputBorder: '#1b3a4b',
  inputFocus: '#48cae4',
};

export const colorsLight: ThemeT['colors'] = {
  // Flat design: surfaces are separated by tone, never by shadow
  primary: '#1b263b', // Navy
  primary05: 'rgba(27, 38, 59, 0.5)',
  primary02: 'rgba(27, 38, 59, 0.1)',
  secondary: '#415a77', // Slate Blue
  secondary05: '#f4f5f2', // card surface
  secondary04: 'rgba(65, 90, 119, 0.4)',
  secondary02: 'rgba(65, 90, 119, 0.2)',
  tertiary: '#e0e1dd',
  background1: '#e0e1dd', // Platinum
  background2: '#f4f5f2',
  background2_09: 'rgba(244, 245, 242, 0.9)',
  text1: '#0d1b2a',
  text2: '#415a77',
  text3: '#6b7280', // Gray
  inputText: '#0d1b2a',
  btn1: '#1b263b',
  btn2: '#d3d5d0',
  btnText1: '#ffffff',
  btnText2: '#415a77',
  btnText3: '#6b7280',
  textShadow: 'transparent',
  shadowColor1: 'transparent',
  shadowColor2: 'transparent',
  modalBg: '#f4f5f2',
  modalShadow: 'transparent',
  modalBorder: '#c9cbc5',
  inputBg: '#ffffff',
  inputBorder: '#c9cbc5',
  inputFocus: '#415a77',
};

export const colorsYellow: ThemeT['colors'] = {
  primary: 'rgba(255, 170, 4, 1)',
  primary05: 'rgba(255, 185, 4, 0.2)',
  primary02: 'rgba(255, 185, 4, 0.1)',
  secondary: 'rgba(255, 200, 4, 1)',
  secondary05: 'rgba(255, 185, 4, 0.3)',
  secondary04: 'rgba(255, 185, 4, 0.2)',
  secondary02: 'rgba(255, 185, 4, 0.1)',
  tertiary: 'rgba(255, 200, 4, 1)',
  background1: 'rgba(14, 14, 14, 1)',
  background2: 'rgba(8, 8, 8, 1)',
  background2_09: 'rgba(8, 8, 8, 0.9)',
  text1: 'white',
  text2: 'rgba(170, 170, 170, 1)',
  text3: 'rgba(70, 70, 70, 1)',
  inputText: 'white',
  btn1: 'rgba(255, 170, 4, 0.8)',
  btn2: 'rgba(255, 185, 4, 0.2)',
  btnText1: 'white',
  btnText2: 'rgba(255, 200, 4, 1)',
  btnText3: 'rgba(153, 153, 153, 1)',
  textShadow: 'transparent',
  shadowColor1: 'transparent',
  shadowColor2: 'transparent',
  modalBg: 'rgba(20, 20, 20, 1)',
  modalShadow: 'transparent',
  modalBorder: 'transparent',
  inputBg: 'rgba(8, 8, 8, 1)',
  inputBorder: 'rgba(255, 185, 4, 0.25)',
  inputFocus: 'rgba(255, 200, 4, 1)',
};

export const colorsNeon: ThemeT['colors'] = {
  primary: 'rgb(224, 0, 112)',
  primary05: 'rgb(181, 1, 91)',
  primary02: 'rgb(164, 0, 82)',
  secondary: 'rgba(50, 0, 80, 0.9)',
  secondary05: 'rgba(63, 0, 100, 0.6)',
  secondary04: 'rgba(70, 30, 110, 0.5)',
  secondary02: 'rgba(70, 30, 120, 0.3)',
  tertiary: '#FF1493',
  background1: 'rgb(0, 0, 20)',
  background2: 'rgb(0, 0, 10)',
  background2_09: 'rgba(0, 0, 30, 0.9)',
  text1: 'rgb(255, 0, 100)',
  text2: 'rgb(255, 102, 178)',
  text3: 'rgb(227, 141, 184)',
  inputText: 'rgb(255, 0, 100)',
  btn1: 'rgba(0, 0, 8, 0.8)',
  btn2: 'rgba(0, 0, 34, 0.8)',
  btnText1: 'rgb(255, 0, 100)',
  btnText2: 'rgb(255, 102, 178)',
  btnText3: 'rgb(255, 102, 178)',
  textShadow: 'rgba(255, 0, 50, 0.7)',
  shadowColor1: 'rgba(255, 0, 50, 0.7)',
  shadowColor2: 'rgba(200, 0, 150, 0.7)',
  modalBg: 'rgba(0, 0, 20, 0.95)',
  modalShadow: 'rgba(255, 0, 0, 0.9)',
  modalBorder: 'transparent',
  inputBg: 'rgb(0, 0, 8)',
  inputBorder: 'rgba(255, 0, 100, 0.35)',
  inputFocus: 'rgb(255, 0, 100)',
};
