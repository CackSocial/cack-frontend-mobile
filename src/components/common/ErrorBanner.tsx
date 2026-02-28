import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({message, onRetry}: Props) {
  return (
    <View style={styles.banner}>
      <Icon name="alert-circle-outline" size={20} color="#fef2f2" />
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry">
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  text: {
    color: '#fef2f2',
    fontSize: 14,
    flex: 1,
  },
  retry: {
    color: '#fef2f2',
    fontWeight: '700',
    fontSize: 14,
  },
});
