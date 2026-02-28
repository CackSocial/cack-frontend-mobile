import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
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
import {useThemeStore} from '../../stores/themeStore';
import {sendMessage as sendMessageApi} from '../../api/messages';
import {MAX_IMAGE_SIZE_MB} from '../../config';
import type {Message, ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MessagesStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Conversation'>;

export default function ConversationScreen({route}: Props) {
  const {username, userId} = route.params;
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';
  const currentUser = useAuthStore(s => s.user);
  const wsSend = useMessagesStore(s => s.sendMessage);
  const ws = useMessagesStore(s => s.ws);

  const {messages, loading, hasMore, refresh, loadMore, addMessage} =
    useConversation(username);

  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<ImageAsset | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    refresh();
  }, []);

  // Listen for incoming WS messages for this conversation
  useEffect(() => {
    const unsub = useMessagesStore.subscribe(state => {
      const convMsgs = state.messages[username];
      if (convMsgs && convMsgs.length > messages.length) {
        const newest = convMsgs[convMsgs.length - 1];
        if (newest && !messages.find(m => m.id === newest.id)) {
          addMessage(newest);
        }
      }
    });
    return unsub;
  }, [username, messages.length]);

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
      style={[styles.flex, {backgroundColor: isDark ? '#111827' : '#ffffff'}]}
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
          ) : null
        }
        onStartReached={() => {
          if (hasMore) loadMore();
        }}
        inverted={false}
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
          styles.inputBar,
          {
            backgroundColor: isDark ? '#1f2937' : '#f9fafb',
            borderTopColor: isDark ? '#374151' : '#e5e7eb',
          },
        ]}>
        <TouchableOpacity
          onPress={pickImage}
          accessibilityLabel="Attach image"
          accessibilityRole="button">
          <Icon
            name="image-outline"
            size={24}
            color={isDark ? '#6b7280' : '#9ca3af'}
          />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.textInput,
            {color: isDark ? '#f3f4f6' : '#111827'},
          ]}
          placeholder="Type a message..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={5000}
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={(!text.trim() && !imagePreview) || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message">
          {sending ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Icon
              name="send"
              size={24}
              color={
                text.trim() || imagePreview
                  ? '#3b82f6'
                  : isDark
                  ? '#4b5563'
                  : '#d1d5db'
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  listContent: {
    paddingVertical: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
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
