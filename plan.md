# Mobile frontend production hardening plan

## Goal
- Raise `/home/X/Desktop/cack-frontend-mobile` to production-quality maintainability without changing product behavior, backend contracts, or web/mobile parity goals.
- Preserve all current functionality while removing refactor debt, reducing spaghetti code, tightening state flow, and making the codebase safer to evolve.

## Baseline audit summary
- **Current validation state**
  - `npx tsc --noEmit` is currently the only reliable automated safety net.
  - `npm run lint` is installed but unusable because the repo has no ESLint config.
  - `npm run test` is installed but currently finds no tests.
- **Largest / riskiest hotspots**
  - `src/components/post/PostComposer.tsx` (~540 LOC): editor UX, image upload, sizing, scrolling, custom scrollbar, submit logic, and theme behavior are tightly coupled.
  - `src/screens/profile/ProfileScreen.tsx` (~320 LOC): profile fetch/follow state, stats, actions, tabs, and post list composition all live together.
  - `src/screens/messages/ConversationScreen.tsx` (~310 LOC): WebSocket echo reconciliation, optimistic local message creation, pagination, media send, and UI rendering are mixed.
  - `src/components/post/PostCard.tsx` (~310 LOC): repost/quote/original post rendering, share behavior, media layout, and all action buttons are tightly coupled.
  - `src/stores/postsStore.ts` (~305 LOC): repeated optimistic mutation logic and cache merge logic make the post state layer fragile.
  - Secondary hotspots: `ExploreScreen`, `PostDetailScreen`, `NotificationsScreen`, `SettingsScreen`, `MainTabs`, `messagesStore`, `theme.ts`.
- **Concrete code smells found during review**
  - Duplicated pagination/fetch patterns across profile, explore, post-detail, and messaging hooks/screens.
  - Repeated optimistic like/bookmark/repost logic across hooks and the posts store.
  - Large view components mixing async effects, navigation, rendering, and mutation logic in one file.
  - Magic numbers for media sizes, spacing, editor heights, scrollbar geometry, icon sizes, and active-state opacity values.
  - Fragile UI/state patterns such as non-null assertions, silent catches, ad hoc route-entry fixes, and direct state reconciliation logic inside screens.
  - Inconsistent reuse of shared primitives; list cards and typography are still partially duplicated despite the recent design-system pass.

## Hardening principles
- **No functionality changes**: preserve current user flows, backend requests, WebSocket behavior, and mobile-native UX intent.
- **No backend/web changes**: keep all work scoped to `cack-frontend-mobile`.
- **Refactor by extraction, not by rewrite**: split and stabilize current logic instead of replacing working behavior wholesale.
- **Single source of truth**: reduce duplicated local/global state paths and centralize shared logic.
- **Predictable effects**: remove stale closure risks, duplicated fetch logic, and hidden race conditions.
- **Reusable primitives first**: push repeated styles/behaviors into shared helpers before touching many screens.

## Priority findings to address

### P0 — Safety / architecture debt
1. **Usable quality gates are missing**
   - Files: `package.json`, repo root lint setup, Jest config usage.
   - Problem: the repo cannot currently enforce linting or catch regressions automatically.
2. **Post composer/editor complexity is too high**
   - File: `src/components/post/PostComposer.tsx`.
   - Problem: one component owns editor sizing, image picking, long-text scrolling, custom scrollbar drag logic, and submit lifecycle.
3. **Post state and optimistic mutation logic are duplicated**
   - Files: `src/stores/postsStore.ts`, `src/hooks/useOptimisticLike.ts`, `useOptimisticBookmark.ts`, `useOptimisticRepost.ts`.
   - Problem: multiple overlapping mutation paths make rollback and cache consistency fragile.
4. **Messaging screen/state reconciliation is too ad hoc**
   - Files: `src/screens/messages/ConversationScreen.tsx`, `src/hooks/useConversation.ts`, `src/stores/messagesStore.ts`, `src/hooks/useWebSocket.ts`.
   - Problem: optimistic temporary messages, WebSocket echoes, pagination, and screen-local reconciliation are too tightly coupled.

