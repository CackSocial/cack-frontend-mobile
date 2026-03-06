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
import Surface from '../../components/common/Surface';
import {lookupUser} from '../../api/users';
import {useDebounce} from '../../hooks/useDebounce';
import {useColors, fonts, radii, spacing, typography, elevation} from '../../theme';
import {sharedStyles} from '../../styles/shared';
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
        const user = await lookupUser(debouncedQuery.trim());
        if (!cancelled) setResults([user]);
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
        style={[styles.userRow, elevation.card, {backgroundColor: c.bgElevated, borderColor: c.border}]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.84}>
        <Avatar uri={item.avatar_url} name={item.display_name} size={48} />
        <View style={styles.userInfo}>
          <Text style={[styles.displayName, {color: c.textPrimary}]}>{item.display_name}</Text>
          <Text style={[styles.username, {color: c.textTertiary}]}>@{item.username}</Text>
          {item.bio ? <Text style={[styles.bio, {color: c.textSecondary}]} numberOfLines={2}>{item.bio}</Text> : null}
        </View>
      </TouchableOpacity>
    ),
    [c, handleSelect],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}> 
      <Surface style={styles.searchCard}>
        <View style={[styles.searchBar, {backgroundColor: c.bgSecondary, borderColor: c.border}]}> 
          <Icon name="magnify" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, {color: c.textPrimary}]}
            placeholder="Search by exact username..."
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </Surface>

      {searching ? <ActivityIndicator style={sharedStyles.smallLoader} size="small" /> : null}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={sharedStyles.paddedListContent}
        ListEmptyComponent={
          !searching ? (
            <EmptyState
              icon="account-search-outline"
              title={debouncedQuery.trim() ? 'No users found' : 'Search for someone to message'}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  searchCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    minHeight: 46,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.base,
    fontFamily: fonts.body,
    paddingVertical: 0,
  },
  userRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: radii.xxl,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: typography.base,
    fontFamily: fonts.bodySemiBold,
  },
  username: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  bio: {
    marginTop: spacing[1],
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
});
