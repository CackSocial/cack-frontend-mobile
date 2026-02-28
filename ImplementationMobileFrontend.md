# SocialConnect — Mobile Frontend Implementation Plan
## React Native (Android + iOS)

---

## 1. Overview

Build a **React Native** mobile application (Android + iOS) for the SocialConnect platform. The app is a pure frontend client — it connects exclusively to the existing Go backend via its REST API and WebSocket endpoint. No backend logic lives in the mobile repo.

**Backend base URL:** `http://<host>:8080/api/v1`
**WebSocket:** `ws://<host>:8080/api/v1/ws?token=<jwt>`
**Static uploads:** `http://<host>:8080/uploads/<filename>`

The web frontend (`cack-web`) is the reference for feature parity. All screens mirror the web app's functionality, adapted for native mobile interaction patterns.

---

## 2. Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native (TypeScript) |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| State management | Zustand v5 |
| Token/user storage | `@react-native-async-storage/async-storage` |
| HTTP client | `axios` |
| Image picking | `react-native-image-picker` |
| Date formatting | `date-fns` |
| Icons | `react-native-vector-icons` (MaterialCommunityIcons) |
| Real-time | Native WebSocket API (built-in to React Native) |
| List virtualization | `FlatList` / `FlashList` (`@shopify/flash-list`) |
| Skeleton loading | `react-native-skeleton-placeholder` |
| Build tooling | React Native CLI (bare workflow, not Expo) |

---

## 3. Repository Structure

```
cack-mobile/
├── android/                      # Android native project
├── ios/                          # iOS native project
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance, interceptors, base URL
│   │   ├── auth.ts               # register, login
│   │   ├── users.ts              # getUser, updateMe, getFollowers, getFollowing
│   │   ├── posts.ts              # createPost, getPost, deletePost, getUserPosts
│   │   ├── timeline.ts           # getTimeline
│   │   ├── likes.ts              # likePost, unlikePost, getPostLikers
│   │   ├── follows.ts            # followUser, unfollowUser
│   │   ├── comments.ts           # createComment, getComments, deleteComment
│   │   ├── tags.ts               # getTrendingTags, getTagPosts
│   │   ├── messages.ts           # getConversations, getMessages, sendMessage
│   │   └── index.ts              # re-exports
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # Auth gate: AuthStack vs MainTabs
│   │   ├── AuthStack.tsx         # Login, Register
│   │   ├── MainTabs.tsx          # Bottom tab navigator (Home/Explore/Messages/Profile)
│   │   ├── HomeStack.tsx         # Home → PostDetail, Profile
│   │   ├── ExploreStack.tsx      # Explore → TagPosts, Profile
│   │   ├── MessagesStack.tsx     # Messages → Conversation
│   │   ├── ProfileStack.tsx      # Profile → EditProfile, Followers, Following
│   │   └── types.ts              # RootStackParamList, TabParamList, etc.
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx    # Timeline feed + post composer FAB
│   │   ├── explore/
│   │   │   ├── ExploreScreen.tsx # Trending tags grid
│   │   │   └── TagPostsScreen.tsx # Posts for a specific tag
│   │   ├── post/
│   │   │   ├── PostDetailScreen.tsx   # Single post + comments
│   │   │   └── CreatePostScreen.tsx   # Post composer modal/screen
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx      # User profile + posts
│   │   │   ├── EditProfileScreen.tsx  # Edit display_name + bio
│   │   │   ├── FollowersScreen.tsx    # Followers list
│   │   │   └── FollowingScreen.tsx    # Following list
│   │   └── messages/
│   │       ├── MessagesScreen.tsx     # Conversations list
│   │       └── ConversationScreen.tsx # Chat view (WebSocket)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBanner.tsx
│   │   ├── post/
│   │   │   ├── PostCard.tsx           # Full post card (feed)
│   │   │   ├── PostComposer.tsx       # Text + image input
│   │   │   └── CommentItem.tsx        # Single comment row
│   │   ├── user/
│   │   │   └── UserListItem.tsx       # Avatar + name + follow button row
│   │   ├── messages/
│   │   │   ├── ConversationItem.tsx   # Conversation list row
│   │   │   └── MessageBubble.tsx      # Chat bubble
│   │   └── tags/
│   │       └── TrendingTagCard.tsx    # Tag name + post count tile
│   ├── stores/
│   │   ├── authStore.ts              # user, token, isAuthenticated
│   │   ├── postsStore.ts             # timeline cache, optimistic likes
│   │   ├── messagesStore.ts          # conversations, messages per user, WS
│   │   └── themeStore.ts             # light / dark preference
│   ├── hooks/
│   │   ├── useTimeline.ts            # paginated timeline fetch
│   │   ├── useUserPosts.ts           # paginated user posts fetch
│   │   ├── usePostDetail.ts          # single post + comments
│   │   ├── useConversation.ts        # messages for one conversation
│   │   ├── useWebSocket.ts           # WS connect/send/reconnect logic
│   │   └── useDebounce.ts
│   ├── types/
│   │   └── index.ts                  # UserProfile, Post, Comment, Message, Conversation, Tag
│   ├── utils/
│   │   ├── format.ts                 # formatRelativeTime, formatCount
│   │   ├── renderTaggedContent.tsx   # hashtag highlighting in text
│   │   └── storage.ts                # AsyncStorage helpers (token, user)
│   └── config.ts                     # BASE_URL, WS_URL (env-driven)
├── app.json
├── package.json
├── tsconfig.json
└── .env.example                      # API_BASE_URL=http://localhost:8080/api/v1
```

