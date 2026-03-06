import {useEffect, useRef} from 'react';
import {useMessagesStore} from '../stores/messagesStore';
import type {Message} from '../types';
import {findOptimisticMessageIndex} from '../utils/messages';

interface UseConversationLiveUpdatesOptions {
  username: string;
  currentUserId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useConversationLiveUpdates({
  username,
  currentUserId,
  messages,
  setMessages,
}: UseConversationLiveUpdatesOptions) {
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenMessageIdsRef.current = new Set(messages.map(message => message.id));
  }, [messages]);

  useEffect(() => {
    const unsubscribe = useMessagesStore.subscribe(state => {
      const conversationMessages = state.messages[username] ?? [];
      const unseenMessages = conversationMessages.filter(
        message => !seenMessageIdsRef.current.has(message.id),
      );
      if (!unseenMessages.length) return;

      unseenMessages.forEach(message => {
        seenMessageIdsRef.current.add(message.id);
      });

      setMessages(current => {
        let nextMessages = current;

        unseenMessages.forEach(message => {
          if (message.sender_id !== currentUserId) {
            if (!nextMessages.some(existing => existing.id === message.id)) {
              nextMessages = [...nextMessages, message];
            }
            return;
          }

          const optimisticIndex = findOptimisticMessageIndex(
            nextMessages,
            message,
          );

          if (optimisticIndex !== -1) {
            const updatedMessages = [...nextMessages];
            updatedMessages[optimisticIndex] = message;
            nextMessages = updatedMessages;
            return;
          }

          if (!nextMessages.some(existing => existing.id === message.id)) {
            nextMessages = [...nextMessages, message];
          }
        });

        return nextMessages;
      });
    });

    return unsubscribe;
  }, [currentUserId, setMessages, username]);
}