### P1 — Maintainability / consistency debt
5. **Navigation contracts and entry semantics need normalization**
   - Files: `src/navigation/*`, `src/screens/profile/ProfileScreen.tsx`, other cross-tab navigation sites.
   - Problem: some flows require special nested-navigation handling, and route typing/entry semantics should be standardized.
6. **Oversized screens/components need decomposition**
   - Files: `PostComposer`, `PostCard`, `ProfileScreen`, `ConversationScreen`, `ExploreScreen`, `NotificationsScreen`, `SettingsScreen`, `PostDetailScreen`.
   - Problem: business logic, view composition, and interaction wiring are mixed.
7. **Pagination/data-loading logic is repeated across the app**
   - Files: `useConversation.ts`, `usePostDetail.ts`, `useUserPosts.ts`, `BookmarksScreen`, `FollowersScreen`, `FollowingScreen`, `TagPostsScreen`.
   - Problem: same page/loading/hasMore/reset pattern is reimplemented in multiple places.

### P2 — Professional polish / consistency debt
8. **Design tokens are still incomplete**
   - Files: `src/theme.ts`, `src/styles/shared.ts`, multiple components.
   - Problem: hardcoded image heights, icon sizes, active-state opacity, and special-case layout math still live in components.
9. **Error/loading/empty-state behavior is inconsistent**
   - Files: screens and hooks across auth, posts, messages, notifications, profile.
   - Problem: some flows alert + rethrow, some only log, some silently swallow, some have retry UI and others do not.
10. **Shared surface/list patterns are under-extracted**
   - Files: `PostCard`, `ConversationItem`, `UserListItem`, `CommentItem`, notifications and search row renderers.
   - Problem: card/list spacing and typography rules are still repeated.

## Proposed implementation workstreams

### 1. Restore quality gates using the tools already installed
- Add a proper ESLint config based on the packages already in the repo.
- Add a minimal Jest smoke-test layer for non-UI logic that is currently most fragile (stores, hooks utilities, route helpers, formatters).
- Define a clean baseline for `typecheck`, `lint`, and `test` so future refactors can be validated reliably.
- Keep this non-functional: tooling only, no product changes.

### 2. Stabilize navigation contracts and route semantics
- Normalize route param types across stacks and remove inconsistent or overly permissive definitions.
- Centralize nested cross-tab navigation patterns (for example, stack-preserving entries that rely on `initial: false`) into shared helpers or conventions.
- Audit `navigate` vs `push` usage and ensure header/back behavior is intentional and consistent.
- Review `MainTabs`, stack option helpers, and root navigation theming for clarity and simplification.

### 3. Complete the shared design-system layer
- Expand `theme.ts` with missing semantic tokens for icon sizes, media dimensions, active/pressed opacity, and editor sizing.
- Expand `sharedStyles` and/or common primitives to cover repeated list-card spacing, screen wrappers, typography variants, and inline action affordances.
- Remove color-value comparisons and magic numbers from feature components.
- Make shared UI state behavior (pressed, disabled, loading, selected) consistent across primitives.

### 4. Decompose the biggest screens/components into focused units
- Split `PostComposer` into editor shell, media picker/preview, scroll/size logic, and action/footer subparts or hooks.
- Split `PostCard` into header, content/media, quote/repost blocks, and action row pieces.
- Split `ProfileScreen` into profile summary, action row, tab switcher, and post feed sections.
- Split `ConversationScreen`, `ExploreScreen`, `NotificationsScreen`, `SettingsScreen`, and `PostDetailScreen` similarly.
- Target: smaller files, clearer responsibilities, easier review/testing, no behavior change.

### 5. Consolidate post/feed state management
- Replace repeated optimistic mutation code with a shared mutation helper/factory that covers apply, persist, and rollback consistently.
- Normalize how original posts/reposts/quotes are resolved so screens do not keep reimplementing the same target-selection logic.
- Simplify `postsStore` cache merge behavior and define explicit cache lifecycle/invalidation expectations.
- Separate pure post-state transforms from UI-triggered side effects where possible.

