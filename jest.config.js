module.exports = {
  preset: 'react-native',
  // crypto-es ships ES modules only, so it has to go through babel like the
  // react-native packages the preset already transforms.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|crypto-es)/)',
  ],
};
