import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {ImageAsset} from '../../types';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Surface from '../common/Surface';
import {useAuthStore} from '../../stores/authStore';
import {useThemeStore} from '../../stores/themeStore';
import {MAX_POST_LENGTH} from '../../config';
import {useColors, fonts, radii, sizes, spacing, typography} from '../../theme';
import {logError} from '../../utils/log';
import {useImagePicker} from '../../hooks/useImagePicker';

interface Props {
  onSubmit: (content: string, image?: ImageAsset) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
}

export default function PostComposer({
  onSubmit,
  loading,
  placeholder,
  submitLabel = 'Post',
  compact = false,
}: Props) {
  const c = useColors();
  const theme = useThemeStore(s => s.theme);
  const {height: windowHeight} = useWindowDimensions();
  const inputScrollRef = useRef<ScrollView>(null);
  const scrollbarDragStartRef = useRef({thumbOffset: 0, scrollOffset: 0});
  const maxScrollOffsetRef = useRef(0);
  const scrollbarThumbOffsetRef = useRef(0);
  const scrollbarThumbTravelRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const pendingSelectionEndRef = useRef<number | null>(null);
  const selectionRef = useRef({start: 0, end: 0});
  const user = useAuthStore(s => s.user);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const minInputHeight = useMemo(
    () =>
      compact
        ? sizes.composer.compactMinInputHeight
        : sizes.composer.defaultMinInputHeight,
    [compact],
  );
  const verticalInputPadding = useMemo(
    () => (compact ? spacing[3] * 2 : spacing[4] * 2),
    [compact],
  );
  const maxInputHeight = useMemo(() => {
    const maxComposerHeight = Math.floor(windowHeight * 0.5);
    return Math.max(
      minInputHeight,
      maxComposerHeight
        - (compact
          ? sizes.composer.compactHeightOffset
          : sizes.composer.defaultHeightOffset),
    );
  }, [compact, minInputHeight, windowHeight]);
  const [inputContentHeight, setInputContentHeight] = useState<number>(minInputHeight);

  const tags = useMemo(() => {
    const matches = content.match(/#(\w+)/g) || [];
    return Array.from(new Set(matches)).slice(0, 5);
  }, [content]);
  const charCount = content.length;
  const isOverLimit = charCount > MAX_POST_LENGTH;
  const isNearLimit = charCount > MAX_POST_LENGTH * 0.9;
  const canSubmit = (content.trim().length > 0 || image) && !isOverLimit;
  const inputViewportHeight = Math.min(inputContentHeight, maxInputHeight);
  const isInputScrollable = inputContentHeight > maxInputHeight;
  const scrollIndicatorStyle = theme === 'dark' ? 'white' : 'black';
  const scrollbarTrackHeight = Math.max(inputViewportHeight - spacing[4], 0);
  const scrollbarThumbHeight = useMemo(() => {
    if (!isInputScrollable || scrollbarTrackHeight <= 0) {
      return 0;
    }

    return Math.max(
      sizes.composer.minScrollbarThumbHeight,
      (scrollbarTrackHeight * inputViewportHeight) / inputContentHeight,
    );
  }, [
    inputContentHeight,
    inputViewportHeight,
    isInputScrollable,
    scrollbarTrackHeight,
  ]);
  const scrollbarThumbOffset = useMemo(() => {
    if (
      !isInputScrollable ||
      inputContentHeight <= inputViewportHeight ||
      scrollbarTrackHeight <= scrollbarThumbHeight
    ) {
      return 0;
    }

    const maxScrollOffset = Math.max(inputContentHeight - inputViewportHeight, 1);
    const thumbTravel = scrollbarTrackHeight - scrollbarThumbHeight;
    return (
      (Math.min(scrollOffset, maxScrollOffset) / maxScrollOffset) * thumbTravel
    );
  }, [
    inputContentHeight,
    inputViewportHeight,
    isInputScrollable,
    scrollOffset,
    scrollbarThumbHeight,
    scrollbarTrackHeight,
  ]);
  const maxScrollOffset = useMemo(
    () => Math.max(inputContentHeight - inputViewportHeight, 0),
    [inputContentHeight, inputViewportHeight],
  );
  const scrollbarThumbTravel = useMemo(
    () => Math.max(scrollbarTrackHeight - scrollbarThumbHeight, 0),
    [scrollbarThumbHeight, scrollbarTrackHeight],
  );
  const scrollbarPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isInputScrollable,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          isInputScrollable && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          scrollbarDragStartRef.current = {
            thumbOffset: scrollbarThumbOffsetRef.current,
            scrollOffset: scrollOffsetRef.current,
          };
        },
        onPanResponderMove: (_, gestureState) => {
          if (
            !isInputScrollable ||
            scrollbarThumbTravelRef.current <= 0 ||
            maxScrollOffsetRef.current <= 0
          ) {
            return;
          }

          const nextThumbOffset = Math.min(
            Math.max(
              scrollbarDragStartRef.current.thumbOffset + gestureState.dy,
              0,
            ),
            scrollbarThumbTravelRef.current,
          );
          const nextScrollOffset =
            (nextThumbOffset / scrollbarThumbTravelRef.current) *
            maxScrollOffsetRef.current;

          setScrollOffset(nextScrollOffset);
          inputScrollRef.current?.scrollTo({y: nextScrollOffset, animated: false});
        },
      }),
    [
      isInputScrollable,
    ],
  );

  useEffect(() => {
    setInputContentHeight(prev => Math.max(prev, minInputHeight));
  }, [minInputHeight]);

  useEffect(() => {
    scrollbarThumbOffsetRef.current = scrollbarThumbOffset;
  }, [scrollbarThumbOffset]);

  useEffect(() => {
    maxScrollOffsetRef.current = maxScrollOffset;
  }, [maxScrollOffset]);

  useEffect(() => {
    scrollOffsetRef.current = scrollOffset;
  }, [scrollOffset]);

  useEffect(() => {
    scrollbarThumbTravelRef.current = scrollbarThumbTravel;
  }, [scrollbarThumbTravel]);

  const pickImage = useImagePicker({
    context: 'PostComposer:pickImage',
    onPicked: setImage,
  });

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    try {
      await onSubmit(content.trim(), image || undefined);
      setContent('');
      setImage(null);
      setInputContentHeight(minInputHeight);
      setScrollOffset(0);
      inputScrollRef.current?.scrollTo({y: 0, animated: false});
    } catch (e: unknown) {
      logError('PostComposer:handleSubmit', e);
    }
  };

  const handleContentSizeChange = useCallback(
    (event: {nativeEvent: {contentSize: {height: number}}}) => {
      const nextContentHeight = Math.max(
        minInputHeight,
        Math.ceil(event.nativeEvent.contentSize.height) + verticalInputPadding,
      );
      setInputContentHeight(nextContentHeight);

      if (
        nextContentHeight > maxInputHeight &&
        selectionRef.current.end >= content.length
      ) {
        setScrollOffset(Math.max(nextContentHeight - maxInputHeight, 0));
        requestAnimationFrame(() => {
          inputScrollRef.current?.scrollToEnd({animated: false});
        });
      } else if (nextContentHeight <= maxInputHeight) {
        setScrollOffset(0);
      }
    },
    [content.length, maxInputHeight, minInputHeight, verticalInputPadding],
  );

  return (
    <Surface
      elevated
      style={[styles.card, compact ? styles.compactCard : null]}
      padding={compact ? spacing[3] : spacing[4]}>
      <View style={[styles.header, compact ? styles.compactHeader : null]}>
        <Avatar
          uri={user?.avatar_url}
          name={user?.display_name}
          size={compact ? sizes.avatar.lg : sizes.avatar.xl}
        />
      </View>

      <View
        style={[
          styles.inputViewportShell,
          {
            backgroundColor: c.bgSecondary,
            borderColor: c.border,
            height: inputViewportHeight,
          },
        ]}>
        <ScrollView
          ref={inputScrollRef}
          style={styles.inputViewport}
          contentContainerStyle={styles.inputViewportContent}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isInputScrollable}
          showsVerticalScrollIndicator={isInputScrollable}
          persistentScrollbar={isInputScrollable}
          indicatorStyle={scrollIndicatorStyle}
          scrollEventThrottle={16}
          onScroll={event => {
            setScrollOffset(event.nativeEvent.contentOffset.y);
          }}>
          <TextInput
            style={[
              styles.input,
              compact ? styles.compactInput : null,
              {
                color: c.textPrimary,
                height: inputContentHeight,
              },
            ]}
            placeholder={placeholder || "What's happening?"}
            placeholderTextColor={c.textMuted}
            multiline
            scrollEnabled={false}
            maxLength={MAX_POST_LENGTH + 100}
            value={content}
            onChangeText={nextContent => {
              const wasCursorAtEnd =
                selectionRef.current.end >= content.length;
              setContent(nextContent);
              if (wasCursorAtEnd) {
                pendingSelectionEndRef.current = nextContent.length;
                selectionRef.current = {
                  start: nextContent.length,
                  end: nextContent.length,
                };
              } else {
                pendingSelectionEndRef.current = null;
              }
            }}
            onContentSizeChange={handleContentSizeChange}
            onSelectionChange={event => {
              const nextSelection = event.nativeEvent.selection;

              if (
                pendingSelectionEndRef.current !== null &&
                nextSelection.end < pendingSelectionEndRef.current
              ) {
                return;
              }

              selectionRef.current = nextSelection;
              if (
                pendingSelectionEndRef.current !== null &&
                nextSelection.end >= pendingSelectionEndRef.current
              ) {
                pendingSelectionEndRef.current = null;
              }
            }}
            accessibilityLabel="Post content"
          />
        </ScrollView>

        {isInputScrollable ? (
          <View
            style={styles.scrollbarOverlay}
            accessibilityRole="adjustable"
            accessibilityLabel="Composer scrollbar"
            {...scrollbarPanResponder.panHandlers}>
            <View
              style={[
                styles.scrollbarTrack,
                {backgroundColor: c.borderSubtle},
              ]}
            />
            <View
              style={[
                styles.scrollbarThumb,
                {
                  backgroundColor: c.textMuted,
                  height: scrollbarThumbHeight,
                  transform: [{translateY: scrollbarThumbOffset}],
                },
              ]}
            />
          </View>
        ) : null}
      </View>

      {image ? (
        <View style={styles.imagePreview}>
          <Image source={{uri: image.uri}} style={styles.previewImage} />
          <TouchableOpacity
            style={[styles.removeImage, {backgroundColor: c.bgElevated}]}
            onPress={() => setImage(null)}
            accessibilityLabel="Remove image">
            <Icon name="close" size={18} color={c.textPrimary} />
          </TouchableOpacity>
        </View>
      ) : null}

      {tags.length > 0 ? (
        <View style={styles.tagRow}>
          {tags.map(tag => (
            <View key={tag} style={[styles.tagChip, {backgroundColor: c.bgSecondary, borderColor: c.border}]}>
              <Text style={[styles.tagText, {color: c.textPrimary}]}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={pickImage}
          style={[
            styles.attachButton,
            compact ? styles.compactAttachButton : null,
            {backgroundColor: c.bgSecondary, borderColor: c.border},
          ]}
          accessibilityRole="button"
          accessibilityLabel="Attach image">
          <Icon name="image-outline" size={18} color={c.textPrimary} />
          <Text style={[styles.attachText, {color: c.textPrimary}]}>Add image</Text>
        </TouchableOpacity>

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.charCount,
              {
                color: isOverLimit ? c.danger : isNearLimit ? c.textPrimary : c.textTertiary,
              },
            ]}>
            {charCount}/{MAX_POST_LENGTH}
          </Text>
          <Button
            title={submitLabel}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={loading}
            size="sm"
          />
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
  },
  compactCard: {
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  compactHeader: {
    gap: spacing[2],
  },
  input: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    paddingRight: spacing[5],
    fontSize: typography.base,
    fontFamily: fonts.body,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  inputViewportShell: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  inputViewport: {
    flex: 1,
  },
  inputViewportContent: {
    flexGrow: 1,
  },
  scrollbarOverlay: {
    position: 'absolute',
    top: spacing[2],
    right: 0,
    bottom: spacing[2],
    width: sizes.composer.scrollbarOverlayWidth,
  },
  scrollbarTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: sizes.composer.scrollbarTrackInset,
    width: sizes.composer.scrollbarTrackWidth,
    borderRadius: radii.pill,
  },
  scrollbarThumb: {
    position: 'absolute',
    right: sizes.composer.scrollbarTrackInset,
    width: sizes.composer.scrollbarTrackWidth,
    borderRadius: radii.pill,
  },
  compactInput: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    lineHeight: 22,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: sizes.composer.previewHeight,
    borderRadius: radii.xl,
  },
  removeImage: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: sizes.iconButton.sm,
    height: sizes.iconButton.sm,
    borderRadius: sizes.iconButton.sm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  tagText: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyMedium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  compactAttachButton: {
    paddingHorizontal: spacing[2],
  },
  attachText: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyMedium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginLeft: 'auto',
  },
  charCount: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
});