### 6. Normalize pagination and async fetching patterns
- Extract a shared pagination/fetch helper for the common `page / hasMore / loading / reset / append` pattern.
- Remove effect dependency inconsistencies and stale-closure risk in hooks/screens that fetch on mount or on focus.
- Add request concurrency guards where rapid scrolling or repeated focus can currently trigger overlapping work.
- Reuse the shared pagination abstraction in explore/profile/messages/post-detail flows.

### 7. Harden messaging and WebSocket flow
- Move conversation-specific reconciliation logic out of `ConversationScreen` into a dedicated hook/service layer.
- Define a clearer contract for optimistic message creation, echo replacement, unread handling, and scroll-to-latest behavior.
- Review `messagesStore` shape and the `useWebSocket` lifecycle so connections/subscriptions are easier to reason about.
- Keep current UX intact while making the implementation less fragile.

### 8. Standardize error, retry, loading, and empty-state handling
- Define repo-wide patterns for when to log, when to alert, when to surface inline retry UI, and when to rollback silently.
- Remove silent catches and untracked failures where they hide real issues.
- Align loading/empty/error experiences across feeds, profile lists, notifications, explore, and messages.
- Preserve current user-visible intent while making code paths more explicit and testable.

### 9. Finish with regression hardening
- Run typecheck/lint/test after each workstream once quality gates exist.
- Add a manual verification checklist for auth, timeline, create/quote/repost/like/bookmark/comment flows, profile editing/following, explore search/tag posts, notifications, conversations, theme switching, and message sending.
- Prefer staged rollout by subsystem instead of one giant refactor branch.

## Recommended execution order
1. Restore quality gates.
2. Stabilize navigation contracts and shared design tokens/primitives.
3. Decompose the largest UI surfaces.
4. Consolidate post state + normalize pagination/fetching.
5. Harden messaging/WebSocket flow.
6. Standardize error/loading handling.
7. Run full regression hardening pass.

---

## Appendix A — Concrete bug inventory (line-level)

Every item below is a real issue found during deep code review. None require functionality changes to fix — they are all implementation correctness or safety improvements.

### BUG-1: Stale-closure pagination in `useConversation` (HIGH)
- **File**: `src/hooks/useConversation.ts:13-34`
- **Problem**: The `fetch` callback closes over `loading`, `page`, and `hasMore` state values. Because `fetch` is recreated on every state change, the loading guard (`if (loading) return`) uses a potentially stale closure value. Rapid `loadMore` calls can fire concurrent requests.
- **Correct pattern**: `src/hooks/useUserPosts.ts` already uses `loadingRef`, `pageRef`, `hasMoreRef` to avoid this exact problem.
- **Fix**: Migrate `useConversation` to the ref-based pattern from `useUserPosts`.

### BUG-2: Same stale-closure pagination in `BookmarksScreen` (HIGH)
- **File**: `src/screens/profile/BookmarksScreen.tsx:40-57`
- **Problem**: `fetchBookmarks` closes over `loading`, `page`, `hasMore`. Identical to BUG-1.
- **Fix**: Extract to a shared `usePaginatedFetch` hook or adopt the `useUserPosts` ref pattern.

### BUG-3: Same stale-closure pagination in `TagPostsScreen` (HIGH)
- **File**: `src/screens/explore/TagPostsScreen.tsx:42-61`
- **Problem**: Identical closure-based fetch with same racing risk.

### BUG-4: Same stale-closure pagination in `FollowersScreen` / `FollowingScreen` (MEDIUM)
- **Files**: `src/screens/profile/FollowersScreen.tsx:26-45`, corresponding `FollowingScreen`
- **Problem**: Identical closure-based fetch.