---

## 4. Navigation Architecture

```
RootNavigator
├── AuthStack (when unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainTabs (when authenticated)
    ├── HomeTab
    │   └── HomeStack
    │       ├── HomeScreen           (timeline + FAB → CreatePostScreen)
    │       ├── PostDetailScreen     (post:id)
    │       └── ProfileScreen        (profile:username)
    ├── ExploreTab
    │   └── ExploreStack
    │       ├── ExploreScreen        (trending tags)
    │       ├── TagPostsScreen       (tag:name)
    │       └── ProfileScreen
    ├── MessagesTab                  (badge with unread count)
    │   └── MessagesStack
    │       ├── MessagesScreen       (conversation list)
    │       └── ConversationScreen   (chat:username)
    └── ProfileTab
        └── ProfileStack
            ├── ProfileScreen        (own profile)
            ├── EditProfileScreen
            ├── FollowersScreen
            └── FollowingScreen
```

---

## 5. API Client

### `src/api/client.ts`

- Single Axios instance with `baseURL` from `config.ts`
- Request interceptor: reads JWT from `authStore` → injects `Authorization: Bearer <token>` header
- Response interceptor:
  - On `401`: clear auth state → redirect to Login
  - Unwrap the `{ success, data }` envelope, throw on `success: false` with the `message` field

### Multipart Upload Helper

Posts and messages that include images use `multipart/form-data`. A shared `buildFormData(fields, imageFile?)` utility constructs the form data object compatible with both Android and iOS.

---

## 6. Types (`src/types/index.ts`)

Matches the backend's API shapes exactly:

```typescript
interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

interface Post {
  id: string;
  content: string;
  image_url: string;
  author: UserProfile;
  tags: string[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  author: UserProfile;
  created_at: string;
}

interface Tag {
  name: string;
  post_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string;
  read_at: string | null;
  created_at: string;
}

interface ConversationListItem {
  user: UserProfile;
  last_message: Message;
  unread_count: number;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
```

---

## 7. Screens — Feature Breakdown

### 7.1 Auth Screens

**LoginScreen**
- Username + password fields
- `POST /auth/login` → store token + user in `authStore` + `AsyncStorage`
- Error display on `401`
- Link to RegisterScreen

**RegisterScreen**
- Username + display_name (optional) + password fields
- `POST /auth/register` → same storage
- Error display on `409` (username taken) and `400`

---

### 7.2 HomeScreen (Timeline)

- `GET /timeline` (🔒) — paginated, infinite scroll via `FlatList` with `onEndReached`
- Each item renders `PostCard`
- Pull-to-refresh (`refreshControl`)
- Floating Action Button (FAB) → navigates to `CreatePostScreen`
- Empty state: "Follow some people to see their posts"

---

### 7.3 CreatePostScreen

- `TextInput` (multiline, max 5000 chars, character counter)
- Image picker button → `react-native-image-picker` → preview thumbnail
- Remove image button
- Submit → `POST /posts` as `multipart/form-data` (`content` + optional `image` file)
- On success: prepend post to timeline cache, dismiss screen
- Hashtag detection preview (show `tags` extracted client-side from content)

---

### 7.4 PostDetailScreen

- `GET /posts/:id` (optional auth)
- Full `PostCard` at top (non-scrollable header)
- `GET /posts/:id/comments` paginated below
- Comment input bar pinned to keyboard
- `POST /posts/:id/comments` to submit
- Delete own comment via swipe or long-press → `DELETE /comments/:id`
- Like/unlike from card header — `POST/DELETE /posts/:id/like`
- Delete own post — `DELETE /posts/:id`

---

### 7.5 ProfileScreen

