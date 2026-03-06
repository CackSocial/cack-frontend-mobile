import React, {useEffect, useLayoutEffect} from 'react';
import {View, FlatList, TouchableOpacity, StyleSheet, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ConversationItem from '../../components/messages/ConversationItem';
import EmptyState from '../../components/common/EmptyState';
import {useMessagesStore} from '../../stores/messagesStore';
import {useColors} from '../../theme';
import {sharedStyles} from '../../styles/shared';
import type {ConversationListItem} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MessagesStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Messages'>;

export default function MessagesScreen({navigation}: Props) {
  const c = useColors();
  const conversations = useMessagesStore(s => s.conversations);
  const isLoading = useMessagesStore(s => s.isLoading);
  const fetchConversations = useMessagesStore(s => s.fetchConversations);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('NewConversation')}
          style={{padding: 4}}
          accessibilityLabel="New message"
          accessibilityRole="button">
          <Icon name="square-edit-outline" size={22} color={c.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, c]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const renderItem = ({item}: {item: ConversationListItem}) => (
    <ConversationItem
      conversation={item}
      onPress={() =>
        navigation.navigate('Conversation', {
          username: item.user.username,
          userId: item.user.id,
          displayName: item.user.display_name,
        })
      }
    />
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}> 
      <FlatList
        data={conversations}
        keyExtractor={item => item.user.id}
        renderItem={renderItem}
        contentContainerStyle={sharedStyles.paddedListContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchConversations} />}
        ListEmptyComponent={
          !isLoading ? <EmptyState icon="message-text-outline" title="No conversations yet" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