### BUG-5: Same stale-closure pagination in `usePostDetail.fetchComments` (MEDIUM)
- **File**: `src/hooks/usePostDetail.ts:26-42`
- **Problem**: `fetchComments` closes over `commentsPage` and `commentsHasMore`. On rapid scroll or re-focus, overlapping comment fetches can fire.

### BUG-6: Missing effect dependencies — empty `[]` arrays (MEDIUM)
Multiple screens use `useEffect(() => { fetch(); }, [])` with fetch functions that change identity. React's exhaustive-deps rule would flag every one of these:
- `src/screens/post/PostDetailScreen.tsx:106-109` — missing `fetchPost`, `fetchComments`
- `src/screens/messages/ConversationScreen.tsx:47-49` — missing `refresh`
- `src/screens/home/HomeScreen.tsx:32-34` — missing `fetchTimeline`
- `src/screens/profile/BookmarksScreen.tsx:60-62` — missing `fetchBookmarks`
- `src/screens/explore/TagPostsScreen.tsx:63-65` — missing `fetch`
- `src/screens/profile/FollowersScreen.tsx:47-49` — missing `fetch`
- **Note**: These are currently "working" because the stale closures happen to capture the initial function identity, but they are technically incorrect and would break if the hooks switched to a different identity pattern.
- **Fix**: Once pagination is ref-based, the fetch callbacks will have stable identities and can be safely listed in deps.

### BUG-7: `NotificationsScreen` subscribes to entire store (PERF)
- **File**: `src/screens/notifications/NotificationsScreen.tsx:55-63`
- **Problem**: `const { notifications, isLoading, ... } = useNotificationsStore()` destructures from the store root without selectors. This subscribes to ALL state changes (including unrelated `unreadCount` mutations), causing unnecessary re-renders.
- **Fix**: Use individual selectors: `useNotificationsStore(s => s.notifications)`, etc.

### BUG-8: `HomeScreen` subscribes to entire postsStore (PERF)
- **File**: `src/screens/home/HomeScreen.tsx:26`
- **Problem**: `const {timeline, isLoading, ...} = usePostsStore()` subscribes to every state field including `postCache`. Every optimistic like/bookmark/repost on any screen triggers a `postCache` update which re-renders the entire home timeline.
- **Fix**: Use individual selectors.

### BUG-9: Hardcoded notification icon colors ignore dark theme (UI)
- **File**: `src/screens/notifications/NotificationsScreen.tsx:25-32`
- **Problem**: `NOTIFICATION_ICONS` maps types to hardcoded hex colors like `'#525252'` and `'#262626'`. These are light-theme values. In dark mode, `#262626` (comment, quote icon color) is nearly invisible against a dark background.
- **Fix**: Move to a hook/function that returns theme-aware colors, or reference `c.*` tokens.

### BUG-10: Theme detection via string comparison in `PostComposer` (FRAGILE)
- **File**: `src/components/post/PostComposer.tsx:76`
- **Code**: `const scrollIndicatorStyle = c.textPrimary === '#fafafa' ? 'white' : 'black';`
- **Problem**: Compares a hex color literal to determine the current theme. If theme colors are ever adjusted, this silently breaks.
- **Fix**: Import `useThemeStore` and check `theme === 'dark'` directly, or add a semantic token.

### BUG-11: Circular `require()` calls between stores (ARCH)
- **Files**: `src/stores/messagesStore.ts:52-53`, `src/stores/authStore.ts:79`
- **Problem**: Both stores use `require()` (CommonJS dynamic import) to access sibling stores, bypassing TypeScript module resolution and creating opaque circular dependency edges.
- **Fix**: Refactor to direct ES imports where possible, or introduce a lightweight event bus / middleware pattern for cross-store communication.

### BUG-12: `messagesStore.connectWS` reconnect timing race (LOW)
- **File**: `src/stores/messagesStore.ts:60-72`
- **Problem**: `onclose` sets `ws: null` then schedules a reconnect that checks `!current.ws`. If the user manually calls `disconnectWS` during the delay window, the reconnect fires anyway because `reconnectTimer` was set before `disconnectWS` clears it. Also, there is no max-reconnect-attempt cap.
- **Fix**: Add a `shouldReconnect` flag that `disconnectWS` can clear, and consider a max retry count.

