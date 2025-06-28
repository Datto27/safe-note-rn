import 'react-native-gesture-handler';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import {
  colorsDark,
  colorsLight,
  colorsNeon,
  colorsYellow,
} from './src/constants/colors';
import MainStack from './src/routes/MainStackNavigator';
import { getData, saveData } from './src/utils/storage';
import { ThemeEnum } from './src/enums/theme';

export type ThemeT = {
  type: ThemeEnum;
  colors: {
    primary: string;
    primary05: string;
    primary02: string;
    secondary: string;
    secondary05: string;
    secondary04: string;
    secondary02: string;
    tertiary: string;
    background1: string;
    background2: string;
    background2_09: string;
    text1: string;
    text2: string;
    text3: string;
    inputText: string;
    btn1: string;
    btn2: string;
    btnText1: string;
    btnText2: string;
    btnText3: string;
    textShadow: string;
    shadowColor1?: string;
    shadowColor2?: string;
    modalBg: string;
    modalShadow: string;
    modalBorder: string;
  };
};

export const AppContext = createContext<{
  theme: ThemeT;
  setTheme: Dispatch<SetStateAction<ThemeT>>;
}>({
  theme: {
    type: ThemeEnum.DARK,
    colors: {
      primary: '',
      primary05: '',
      primary02: '',
      secondary: '',
      secondary05: '',
      secondary04: '',
      secondary02: '',
      tertiary: '',
      background1: '',
      background2: '',
      background2_09: '',
      text1: '',
      text2: '',
      text3: '',
      inputText: '',
      btn1: '',
      btn2: '',
      btnText1: '',
      btnText2: '',
      btnText3: '',
      textShadow: '',
      shadowColor1: undefined,
      shadowColor2: undefined,
      modalBg: '',
      modalShadow: '',
      modalBorder: '',
    },
  },
  setTheme: function (value: React.SetStateAction<ThemeT>): void {
    throw new Error('Function not implemented.');
  },
});

function App(): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeT>({
    type: ThemeEnum.DARK,
    colors: colorsDark,
  });

  useEffect(() => {
    const init = async () => {};
    init().finally(async () => {
      await BootSplash.hide({ fade: true });
    });

    getData('theme').then(res => {
      if (res === ThemeEnum.DARK) {
        setTheme({
          type: ThemeEnum.DARK,
          colors: colorsDark,
        });
      }
      if (res === ThemeEnum.LIGHT) {
        setTheme({
          type: ThemeEnum.LIGHT,
          colors: colorsLight,
        });
      }
      if (res === ThemeEnum.YELLOW) {
        setTheme({
          type: ThemeEnum.YELLOW,
          colors: colorsYellow,
        });
      }
      if (res === ThemeEnum.NEON) {
        setTheme({
          type: ThemeEnum.NEON,
          colors: colorsNeon,
        });
      }
    });
  }, []);

  useEffect(() => {
    saveData('theme', theme.type).then(() => {});
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background1 }}>
        <StatusBar
          barStyle={
            theme.type === ThemeEnum.LIGHT ? 'dark-content' : 'light-content'
          }
          backgroundColor={theme.colors.background1}
          translucent
        />
        <NavigationContainer
          theme={{
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: theme.colors.background1,
            },
          }}>
          <MainStack />
        </NavigationContainer>
      </SafeAreaView>
    </AppContext.Provider>
  );
}

export default App;
