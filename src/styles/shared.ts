import {StyleSheet} from 'react-native';

// REFACTORED: Extracted shared styles used across multiple screens
// to avoid inline style objects that cause unnecessary re-renders.
export const sharedStyles = StyleSheet.create({
  listLoader: {
    paddingVertical: 20,
  },
  centerLoader: {
    paddingVertical: 24,
  },
  smallLoader: {
    paddingVertical: 16,
  },
  inlineLoader: {
    paddingVertical: 12,
  },
});