- `GET /users/:username` (optional auth) — profile header
- `GET /users/:username/posts` — paginated post list
- Follow / Unfollow button (only when viewing another user)
  - `POST /users/:username/follow` / `DELETE /users/:username/follow`
- Follower count → navigates to `FollowersScreen`
- Following count → navigates to `FollowingScreen`
- "Edit Profile" button when viewing own profile → `EditProfileScreen`
- Message button when viewing another user → `ConversationScreen`

---

### 7.6 EditProfileScreen

- Pre-filled display_name + bio fields
- `PUT /users/me` (🔒) on save
- Update `authStore.user` on success

---

### 7.7 FollowersScreen / FollowingScreen

- `GET /users/:username/followers` or `/following` — paginated
- Each row: `UserListItem` with avatar, display_name, username, follow/unfollow button

---

### 7.8 ExploreScreen

- `GET /tags/trending` — top 10 tags
- Grid of `TrendingTagCard` tiles (name + post count)
- Tap → `TagPostsScreen`

---

### 7.9 TagPostsScreen

- `GET /tags/:name/posts` — paginated post feed filtered by tag
- Standard `PostCard` list with infinite scroll

---

### 7.10 MessagesScreen

- `GET /messages/conversations` (🔒) — paginated conversation list
- Each row: `ConversationItem` (avatar, username, last message snippet, unread badge)
- Pull-to-refresh
- Tap row → `ConversationScreen`
- Total unread count shown as badge on Messages tab icon

---

### 7.11 ConversationScreen

