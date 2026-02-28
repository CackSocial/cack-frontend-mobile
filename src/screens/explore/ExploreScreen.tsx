import React, {useEffect, useState, useMemo} from 'react';
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
import EmptyState from '../../components/common/EmptyState';
import {getTrendingTags} from '../../api/tags';
import {useColors, fonts} from '../../theme';
import {formatCount} from '../../utils/format';
import type {Tag} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Explore'>;

export default function ExploreScreen({navigation}: Props) {
  const c = useColors();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await getTrendingTags();
      setTags(data ?? []);
    } catch {}
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return tags;
    const q = query.toLowerCase().replace(/^#/, '');
    return tags.filter(t => t.name.toLowerCase().includes(q));
  }, [tags, query]);

  if (loading) {
    return (
      <View style={[styles.center, {backgroundColor: c.bgPrimary}]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderTag = ({item}: {item: Tag}) => (
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
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, {backgroundColor: c.bgSecondary, borderColor: c.border}]}>
          <Icon name="magnify" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, {color: c.textPrimary}]}
            placeholder="Search tags…"
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search tags"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section title */}
      <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>
        Trending Tags
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.name}
        renderItem={renderTag}
        ListEmptyComponent={
          <EmptyState icon="tag-outline" title={query ? 'No matching tags' : 'No trending tags'} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
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
    borderBottomWidth: 1,
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
});