### BUG-13: WS subscription may miss rapid messages in `ConversationScreen` (LOW)
- **File**: `src/screens/messages/ConversationScreen.tsx:56-83`
- **Problem**: The zustand subscription checks `convMsgs?.[convMsgs.length - 1]` (the last element only). If two messages arrive in a single store update batch, only the last one is detected.
- **Fix**: Compare full message ID sets or track the last-seen index rather than only checking the final element.

### BUG-14: Optimistic message ID collision risk (LOW)
- **File**: `src/screens/messages/ConversationScreen.tsx:105`
- **Code**: `id: \`tmp-${Date.now()}\``
- **Problem**: `Date.now()` has millisecond resolution. A fast double-tap race could produce duplicate IDs.
- **Fix**: Use a counter or append a random suffix: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.

### BUG-15: `PostDetailScreen.navigateToProfile` defeats memoization (PERF)
- **File**: `src/screens/post/PostDetailScreen.tsx:127-129`
- **Problem**: `navigateToProfile` is a plain function (not `useCallback`) that is referenced inside the memoized `renderHeader`. Because it's recreated every render, `renderHeader`'s `useCallback` deps change every render, negating the memo.
- **Fix**: Wrap with `useCallback`.

### BUG-16: `ProfileScreen` "Likes" tab is a client-side filter, not an API call (LOGIC)
- **File**: `src/screens/profile/ProfileScreen.tsx:92`
- **Code**: `const likedPosts = useMemo(() => posts.filter(p => p.is_liked), [posts]);`
- **Problem**: This only shows posts the user authored that happen to also be liked — not all posts the user has liked. It also changes as pagination loads more of the user's own posts. This is likely different from user expectations.
- **Note**: Fixing this properly might require a backend "liked posts" endpoint (out of scope). For now, document the limitation or label the tab more accurately.

### BUG-17: Non-null assertions on `asset.uri!` (SAFETY)
- **Files**: `PostComposer.tsx:196`, `ConversationScreen.tsx:132`, `EditProfileScreen.tsx:48`
- **Problem**: `asset.uri` from `react-native-image-picker` is typed as `string | undefined`. The `!` assertion suppresses the null check but could crash if the picker returns an asset without a URI.
- **Fix**: Add a null guard: `if (!asset.uri) return;` before using it.

### BUG-18: `RootNavigator` unnecessary eslint-disable (HYGIENE)
- **File**: `src/navigation/RootNavigator.tsx:46-47`
- **Code**: `// eslint-disable-next-line react-hooks/exhaustive-deps`
- **Problem**: The `hydrate` function from zustand's `create` is stable (it doesn't change identity). The eslint-disable is unnecessary and masks future dependency issues.
- **Fix**: Remove the disable comment and add `hydrate` to the dependency array.

---

## Appendix B — Spaghetti code inventory

### SPAG-1: Copy-paste pagination boilerplate (6+ files)
The exact `page/hasMore/loading/setLoading/setPage/setHasMore/fetch(reset)` pattern is reimplemented in:
- `useConversation.ts` (closure-based, buggy)
- `usePostDetail.ts` (closure-based, buggy)
- `BookmarksScreen.tsx` (closure-based, buggy)
- `TagPostsScreen.tsx` (closure-based, buggy)
- `FollowersScreen.tsx` (closure-based, buggy)
- `FollowingScreen.tsx` (closure-based, buggy)
- `notificationsStore.ts` (zustand variant)
- `useUserPosts.ts` (ref-based, correct — use as model)
**Fix**: Extract a `usePaginatedFetch<T>(fetchFn, options)` hook. Use `useUserPosts` as the reference implementation.