- `GET /messages/:username` (🔒) — load message history (paginated, load-more-up)
- WebSocket connection established on mount, torn down on unmount
- `MessageBubble` for each message (own messages right-aligned, other's left-aligned)
- Image messages: tappable thumbnail
- Send bar at bottom: `TextInput` + image attach button + send button
- Text-only: send via WebSocket `{ type: "message", receiver_id, content }`
- Image messages: upload via `POST /messages/:username` (multipart) → then display
- Reconnection with exponential backoff on WS disconnect
- `read_at` state reflected in message bubble (read receipt)

---

### 7.12 SettingsScreen (within ProfileStack)

- Theme toggle (light / dark) — persisted to `AsyncStorage`
- Logout button → clears `authStore`, `AsyncStorage`, navigates to Login

---

## 8. State Stores

### `authStore.ts`
```typescript
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login(username: string, password: string): Promise<void>;
  register(username: string, password: string, displayName?: string): Promise<void>;
  logout(): void;
  updateUser(updates: Partial<UserProfile>): void;
  hydrate(): Promise<void>;  // load token + user from AsyncStorage on app start
}
```

### `postsStore.ts`
```typescript
interface PostsState {
  timeline: Post[];
  timelinePage: number;
  timelineHasMore: boolean;
  isLoading: boolean;
  fetchTimeline(reset?: boolean): Promise<void>;
  prependPost(post: Post): void;
  removePost(id: string): void;
  toggleLike(id: string): void;       // optimistic update
  updatePost(id: string, updates: Partial<Post>): void;
}
```

### `messagesStore.ts`
```typescript
interface MessagesState {
  conversations: ConversationListItem[];
  messages: Record<string, Message[]>;  // keyed by username
  ws: WebSocket | null;
  connectWS(token: string): void;
  disconnectWS(): void;
  sendMessage(receiverId: string, content: string, imageUrl?: string): void;
  receiveMessage(msg: Message): void;
  fetchConversations(): Promise<void>;
  fetchMessages(username: string, page?: number): Promise<void>;
  getUnreadTotal(): number;
}
```

### `themeStore.ts`
```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme(): void;
}
```

---

## 9. WebSocket (`src/hooks/useWebSocket.ts`)

```typescript
// Connection lifecycle
// 1. Connect: ws://<host>/api/v1/ws?token=<jwt>
// 2. On message: parse JSON frame, dispatch to messagesStore.receiveMessage()
// 3. On close / error: reconnect with exponential backoff (1s, 2s, 4s, max 30s)
// 4. Replaced automatically on new login (same JWT behavior as server spec)
// 5. Teardown: close on logout
```

---

## 10. Pagination Strategy

All list screens use a consistent hook pattern:

```typescript
// Generic usage pattern for infinite-scroll lists
const [page, setPage] = useState(1);
const [items, setItems] = useState([]);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

// onEndReached: if hasMore && !loading → fetch page+1, append items
// refreshControl: reset to page 1, replace items
```

---

## 11. Image Uploads

Both `POST /posts` and `POST /messages/:username` accept `multipart/form-data`.

```typescript
// Shared utility
function buildFormData(fields: Record<string, string>, image?: ImageAsset): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  if (image) {
    form.append('image', {
      uri: image.uri,
      name: image.fileName ?? 'upload.jpg',
      type: image.type ?? 'image/jpeg',
    } as unknown as Blob);
  }
  return form;
}
```

Max file size: 10 MB (enforce client-side before upload).

---

## 12. Token Handling

- Token stored via `AsyncStorage.setItem('sc-token', token)`
- User profile stored via `AsyncStorage.setItem('sc-user', JSON.stringify(user))`
- On app launch: `authStore.hydrate()` reads both from storage
- Token lifetime: 72 hours (from backend config); no client-side refresh needed
- On any `401` response: auto-logout + redirect to Login

---

## 13. Error Handling Strategy

| Scenario | Behavior |
|---|---|
| Network error | Show `ErrorBanner` with retry button |
| 401 response | Auto-logout, navigate to Login |
| 400 / 409 (auth) | Show inline form error below field |
| 400 (already liked/following) | Silently ignore (optimistic update will revert) |
| 404 (post/user not found) | Show "Not found" empty state on screen |
| 500 | Show generic error toast |
| WS disconnect | Auto-reconnect with backoff, show "Reconnecting…" banner |

---

## 14. Implementation Phases

### Phase 1 — Project Scaffold & Auth
- Initialize React Native CLI project (`npx react-native init CackMobile --template react-native-template-typescript`)
- Install all dependencies
- Configure `config.ts` with `BASE_URL` / `WS_URL`
- Implement `src/api/client.ts` (Axios instance + interceptors)
- Implement `authStore.ts` with `AsyncStorage` hydration
- Build `LoginScreen` and `RegisterScreen`
- Wire `RootNavigator` with auth gate
- Test: login → token stored → redirect to MainTabs, logout → back to Login

### Phase 2 — Core Feed
- Implement `GET /timeline`, `POST /posts`, `GET /users/:username/posts`
- Build `HomeScreen` with paginated `FlatList`, pull-to-refresh, FAB
- Build `PostCard` component (author, content, image, tags, like count, comment count)
- Build `CreatePostScreen` with image picker
- Implement optimistic like toggle in `postsStore`
- Build `PostDetailScreen` with comments

### Phase 3 — Profiles & Social Graph
- `ProfileScreen` with own/other-user mode
- Follow/unfollow buttons wired to API
- `FollowersScreen` and `FollowingScreen`
- `EditProfileScreen` (`PUT /users/me`)

### Phase 4 — Explore & Tags
- `ExploreScreen` with trending tags grid
- `TagPostsScreen` with paginated tag feed

### Phase 5 — Messaging
- `MessagesScreen` (conversation list)
- `ConversationScreen` with WebSocket integration
- `useWebSocket` hook with reconnect logic
- Image messages via REST fallback
- Unread badge on Messages tab

### Phase 6 — Polish & Settings
- `SettingsScreen` with theme toggle and logout
- Dark / light theme tokens wired through `StyleSheet` via `themeStore`
- Skeleton loading states for all list screens
- Accessibility: `accessibilityLabel`, `accessibilityRole` on all interactive elements
- Handle keyboard avoiding on compose/chat screens (`KeyboardAvoidingView`)
- Test on both Android and iOS simulators

---

## 15. Key Constraints & Rules

1. **No backend code** — the mobile repo contains only frontend code. All data comes from the existing backend API.
2. **AsyncStorage instead of localStorage** — all persistent state uses `@react-native-async-storage/async-storage`.
3. **Use `snake_case` from API as-is in types** — avoids mismatch bugs between backend shape and mobile types (the web app uses `camelCase` due to a local mapping layer; mobile avoids this complexity).
4. **WebSocket images via REST** — image messages must be uploaded via `POST /messages/:username` first; the returned `image_url` is then sent over WebSocket or included in the response.
5. **No avatar upload** — backend does not support avatar uploads; do not build this UI.
6. **Pagination default: 20 items/page** — matches backend default; use `limit=20` everywhere.
7. **JWT is NOT refreshable** — token lasts 72h; no refresh flow needed. If expired, user must log in again.

---

## 16. Dependencies (`package.json` additions)

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.1.0",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "@shopify/flash-list": "^1.7.0",
    "axios": "^1.7.0",
    "date-fns": "^4.1.0",
    "react-native-image-picker": "^7.1.0",
    "react-native-safe-area-context": "^4.12.0",
    "react-native-screens": "^4.4.0",
    "react-native-skeleton-placeholder": "^5.2.4",
    "react-native-vector-icons": "^10.2.0",
    "zustand": "^5.0.0"
  }
}
```
