import 'react-native-gesture-handler';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { colorsDark, colorsLight, colorsYellow } from './src/constants/colors';
import MainStack from './src/routes/MainStackNavigator';
import { getData, saveData } from './src/utils/storage';
import { ThemeEnum } from './src/enums/theme';

type ThemeT = {
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
  };
};

export const AppContext = createContext<{
  theme: ThemeT;
  setTheme: Dispatch<SetStateAction<ThemeT>>;
}>({});

function App(): React.JSX.Element {
  const [theme, setTheme] = useState({
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
    });
  }, []);

  useEffect(() => {
    saveData('theme', theme.type).then(() => {});
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background2}}>
        <StatusBar
          barStyle={theme.type === ThemeEnum.LIGHT ? 'dark-content' : 'light-content'}
          backgroundColor={theme.colors.background1}
          translucent
        />
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </SafeAreaView>
    </AppContext.Provider>
  );
}

export default App;