### SPAG-2: Triple-duplicated optimistic toggle hooks
- `src/hooks/useOptimisticLike.ts` (70 LOC)
- `src/hooks/useOptimisticBookmark.ts` (69 LOC)
- `src/hooks/useOptimisticRepost.ts` (70 LOC)
These are ~95% identical. Differences: which boolean field to toggle, which count field (if any), which API functions to call.
**Fix**: Create a single `createOptimisticToggle(config)` factory or a generic `useOptimisticToggle` hook parameterized by field name and API pair.

### SPAG-3: Duplicate optimistic logic in `postsStore` vs hooks
The store's `toggleLike/toggleBookmark/toggleRepost` methods (lines 103–233 of `postsStore.ts`) duplicate the same apply/rollback pattern that lives in the `useOptimistic*` hooks. `HomeScreen` uses the store methods; every other screen uses the hooks.
**Fix**: Unify into one path. Either the store exposes the only toggle API, or the hooks are the only toggle API with the store just handling cache.

### SPAG-4: `PostCard` callback explosion (11 callbacks per usage)
Every screen rendering posts must wire: `onPress`, `onAuthorPress`, `onLike`, `onComment`, `onBookmark`, `onRepost`, `onQuote`, `onTagPress`, `onMentionPress`, `onOriginalPostPress`, plus conditionally `onShare`.
This leads to massive copy-pasted `renderPost` callbacks in `HomeScreen`, `ProfileScreen`, `BookmarksScreen`, `TagPostsScreen`, `PostDetailScreen`.
**Fix**: Create a `usePostCardActions(navigation, toggleLike, toggleBookmark, toggleRepost)` hook that returns a single `getPostCardProps(post)` function, or push navigation logic into `PostCard` itself via a context/provider.

### SPAG-5: `actionTarget` resolution duplicated in 5+ places
```tsx
const actionTarget = item.post_type === 'repost' && item.original_post ? item.original_post : item;
```
This exact expression appears in `HomeScreen`, `ProfileScreen`, `BookmarksScreen`, `TagPostsScreen`, `PostDetailScreen`.
**Fix**: Extract as `resolveActionTarget(post: Post): Post` in a utility file.

### SPAG-6: Image-picker launch + size-check duplicated 3 times
The same `launchImageLibrary → check fileSize → set state` pattern appears in:
- `PostComposer.tsx:184-201`
- `ConversationScreen.tsx:123-138`
- `EditProfileScreen.tsx:39-54`
**Fix**: Extract a `useImagePicker(onPicked: (asset: ImageAsset) => void)` hook.

### SPAG-7: `postsStore` CachedPostState verbose reconstruction
Each of `toggleLike`, `toggleBookmark`, `toggleRepost` manually rebuilds the full 6-field `CachedPostState` object by reading every field from cache and post. This is ~30 lines of pure boilerplate per toggle.
**Fix**: Extract a `getCachedState(id)` helper and a `patchCachedState(id, patch)` method.

### SPAG-8: `postsStore` timeline map + original_post map duplicated 6 times
The pattern:
```tsx
timeline.map(p => {
  if (p.id === id) return {...p, ...updates};
  if (p.original_post?.id === id) return {...p, original_post: {...p.original_post, ...updates}};
  return p;
})
```
appears in `toggleLike`, `toggleBookmark`, `toggleRepost` (both optimistic and rollback), `cachePost`, and `applyPostCache`. That's at least 8 occurrences in one file.
**Fix**: Extract an `updatePostInTimeline(timeline, id, updates)` utility.

---

## Appendix C — Professional quality issues

