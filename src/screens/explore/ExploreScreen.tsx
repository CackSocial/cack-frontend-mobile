import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import Surface from '../../components/common/Surface';
import {getTrendingTags} from '../../api/tags';
import {lookupUser} from '../../api/users';
import {useColors, fonts, radii, spacing, typography, elevation} from '../../theme';
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

  useFocusEffect(
    useCallback(() => {
      loadTags();
    }, [loadTags]),
  );

  useEffect(() => {
    if (searchMode !== 'users' || !debouncedQuery.trim()) {
      setUserResults([]);
      return;
    }
    let cancelled = false;
    const doSearch = async () => {
      setUserSearching(true);
      try {
        const user = await lookupUser(debouncedQuery.trim());
        if (!cancelled) setUserResults([user]);
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
        style={[styles.rowCard, elevation.card, {backgroundColor: c.bgElevated, borderColor: c.border}]}
        onPress={() => navigation.navigate('TagPosts', {tagName: item.name})}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={`Tag ${item.name}, ${item.post_count} posts`}>
        <View style={[styles.hashBg, {backgroundColor: c.bgSecondary}]}> 
          <Icon name="pound" size={18} color={c.textTertiary} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowTitle, {color: c.textPrimary}]}>#{item.name}</Text>
          <Text style={[styles.rowSubtitle, {color: c.textSecondary}]}> 
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
        style={[styles.rowCard, elevation.card, {backgroundColor: c.bgElevated, borderColor: c.border}]}
        onPress={() => navigation.navigate('Profile', {username: item.username})}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={`${item.display_name} @${item.username}`}>
        <Avatar uri={item.avatar_url} name={item.display_name} size={44} />
        <View style={styles.rowInfo}>
          <Text style={[styles.rowTitle, {color: c.textPrimary}]}>{item.display_name}</Text>
          <Text style={[styles.rowSubtitle, {color: c.textSecondary}]}>@{item.username}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={c.textMuted} />
      </TouchableOpacity>
    ),
    [c, navigation],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}> 
      <Surface style={styles.searchCard}>
        <View style={[styles.searchBar, {backgroundColor: c.bgSecondary, borderColor: c.border}]}> 
          <Icon name="magnify" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, {color: c.textPrimary}]}
            placeholder={searchMode === 'tags' ? 'Search tags...' : 'Search by exact username...'}
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.modeTabs}>
          {(['tags', 'users'] as SearchMode[]).map(mode => {
            const selected = searchMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeTab,
                  {
                    backgroundColor: selected ? c.accent : c.bgSecondary,
                    borderColor: selected ? c.accent : c.border,
                  },
                ]}
                onPress={() => setSearchMode(mode)}
                accessibilityRole="tab"
                accessibilityState={{selected}}>
                <Text style={[styles.modeTabText, {color: selected ? c.accentText : c.textPrimary}]}> 
                  {mode === 'tags' ? 'Tags' : 'People'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Surface>

      {error && searchMode === 'tags' ? <ErrorBanner message={error} onRetry={loadTags} /> : null}

      {searchMode === 'tags' ? (
        loading ? (
          <ActivityIndicator style={sharedStyles.centerLoader} size="large" />
        ) : (
          <FlatList
            data={filteredTags}
            keyExtractor={item => item.name}
            renderItem={renderTag}
            contentContainerStyle={sharedStyles.paddedListContent}
            ListEmptyComponent={<EmptyState icon="tag-outline" title={query ? 'No matching tags' : 'No trending tags'} />}
          />
        )
      ) : (
        <>
          {userSearching ? <ActivityIndicator style={sharedStyles.smallLoader} size="small" /> : null}
          <FlatList
            data={userResults}
            keyExtractor={item => item.id}
            renderItem={renderUser}
            contentContainerStyle={sharedStyles.paddedListContent}
            ListEmptyComponent={
              !userSearching ? (
                <EmptyState
                  icon="account-search-outline"
                  title={debouncedQuery.trim() ? 'No users found' : 'Search for people'}
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
  searchCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    gap: spacing[3],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.base,
    fontFamily: fonts.body,
    paddingVertical: 0,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  modeTab: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  modeTabText: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyMedium,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: radii.xxl,
  },
  hashBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: typography.base,
    fontFamily: fonts.bodySemiBold,
  },
  rowSubtitle: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
});
