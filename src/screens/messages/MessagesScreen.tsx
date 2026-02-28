import React, {useEffect} from 'react';
import {View, FlatList, ActivityIndicator, RefreshControl, StyleSheet} from 'react-native';
import ConversationItem from '../../components/messages/ConversationItem';
import EmptyState from '../../components/common/EmptyState';
import {useMessagesStore} from '../../stores/messagesStore';
import {useColors} from '../../theme';
import type {ConversationListItem} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MessagesStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Messages'>;

export default function MessagesScreen({navigation}: Props) {
  const c = useColors();
  const {conversations, isLoading, fetchConversations} = useMessagesStore();

  useEffect(() => {
    fetchConversations();
  }, []);

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
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchConversations} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="message-text-outline"
              title="No conversations"
              subtitle="Start a conversation from someone's profile"
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
