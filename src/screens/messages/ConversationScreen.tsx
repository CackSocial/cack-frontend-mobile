import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MessageBubble from '../../components/messages/MessageBubble';
import {useConversation} from '../../hooks/useConversation';
import {useMessagesStore} from '../../stores/messagesStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts, radii, sizes, spacing, timing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import {sendMessage as sendMessageApi} from '../../api/messages';
import {MAX_POST_LENGTH} from '../../config';
import type {Message, ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MessagesStackParamList} from '../../navigation/types';
import {useConversationLiveUpdates} from '../../hooks/useConversationLiveUpdates';
import {useImagePicker} from '../../hooks/useImagePicker';
import {createOptimisticMessageId} from '../../utils/messages';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Conversation'>;

export default function ConversationScreen({route}: Props) {
  const {username, userId} = route.params;
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const wsSend = useMessagesStore(s => s.sendMessage);

  const {messages, setMessages, loading, hasMore, refresh, loadMore, addMessage} =
    useConversation(username);

  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<ImageAsset | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const pickImage = useImagePicker({
    context: 'ConversationScreen:pickImage',
    onPicked: setImagePreview,
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  useConversationLiveUpdates({
    username,
    currentUserId: currentUser?.id,
    messages,
    setMessages,
  });

  const handleSend = async () => {
    const trimmedText = text.trim();
    if ((!trimmedText && !imagePreview) || sending) return;

    if (imagePreview) {
      // Optimistic add so the real message from WS replaces it (same as text)
      const optimistic: Message = {
        id: createOptimisticMessageId(),
        sender_id: currentUser?.id || '',
        receiver_id: userId,
        content: trimmedText,
        image_url: imagePreview.uri,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      const prevImage = imagePreview;
      addMessage(optimistic);
      setText('');
      setImagePreview(null);
      setSending(true);
      try {
        await sendMessageApi(username, trimmedText, prevImage);
      } catch (e: unknown) {
        setMessages(current => current.filter(m => m.id !== optimistic.id));
        Alert.alert('Error', getErrorMessage(e));
      }
      setSending(false);
    } else {
      // Text-only via WebSocket
      const sent = wsSend(userId, trimmedText);
      if (!sent) {
        Alert.alert('Error', 'Unable to send message right now. Please try again.');
        return;
      }

      // Optimistic add
      const optimistic: Message = {
        id: createOptimisticMessageId(),
        sender_id: currentUser?.id || '',
        receiver_id: userId,
        content: trimmedText,
        image_url: '',
        read_at: null,
        created_at: new Date().toISOString(),
      };
      addMessage(optimistic);
      setText('');
    }

    // Scroll to bottom
    setTimeout(() => {
      listRef.current?.scrollToEnd({animated: true});
    }, timing.scrollToEndDelayMs);
  };

  const renderMessage = ({item}: {item: Message}) => (
    <MessageBubble
      message={item}
      isOwn={item.sender_id === currentUser?.id}
    />
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={sizes.conversation.keyboardOffset}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({animated: false})
        }
        ListHeaderComponent={
          loading ? (
            <ActivityIndicator style={sharedStyles.inlineLoader} size="small" />
          ) : hasMore ? (
            <TouchableOpacity
              onPress={loadMore}
              style={styles.loadMoreBtn}
              accessibilityLabel="Load older messages">
              <Text style={[styles.loadMoreText, {color: c.textTertiary}]}>
                Load older messages
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {imagePreview && (
        <View style={styles.imagePreviewRow}>
          <Image source={{uri: imagePreview.uri}} style={styles.previewThumb} />
          <TouchableOpacity onPress={() => setImagePreview(null)}>
            <Icon name="close-circle" size={22} color={c.danger} />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.composerShell,
          {
            backgroundColor: c.bgPrimary,
            borderTopColor: c.border,
          },
        ]}>
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: c.bgSecondary,
              borderColor: c.borderStrong,
            },
          ]}>
          <TouchableOpacity
            onPress={pickImage}
            style={[styles.iconBtn, {backgroundColor: c.bgTertiary}]}
            accessibilityLabel="Attach image"
            accessibilityRole="button">
            <Icon name="image-outline" size={20} color={c.textMuted} />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.textInput,
              {color: c.textPrimary},
            ]}
            placeholder="Type a message..."
            placeholderTextColor={c.textMuted}
             value={text}
             onChangeText={setText}
             multiline
             maxLength={MAX_POST_LENGTH}
             accessibilityLabel="Message input"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={(!text.trim() && !imagePreview) || sending}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  text.trim() || imagePreview ? c.accent : c.bgTertiary,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message">
            {sending ? (
              <ActivityIndicator size="small" color={c.accentText} />
            ) : (
              <Icon
                name="send"
                size={18}
                color={
                  text.trim() || imagePreview ? c.accentText : c.textMuted
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  listContent: {
    paddingVertical: spacing[2],
    paddingBottom: spacing[4],
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  loadMoreText: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyMedium,
  },
  composerShell: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing[2],
  },
  iconBtn: {
    width: sizes.iconButton.lg,
    height: sizes.iconButton.lg,
    borderRadius: sizes.iconButton.lg / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: typography.base,
    fontFamily: fonts.body,
    maxHeight: sizes.conversation.inputMaxHeight,
    paddingVertical: spacing[2],
    paddingHorizontal: 2,
  },
  sendBtn: {
    width: sizes.iconButton.lg,
    height: sizes.iconButton.lg,
    borderRadius: sizes.iconButton.lg / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  previewThumb: {
    width: sizes.conversation.imagePreview,
    height: sizes.conversation.imagePreview,
    borderRadius: radii.lg,
  },
});
