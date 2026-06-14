module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
    // The CLI (15.0.1) fails to auto-detect datetimepicker's Android platform
    // because its AndroidManifest has no package attribute (it relies on the
    // build.gradle namespace). Declare the Android linking explicitly so the
    // native module is registered.
    '@react-native-community/datetimepicker': {
      platforms: {
        android: {
          sourceDir:
            '../node_modules/@react-native-community/datetimepicker/android',
          packageImportPath:
            'import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;',
          packageInstance: 'new RNDateTimePickerPackage()',
        },
      },
    },
  },
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
