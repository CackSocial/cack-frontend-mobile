import React, {useEffect, useState, useCallback, useRef} from 'react';
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
import {launchImageLibrary} from 'react-native-image-picker';
import MessageBubble from '../../components/messages/MessageBubble';
import {useConversation} from '../../hooks/useConversation';
import {useMessagesStore} from '../../stores/messagesStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts, radii, spacing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import {sendMessage as sendMessageApi} from '../../api/messages';
import {MAX_IMAGE_SIZE_MB} from '../../config';
import type {Message, ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MessagesStackParamList} from '../../navigation/types';

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
  const listRef = useRef<FlatList>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    seenMessageIdsRef.current = new Set(messages.map(m => m.id));
  }, [messages]);

  // Listen for incoming WS messages for this conversation
  useEffect(() => {
    const unsub = useMessagesStore.subscribe(state => {
      const convMsgs = state.messages[username];
      const newest = convMsgs?.[convMsgs.length - 1];
      if (!newest || seenMessageIdsRef.current.has(newest.id)) return;

      if (newest.sender_id !== currentUser?.id) {
        // Incoming message from the other user
        seenMessageIdsRef.current.add(newest.id);
        addMessage(newest);
      } else {
        // Echo of our own message — replace the optimistic tmp-* entry
        seenMessageIdsRef.current.add(newest.id);
        setMessages(prev => {
          const tmpIdx = prev.findIndex(
            m => m.id.startsWith('tmp-') && m.content === newest.content && m.receiver_id === newest.receiver_id,
          );
          if (tmpIdx !== -1) {
            const updated = [...prev];
            updated[tmpIdx] = newest;
            return updated;
          }
          return prev;
        });
      }
    });
    return unsub;
  }, [username, addMessage, setMessages, currentUser?.id]);

  const handleSend = async () => {
    if ((!text.trim() && !imagePreview) || sending) return;

    if (imagePreview) {
      // Image messages go via REST
      setSending(true);
      try {
        const msg = await sendMessageApi(username, text.trim(), imagePreview);
        addMessage(msg);
        setText('');
        setImagePreview(null);
      } catch (e: unknown) {
        Alert.alert('Error', getErrorMessage(e));
      }
      setSending(false);
    } else {
      // Text-only via WebSocket
      wsSend(userId, text.trim());
      // Optimistic add
      const optimistic: Message = {
        id: `tmp-${Date.now()}`,
        sender_id: currentUser?.id || '',
        receiver_id: userId,
        content: text.trim(),
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
    }, 100);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        Alert.alert('Image too large', `Max size is ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }
      setImagePreview({
        uri: asset.uri!,
        fileName: asset.fileName,
        type: asset.type,
        fileSize: asset.fileSize,
      });
    }
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
      keyboardVerticalOffset={88}>
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
            maxLength={5000}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: typography.base,
    fontFamily: fonts.body,
    maxHeight: 100,
    paddingVertical: spacing[2],
    paddingHorizontal: 2,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    width: 60,
    height: 60,
    borderRadius: radii.lg,
  },
});
