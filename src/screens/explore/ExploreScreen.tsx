import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import Surface from '../../components/common/Surface';
import PostCard from '../../components/post/PostCard';
import SuggestedUserCard from '../../components/explore/SuggestedUserCard';
import {getTrendingTags} from '../../api/tags';
import {lookupUser} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useExploreStore} from '../../stores/exploreStore';
import {useAuthStore} from '../../stores/authStore';
import {usePostCardActions} from '../../hooks/usePostCardActions';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {useOptimisticBookmark} from '../../hooks/useOptimisticBookmark';
import {useOptimisticRepost} from '../../hooks/useOptimisticRepost';
import {useColors, fonts, radii, spacing, typography, elevation, opacity} from '../../theme';
import {useDebounce} from '../../hooks/useDebounce';
import {getErrorMessage, logError} from '../../utils/log';
import {formatCount} from '../../utils/format';
import {sharedStyles} from '../../styles/shared';
import type {Post, Tag, UserProfile} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Explore'>;

type FeedTab = 'popular' | 'discover' | 'tags';

const FEED_TABS: {key: FeedTab; label: string}[] = [
  {key: 'popular', label: 'Popular'},
  {key: 'discover', label: 'Discover'},
  {key: 'tags', label: 'Tags'},
];

export default function ExploreScreen({navigation}: Props) {
  const c = useColors();
  const updateUser = useAuthStore(s => s.updateUser);
  const [activeTab, setActiveTab] = useState<FeedTab>('popular');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const isSearching = query.trim().length > 0;

  const debouncedQuery = useDebounce(query, 350);

  // Explore store
  const suggestedUsers = useExploreStore(s => s.suggestedUsers);
  const isLoadingSuggestions = useExploreStore(s => s.isLoadingSuggestions);
  const fetchSuggestedUsers = useExploreStore(s => s.fetchSuggestedUsers);

  const popularPosts = useExploreStore(s => s.popularPosts);
  const isLoadingPopular = useExploreStore(s => s.isLoadingPopular);
  const isLoadingMorePopular = useExploreStore(s => s.isLoadingMorePopular);
  const popularHasMore = useExploreStore(s => s.popularHasMore);
  const fetchPopularPosts = useExploreStore(s => s.fetchPopularPosts);

  const discoverPosts = useExploreStore(s => s.discoverPosts);
  const isLoadingDiscover = useExploreStore(s => s.isLoadingDiscover);
  const isLoadingMoreDiscover = useExploreStore(s => s.isLoadingMoreDiscover);
  const discoverHasMore = useExploreStore(s => s.discoverHasMore);
  const fetchDiscoverFeed = useExploreStore(s => s.fetchDiscoverFeed);

  // Post setters from explore store
  const setPopularPosts = useExploreStore(s => s.setPopularPosts);
  const setDiscoverPosts = useExploreStore(s => s.setDiscoverPosts);

  // Combined setter that updates both lists so a post appearing in both stays in sync
  const setAllExplorePosts = useCallback(
    (updater: React.SetStateAction<Post[]>) => {
      setPopularPosts(updater);
      setDiscoverPosts(updater);
    },
    [setPopularPosts, setDiscoverPosts],
  );

  // Optimistic post interactions (reads actual post state, not defaults)
  const handleToggleLike = useOptimisticLike(setAllExplorePosts);
  const handleToggleBookmark = useOptimisticBookmark(setAllExplorePosts);
  const handleToggleRepost = useOptimisticRepost(setAllExplorePosts);

  // Sync like state from global cache when screen gains focus
  useSyncLikes(setPopularPosts);
  useSyncLikes(setDiscoverPosts);

  // Load initial data on focus
  useFocusEffect(
    useCallback(() => {
      fetchSuggestedUsers();
      if (activeTab === 'popular' && popularPosts.length === 0) {
        fetchPopularPosts(true);
      } else if (activeTab === 'discover' && discoverPosts.length === 0) {
        fetchDiscoverFeed(true);
      } else if (activeTab === 'tags') {
        loadTags();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Switch tab → load data if needed
  useEffect(() => {
    if (activeTab === 'popular' && popularPosts.length === 0) {
      fetchPopularPosts(true);
    } else if (activeTab === 'discover' && discoverPosts.length === 0) {
      fetchDiscoverFeed(true);
    } else if (activeTab === 'tags' && tags.length === 0) {
      loadTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const data = await getTrendingTags();
      setTags(data ?? []);
    } catch (e: unknown) {
      setTagsError(getErrorMessage(e));
    }
    setTagsLoading(false);
  }, []);

  // User search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
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
  }, [debouncedQuery]);

  const filteredTags = useMemo(() => {
    if (!query.trim()) return tags;
    const q = query.toLowerCase().replace(/^#/, '');
    return tags.filter(t => t.name.toLowerCase().includes(q));
  }, [tags, query]);

  // Follow/unfollow suggested users
  const handleFollow = useCallback(async (username: string) => {
    try {
      await followUser(username);
      setFollowingSet(prev => new Set(prev).add(username));
      const latestUser = useAuthStore.getState().user;
      if (latestUser) {
        updateUser({following_count: latestUser.following_count + 1});
      }
    } catch (error: unknown) {
      logError('followSuggestedUser', error);
    }
  }, [updateUser]);

  const handleUnfollow = useCallback(async (username: string) => {
    try {
      await unfollowUser(username);
      setFollowingSet(prev => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
      const latestUser = useAuthStore.getState().user;
      if (latestUser) {
        updateUser({following_count: latestUser.following_count - 1});
      }
    } catch (error: unknown) {
      logError('unfollowSuggestedUser', error);
    }
  }, [updateUser]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchSuggestedUsers();
    if (activeTab === 'popular') fetchPopularPosts(true);
    else if (activeTab === 'discover') fetchDiscoverFeed(true);
    else loadTags();
  }, [activeTab, fetchSuggestedUsers, fetchPopularPosts, fetchDiscoverFeed, loadTags]);

  // Infinite scroll
  const handleEndReached = useCallback(() => {
    if (activeTab === 'popular' && popularHasMore && !isLoadingPopular && !isLoadingMorePopular) {
      fetchPopularPosts(false);
    } else if (activeTab === 'discover' && discoverHasMore && !isLoadingDiscover && !isLoadingMoreDiscover) {
      fetchDiscoverFeed(false);
    }
  }, [activeTab, popularHasMore, isLoadingPopular, isLoadingMorePopular, discoverHasMore, isLoadingDiscover, isLoadingMoreDiscover, fetchPopularPosts, fetchDiscoverFeed]);

  const handleTagPress = useCallback(
    (tag: string) => navigation.navigate('TagPosts', {tagName: tag}),
    [navigation],
  );

  const getPostCardActions = usePostCardActions({
    navigation,
    onLike: post => handleToggleLike(post),
    onBookmark: post => handleToggleBookmark(post),
    onRepost: post => handleToggleRepost(post),
    onTagPress: handleTagPress,
  });

  // Suggested users section
  const renderSuggestedUsers = useCallback(() => {
    if (isSearching) return null;
    if (isLoadingSuggestions && suggestedUsers.length === 0) {
      return (
        <View style={styles.suggestedSection}>
          <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>Suggested for you</Text>
          <ActivityIndicator style={sharedStyles.smallLoader} size="small" />
        </View>
      );
    }
    if (suggestedUsers.length === 0) return null;

    return (
      <View style={styles.suggestedSection}>
        <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>Suggested for you</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedScroll}>
          {suggestedUsers.map(user => (
            <SuggestedUserCard
              key={user.id}
              user={user}
              isFollowing={followingSet.has(user.username)}
              onPress={() => navigation.navigate('Profile', {username: user.username})}
              onFollow={() => handleFollow(user.username)}
              onUnfollow={() => handleUnfollow(user.username)}
            />
          ))}
        </ScrollView>
      </View>
    );
  }, [isSearching, isLoadingSuggestions, suggestedUsers, followingSet, c, navigation, handleFollow, handleUnfollow]);

  // Feed tabs
  const renderTabs = useCallback(() => {
    if (isSearching) return null;
    return (
      <View style={styles.feedTabs}>
        {FEED_TABS.map(tab => {
          const selected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.feedTab,
                {
                  backgroundColor: selected ? c.accent : c.bgSecondary,
                  borderColor: selected ? c.accent : c.border,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{selected}}>
              <Text style={[styles.feedTabText, {color: selected ? c.accentText : c.textPrimary}]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [isSearching, activeTab, c]);

  const renderPost = useCallback(
    ({item}: {item: Post}) => <PostCard post={item} {...getPostCardActions(item)} />,
    [getPostCardActions],
  );

  const renderTag = useCallback(
    ({item}: {item: Tag}) => (
      <TouchableOpacity
        style={[styles.rowCard, elevation.card, {backgroundColor: c.bgElevated, borderColor: c.border}]}
        onPress={() => navigation.navigate('TagPosts', {tagName: item.name})}
        activeOpacity={opacity.active}
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
        activeOpacity={opacity.active}
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

  // Determine which posts to show
  const feedPosts = activeTab === 'popular' ? popularPosts : discoverPosts;
  const feedLoading = activeTab === 'popular' ? isLoadingPopular : isLoadingDiscover;
  const feedLoadingMore = activeTab === 'popular' ? isLoadingMorePopular : isLoadingMoreDiscover;
  const isRefreshing = feedLoading && feedPosts.length > 0;

  const renderSearchBar = useCallback(() => (
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
          accessibilityLabel="Search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close-circle" size={18} color={c.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </Surface>
  ), [c, query]);

  // Feed header: search + suggestions + tabs
  const listHeader = useMemo(
    () => (
      <>
        {renderSearchBar()}
        {renderSuggestedUsers()}
        {renderTabs()}
      </>
    ),
    [renderSearchBar, renderSuggestedUsers, renderTabs],
  );

  // Search results view
  if (isSearching) {
    return (
      <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
        {renderSearchBar()}
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
      </View>
    );
  }

  // Tags tab
  if (activeTab === 'tags') {
    return (
      <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
        <FlatList
          data={filteredTags}
          keyExtractor={item => item.name}
          renderItem={renderTag}
          ListHeaderComponent={listHeader}
          contentContainerStyle={sharedStyles.paddedListContent}
          refreshControl={
            <RefreshControl refreshing={tagsLoading && tags.length > 0} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            tagsLoading ? (
              <ActivityIndicator style={sharedStyles.centerLoader} size="large" />
            ) : (
              <EmptyState icon="tag-outline" title="No trending tags" />
            )
          }
        />
        {tagsError ? <ErrorBanner message={tagsError} onRetry={loadTags} /> : null}
      </View>
    );
  }

  // Popular / Discover tab
  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={feedPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={listHeader}
        contentContainerStyle={sharedStyles.paddedListContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          feedLoading ? (
            <ActivityIndicator style={sharedStyles.centerLoader} size="large" />
          ) : (
            <EmptyState
              icon={activeTab === 'popular' ? 'fire' : 'compass-outline'}
              title={activeTab === 'popular' ? 'No popular posts yet' : 'No posts to discover'}
            />
          )
        }
        ListFooterComponent={
          feedLoadingMore ? (
            <ActivityIndicator style={sharedStyles.listLoader} size="small" />
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
  suggestedSection: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontFamily: fonts.bodySemiBold,
    marginHorizontal: spacing[4],
  },
  suggestedScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  feedTabs: {
    flexDirection: 'row',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  feedTab: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  feedTabText: {
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
