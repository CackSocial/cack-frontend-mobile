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
import {useColors, fonts} from '../../theme';
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

  const {messages, loading, hasMore, refresh, loadMore, addMessage} =
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
      if (
        newest &&
        newest.sender_id !== currentUser?.id &&
        !seenMessageIdsRef.current.has(newest.id)
      ) {
        seenMessageIdsRef.current.add(newest.id);
        addMessage(newest);
      }
    });
    return unsub;
  }, [username, addMessage, currentUser?.id]);

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
      } catch (e: any) {
        Alert.alert('Error', e.message);
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
            <ActivityIndicator style={{paddingVertical: 12}} size="small" />
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
            <Icon name="close-circle" size={22} color="#ef4444" />
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
    paddingVertical: 8,
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadMoreText: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
  composerShell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.body,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  previewThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});
