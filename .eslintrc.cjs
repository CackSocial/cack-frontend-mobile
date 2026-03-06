module.exports = {
  root: true,
  extends: ['@react-native'],
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'coverage/',
  ],
  rules: {
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': 'off',
  },
};
