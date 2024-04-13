import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { colorsDark, colorsLight } from './src/constants/colors';
import MainStack from './src/routes/MainStackNavigator';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {};

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
    });
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
  }, []);

  return (
<<<<<<< Updated upstream
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </SafeAreaView>
=======
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
>>>>>>> Stashed changes
  );
}

export default App;
