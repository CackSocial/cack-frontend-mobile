import {StyleSheet} from 'react-native';
import {spacing} from '../theme';

export const sharedStyles = StyleSheet.create({
  listLoader: {
    paddingVertical: spacing[6],
  },
  centerLoader: {
    paddingVertical: spacing[8],
  },
  smallLoader: {
    paddingVertical: spacing[4],
  },
  inlineLoader: {
    paddingVertical: spacing[3],
  },
  paddedListContent: {
    paddingBottom: spacing[8],
  },
});
