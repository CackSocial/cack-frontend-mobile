import {useEffect, useRef, useCallback} from 'react';
import {useMessagesStore} from '../stores/messagesStore';
import {useAuthStore} from '../stores/authStore';

export function useWebSocket() {
  const token = useAuthStore(s => s.token);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const connectWS = useMessagesStore(s => s.connectWS);
  const disconnectWS = useMessagesStore(s => s.disconnectWS);
  const connected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && !connected.current) {
      connectWS(token);
      connected.current = true;
    }

    return () => {
      if (connected.current) {
        disconnectWS();
        connected.current = false;
      }
    };
  }, [isAuthenticated, token, connectWS, disconnectWS]);

  const reconnect = useCallback(() => {
    if (token) {
      disconnectWS();
      connectWS(token);
    }
  }, [token, connectWS, disconnectWS]);

  return {reconnect};
}
