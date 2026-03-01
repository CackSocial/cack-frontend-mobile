import React, {useEffect, useState, useMemo, useCallback} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import {getTrendingTags} from '../../api/tags';
import {searchUsers} from '../../api/users';
import {useColors, fonts} from '../../theme';
import {useDebounce} from '../../hooks/useDebounce';
import {getErrorMessage} from '../../utils/log';
import {formatCount} from '../../utils/format';
import {sharedStyles} from '../../styles/shared';
import type {Tag, UserProfile} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Explore'>;

type SearchMode = 'tags' | 'users';

export default function ExploreScreen({navigation}: Props) {
  const c = useColors();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>('tags');
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [userSearching, setUserSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrendingTags();
      setTags(data ?? []);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
    setLoading(false);
  }, []);

  // Refresh trending tags every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadTags();
    }, [loadTags]),
  );

  // Search users when debounced query changes and mode is 'users'
  useEffect(() => {
    if (searchMode !== 'users' || !debouncedQuery.trim()) {
      setUserResults([]);
      return;
    }
    let cancelled = false;
    const doSearch = async () => {
      setUserSearching(true);
      try {
        const res = await searchUsers(debouncedQuery.trim());
        if (!cancelled) setUserResults(res.data ?? []);
      } catch {
        if (!cancelled) setUserResults([]);
      }
      if (!cancelled) setUserSearching(false);
    };
    doSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchMode]);

  const filteredTags = useMemo(() => {
    if (!query.trim()) return tags;
    const q = query.toLowerCase().replace(/^#/, '');
    return tags.filter(t => t.name.toLowerCase().includes(q));
  }, [tags, query]);

  const renderTag = useCallback(
    ({item}: {item: Tag}) => (
      <TouchableOpacity
        style={[styles.tagRow, {borderBottomColor: c.border}]}
        onPress={() => navigation.navigate('TagPosts', {tagName: item.name})}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Tag ${item.name}, ${item.post_count} posts`}>
        <View style={[styles.hashBg, {backgroundColor: c.bgSecondary}]}>
          <Icon name="pound" size={18} color={c.textTertiary} />
        </View>
        <View style={styles.tagInfo}>
          <Text style={[styles.tagName, {color: c.textPrimary}]}>
            {item.name}
          </Text>
          <Text style={[styles.tagCount, {color: c.textTertiary}]}>
            {formatCount(item.post_count)} posts
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={c.textMuted} />
      </TouchableOpacity>
    ),
    [c, navigation],
  );

  const renderUser = useCallback(
    ({item}: {item: UserProfile}) => (
      <TouchableOpacity
        style={[styles.tagRow, {borderBottomColor: c.border}]}
        onPress={() => navigation.navigate('Profile', {username: item.username})}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.display_name} @${item.username}`}>
        <Avatar uri={item.avatar_url} name={item.display_name} size={40} />
        <View style={styles.tagInfo}>
          <Text style={[styles.tagName, {color: c.textPrimary}]}>
            {item.display_name}
          </Text>
          <Text style={[styles.tagCount, {color: c.textTertiary}]}>
            @{item.username}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={c.textMuted} />
      </TouchableOpacity>
    ),
    [c, navigation],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, {backgroundColor: c.bgSecondary, borderColor: c.border}]}>
          <Icon name="magnify" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, {color: c.textPrimary}]}
            placeholder={searchMode === 'tags' ? 'Search tags…' : 'Search people…'}
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search mode tabs */}
      <View style={[styles.modeTabs, {borderBottomColor: c.border}]}>
        <TouchableOpacity
          style={styles.modeTab}
          onPress={() => setSearchMode('tags')}
          accessibilityRole="tab"
          accessibilityState={{selected: searchMode === 'tags'}}>
          <Text
            style={[
              styles.modeTabText,
              {color: searchMode === 'tags' ? c.textPrimary : c.textMuted},
            ]}>
            Tags
          </Text>
          {searchMode === 'tags' && (
            <View style={[styles.modeIndicator, {backgroundColor: c.accent}]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeTab}
          onPress={() => setSearchMode('users')}
          accessibilityRole="tab"
          accessibilityState={{selected: searchMode === 'users'}}>
          <Text
            style={[
              styles.modeTabText,
              {color: searchMode === 'users' ? c.textPrimary : c.textMuted},
            ]}>
            People
          </Text>
          {searchMode === 'users' && (
            <View style={[styles.modeIndicator, {backgroundColor: c.accent}]} />
          )}
        </TouchableOpacity>
      </View>

      {error && searchMode === 'tags' && <ErrorBanner message={error} onRetry={loadTags} />}

      {searchMode === 'tags' ? (
        <>
          <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>
            {query.trim() ? 'Search Results' : 'Trending Tags'}
          </Text>
          {loading ? (
            <ActivityIndicator style={sharedStyles.centerLoader} size="large" />
          ) : (
            <FlatList
              data={filteredTags}
              keyExtractor={item => item.name}
              renderItem={renderTag}
              ListEmptyComponent={
                <EmptyState icon="tag-outline" title={query ? 'No matching tags' : 'No trending tags'} />
              }
            />
          )}
        </>
      ) : (
        <>
          {userSearching && (
            <ActivityIndicator style={sharedStyles.smallLoader} size="small" />
          )}
          <FlatList
            data={userResults}
            keyExtractor={item => item.id}
            renderItem={renderUser}
            ListEmptyComponent={
              !userSearching ? (
                <EmptyState
                  icon="account-search-outline"
                  title={debouncedQuery.trim() ? 'No users found' : 'Search for people'}
                  subtitle={!debouncedQuery.trim() ? 'Type a name or username above' : undefined}
                />
              ) : null
            }
          />
        </>
      )}
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
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.body,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.display,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  hashBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
  tagCount: {
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 1,
  },
  modeTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  modeTabText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  modeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 40,
    borderRadius: 3,
  },
});