### QUAL-1: Magic numbers catalog
| Value | Location(s) | Meaning |
|-------|------------|---------|
| `220` | `PostComposer.tsx:481` | Preview image height |
| `104, 84, 44, 40, 36, 28, 20` | Multiple components | Avatar sizes (not centralized) |
| `0.84` | `ExploreScreen`, `NotificationsScreen` | `activeOpacity` on touchables |
| `0.88` | `PostCard.tsx:101` | Pressed opacity on content |
| `0.75` | `PostCard.tsx:37` | Pressed opacity on action buttons |
| `138, 170` | `PostComposer.tsx:62` | Height offsets for compact/normal mode |
| `88` | `ConversationScreen.tsx:151` | `keyboardVerticalOffset` |
| `100` | `ConversationScreen.tsx:119` | `setTimeout` delay for scroll-to-end |
| `5000` | `ConversationScreen.tsx:219` | Message max length |
| `2000` | `PostDetailScreen.tsx:68` | Reply max length |
| `42, 38, 34, 32, 22, 18` | Various | Circular button/icon container sizes |
| `{padding: 4}` | `MessagesScreen.tsx:28`, `ProfileStack.tsx:34` | Inline header button padding |
| `11, 0.5, 2` | Various `StyleSheet` defs | Assorted unlabeled constants |
**Fix**: Move to named constants in `theme.ts` (e.g., `sizes.avatar.*`, `sizes.iconButton.*`, `opacity.pressed`, `opacity.active`, `timing.scrollDelay`).

### QUAL-2: Inconsistent error handling patterns
| Screen/Hook | On Error |
|-------------|----------|
| `PostComposer.handleSubmit` | `logError()` only — user sees nothing |
| `HomeScreen.handleCreatePost` | `Alert.alert()` + `throw` (re-throws to PostComposer which also catches) |
| `CreatePostScreen.handleSubmit` | `Alert.alert()` + `throw` |
| `ConversationScreen.handleSend` (image) | `Alert.alert()` only |
| `ConversationScreen.handleSend` (WS) | No error handling at all |
| `FollowersScreen.handleFollowToggle` | `logError()` only |
| `ProfileScreen.handleFollowToggle` | `Alert.alert()` only |
| `PostDetailScreen.ReplyBar.handleSend` | `catch {}` — completely silenced |
| `BookmarksScreen.fetchBookmarks` | `logError()` only |
**Fix**: Define a consistent error policy: user-facing mutations should `Alert.alert`, background fetches should log + optional inline retry, optimistic mutations should rollback silently.

### QUAL-3: `MainTabs` tabPress reset is an unnecessary switch/case
- **File**: `src/navigation/MainTabs.tsx:113-131`
- **Problem**: 5-branch switch statement that maps tab names to their root screens. This is already defined in the `TAB_ROOT` constant on line 21.
- **Fix**: Replace with `navigation.navigate(route.name, {screen: TAB_ROOT[route.name]})`.

### QUAL-4: Inline styles in navigation header configs
- **Files**: `MessagesScreen.tsx:28`, `ProfileStack.tsx:34`
- **Problem**: `style={{padding: 4}}` creates a new object every render, defeating React's shallow comparison for header re-render optimization.
- **Fix**: Extract to a `StyleSheet` constant.

### QUAL-5: `ProfileStackParamList.Profile` has an inconsistent type
- **File**: `src/navigation/types.ts:43-44`
- **Code**: `Profile: {username?: string} | undefined;`
- **Problem**: This is the only route that accepts both `undefined` and an object with an optional field, making the param contract ambiguous. All other stacks define `Profile: {username: string}` (required).
- **Fix**: Use `{username?: string}` only (remove the `| undefined` union) or split into two route names.

---

## Non-goals
- No backend API changes.
- No web frontend changes.
- No product-scope expansion or feature redesign.
- No intentional UX/functionality changes beyond bug fixes uncovered during refactor hardening.

## Initial implementation backlog
1. Restore lint/test/typecheck quality gates with existing installed tooling.
2. Normalize navigation types and cross-tab navigation helpers.
3. Expand shared theme/style primitives to remove hardcoded UI values.
4. Decompose oversized UI files into smaller components/hooks.
5. Consolidate optimistic post mutations and cache handling.
6. Extract shared pagination/fetch abstractions.
7. Harden messaging/WebSocket state flow and conversation reconciliation.
8. Standardize error/loading/empty-state behavior.
9. Run full regression validation and cleanup pass.
