import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import TrendingTagCard from '../../components/tags/TrendingTagCard';
import EmptyState from '../../components/common/EmptyState';
import {getTrendingTags} from '../../api/tags';
import {useColors} from '../../theme';
import type {Tag} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Explore'>;

export default function ExploreScreen({navigation}: Props) {
  const c = useColors();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={[styles.center, {backgroundColor: c.bgPrimary}]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={tags}
        keyExtractor={item => item.name}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({item}) => (
          <TrendingTagCard
            tag={item}
            onPress={() => navigation.navigate('TagPosts', {tagName: item.name})}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="tag-outline" title="No trending tags" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  grid: {
    padding: 8,
  },
});
