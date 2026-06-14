/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';

// Notifee requires a background event handler to be registered at the top level.
// Pressing a reminder uses the default press action, which brings the app to the
// foreground; no extra handling is needed here.
notifee.onBackgroundEvent(async () => {});

AppRegistry.registerComponent(appName, () => App);
