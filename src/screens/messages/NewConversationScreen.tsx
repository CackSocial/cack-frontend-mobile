import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import {searchUsers} from '../../api/users';
import {useDebounce} from '../../hooks/useDebounce';
import {useColors, fonts} from '../../theme';
import type {UserProfile} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MessagesStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'NewConversation'>;

export default function NewConversationScreen({navigation}: Props) {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const doSearch = async () => {
      setSearching(true);
      try {
        const res = await searchUsers(debouncedQuery.trim());
        if (!cancelled) setResults(res.data ?? []);
      } catch {
        if (!cancelled) setResults([]);
      }
      if (!cancelled) setSearching(false);
    };
    doSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (user: UserProfile) => {
      navigation.replace('Conversation', {
        username: user.username,
        userId: user.id,
        displayName: user.display_name,
      });
    },
    [navigation],
  );

  const renderUser = useCallback(
    ({item}: {item: UserProfile}) => (
      <TouchableOpacity
        style={[styles.userRow, {borderBottomColor: c.border}]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}>
        <Avatar uri={item.avatar_url} name={item.display_name} size={44} />
        <View style={styles.userInfo}>
          <Text style={[styles.displayName, {color: c.textPrimary}]}>
            {item.display_name}
          </Text>
          <Text style={[styles.username, {color: c.textTertiary}]}>
            @{item.username}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [c, handleSelect],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchBar,
            {backgroundColor: c.bgSecondary, borderColor: c.border},
          ]}>
          <Icon name="magnify" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, {color: c.textPrimary}]}
            placeholder="Search people…"
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searching && (
        <ActivityIndicator style={{paddingVertical: 16}} size="small" />
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          !searching ? (
            <EmptyState
              icon="account-search-outline"
              title={
                debouncedQuery.trim()
                  ? 'No users found'
                  : 'Search for someone to message'
              }
              subtitle={
                !debouncedQuery.trim()
                  ? 'Type a name or username above'
                  : undefined
              }
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.body,
    paddingVertical: 0,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
  username: {
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 1,
  },
});
