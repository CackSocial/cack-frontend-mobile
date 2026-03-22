# CackMobile

A React Native social networking app — the mobile client for the Cack platform. Users can browse a home feed, create/repost/quote posts, explore trending tags and users, exchange direct messages in real time, receive notifications, manage followers, and customize their profile.

## Table of Contents

- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Screenshots

<table>
  <tr>
    <td><img src="readme_images/WhatsApp Image 2026-03-22 at 19.42.35 (1).jpeg" width="300"/></td>
    <td><img src="readme_images/WhatsApp Image 2026-03-22 at 19.42.34.jpeg" width="300"/></td>
    <td><img src="readme_images/WhatsApp Image 2026-03-22 at 19.42.35.jpeg" width="300"/></td>
  </tr>
  <tr>
    <td><img src="readme_images/WhatsApp Image 2026-03-22 at 19.42.36.jpeg" width="300"/></td>
    <td><img src="readme_images/WhatsApp Image 2026-03-22 at 19.42.36 (2).jpeg" width="300"/></td>
    <td><img src="readme_images/WhatsApp Image 2026-03-22 at 19.42.36 (1).jpeg" width="300"/></td>
  </tr>
</table>

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 5.5+ |
| **Framework** | React Native 0.84 (React 19) |
| **Navigation** | React Navigation 7 (native stack + bottom tabs) |
| **State management** | Zustand 5 |
| **HTTP client** | Axios 1.7 (JWT Bearer + double-submit CSRF) |
| **Real-time** | WebSocket (native) with exponential-backoff reconnect |
| **Storage** | `@react-native-async-storage/async-storage` |
| **Lists** | `@shopify/flash-list` |
| **Icons** | `react-native-vector-icons` (MaterialCommunityIcons) |
| **Fonts** | Syne (display), Outfit (body) via Expo Google Fonts |
| **Date formatting** | `date-fns` |
| **Image picking** | `react-native-image-picker` |
| **Linting** | ESLint with `@react-native/eslint-config` |
| **Testing** | Jest 29 |
| **Runtime** | Hermes (Android) |

---

## Prerequisites

- **Node.js** 18 or higher
- **npm** (bundled with Node.js)
- **React Native CLI** development environment set up for your target platform:
  - [Android](https://reactnative.dev/docs/set-up-your-environment?platform=android): Android Studio, Android SDK, Java 17, `ANDROID_HOME` env var
  - [iOS](https://reactnative.dev/docs/set-up-your-environment?platform=ios): Xcode 15+, CocoaPods, macOS only
- A running instance of the **Cack backend** API (defaults to `http://localhost:8080`)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CackSocial/cack-frontend-mobile.git
cd cack-frontend-mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) for the full reference.

### 4. Android — Run on Emulator or Device

Start the Metro bundler and launch on Android in two separate terminals:

```bash
# Terminal 1 – start Metro
npm start

# Terminal 2 – build and install on connected device/emulator
npm run android
```

The default `API_BASE_URL` in `src/config.ts` points to `http://10.0.2.2:8080/api/v1`, which is the standard Android emulator alias for the host machine's `localhost`. If you're running on a physical device, update `API_BASE_URL` in your `.env` to your machine's LAN IP.

### 5. iOS — Run on Simulator or Device (macOS only)

```bash
# Install CocoaPods dependencies (first time or after native changes)
cd ios && pod install && cd ..

# Start Metro and launch on iOS
npm start
# In another terminal:
npm run ios
```

---

## Environment Variables

All three variables are read at runtime from `src/config.ts`. The file checks `globalThis.__DEV_*__` overrides first, then falls back to hardcoded development defaults. Override them by injecting the `__DEV_*__` globals via your Metro config or a build-time tool.

| Variable | Description | Default (dev) |
|---|---|---|
| `API_BASE_URL` | Backend REST API base URL — **no trailing slash** | `http://10.0.2.2:8080/api/v1` |
| `WS_URL` | WebSocket endpoint for real-time messages & notifications | `ws://10.0.2.2:8080/api/v1/ws` |
| `UPLOADS_URL` | Static file prefix used to resolve avatar / image URLs | `http://10.0.2.2:8080/uploads` |

> `10.0.2.2` is the Android emulator loopback to the host machine. For iOS simulator use `http://localhost:8080`. For physical devices, use your machine's LAN IP (e.g. `http://192.168.1.x:8080`).

---

## Architecture

### Directory Structure

```
src/
├── api/                 # Axios client + one file per API domain
│   ├── client.ts        # Axios instance, JWT/CSRF interceptors, FormData helper
│   ├── auth.ts
│   ├── posts.ts
│   ├── timeline.ts
│   ├── comments.ts
│   ├── likes.ts
│   ├── bookmarks.ts
│   ├── follows.ts
│   ├── messages.ts
│   ├── notifications.ts
│   ├── explore.ts
│   ├── tags.ts
│   ├── users.ts
│   └── index.ts         # Re-exports all API functions
├── stores/              # Zustand global state
│   ├── authStore.ts     # Auth, token hydration, login/register/logout
│   ├── postsStore.ts    # Feed posts + optimistic mutations
│   ├── messagesStore.ts # Conversations, messages, WebSocket lifecycle
│   ├── notificationsStore.ts
│   ├── exploreStore.ts
│   └── themeStore.ts    # Light / dark preference persisted to AsyncStorage
├── navigation/          # React Navigation setup
│   ├── RootNavigator.tsx   # Auth gate; shows AuthStack or MainTabs
│   ├── MainTabs.tsx        # Bottom tab bar with badge counts
│   ├── AuthStack.tsx
│   ├── HomeStack.tsx
│   ├── ExploreStack.tsx
│   ├── MessagesStack.tsx
│   ├── NotificationsStack.tsx
│   ├── ProfileStack.tsx
│   ├── types.ts         # Typed param lists for every stack/tab
│   └── helpers.ts       # Tab-root navigation helper
├── screens/             # One folder per tab section
│   ├── auth/            # LoginScreen, RegisterScreen
│   ├── home/            # HomeScreen (timeline feed)
│   ├── explore/         # Search, trending tags, suggested users
│   ├── post/            # CreatePostScreen, PostDetailScreen, QuotePostScreen
│   ├── messages/        # MessagesScreen, ConversationScreen, NewConversationScreen
│   ├── notifications/   # NotificationsScreen
│   └── profile/         # ProfileScreen, EditProfileScreen, SettingsScreen,
│                        # FollowersScreen, FollowingScreen, BookmarksScreen
├── components/          # Reusable UI components
│   ├── common/          # Shared primitives (Avatar, Button, Skeleton, etc.)
│   ├── post/            # PostCard, PostComposer, QuotePreview, etc.
│   ├── explore/         # SearchBar, TagCard, SuggestedUserCard, etc.
│   ├── messages/        # MessageBubble, ConversationRow, etc.
│   └── user/            # UserRow, FollowButton, etc.
├── hooks/               # Custom React hooks
│   ├── usePaginatedFetch.ts        # Generic paginated list hook
│   ├── useWebSocket.ts             # WS connect/disconnect tied to auth state
│   ├── useOptimisticLike.ts        # Optimistic like toggle
│   ├── useOptimisticBookmark.ts    # Optimistic bookmark toggle
│   ├── useOptimisticRepost.ts      # Optimistic repost toggle
│   ├── usePostDetail.ts
│   ├── usePostCardActions.ts
│   ├── useConversation.ts
│   ├── useConversationLiveUpdates.ts
│   ├── useImagePicker.ts
│   └── useUserPosts.ts
├── utils/               # Pure utility helpers
│   ├── storage.ts       # AsyncStorage wrappers for token & user
│   ├── format.ts        # Date / number formatting
│   ├── log.ts           # Error logging helper
│   ├── messages.ts      # Message-specific utilities
│   ├── posts.ts         # Post-specific utilities
│   ├── profile.ts       # Profile utilities
│   ├── state.ts         # Generic state helpers
│   ├── resolveImageUri.ts  # Converts relative paths to absolute upload URLs
│   └── renderTaggedContent.tsx # Renders @mentions and #hashtags inline
├── types/
│   └── index.ts         # Shared TypeScript interfaces (Post, UserProfile, etc.)
├── authSession.ts       # Module-level logout handler to break circular deps
├── config.ts            # Runtime configuration (URLs, limits)
└── theme.ts             # Design tokens: colors, spacing, typography, fonts
```

### Request Flow

![Request Lifecycle Sequence Diagram](readme_images/diagrams/Mermaid%20Chart%20-%20Create%20complex,%20visual%20diagrams%20with%20text.-2026-03-22-101055.png)

### Real-time Messaging & Notifications

A single WebSocket connection (`WS_URL?token=<jwt>`) is opened after login and torn down on logout. The connection is managed in `messagesStore` with exponential-backoff auto-reconnect (up to 5 attempts, max 30 s delay).

Incoming WS frames are JSON objects with a `type` field:
- `"message"` → appended to the conversation in `messagesStore`
- `"notification"` → forwarded to `notificationsStore`

### Authentication Flow

1. App launches → `RootNavigator` calls `authStore.hydrate()`
2. `hydrate()` reads JWT + cached user from AsyncStorage; if both exist, sets authenticated state immediately (no network round-trip)
3. All Axios requests attach `Authorization: Bearer <token>` via request interceptor
4. A `401` response on any non-auth endpoint fires `triggerSessionLogout()`, which calls `authStore.logout()` and navigates back to `AuthStack`

### CSRF Protection

The client generates a random 64-hex-char token once at startup. Every non-GET request sends it as both `Cookie: sc-csrf=<token>` and `X-CSRF-Token: <token>` (double-submit cookie pattern). The native OkHttp cookie jar is cleared before each mutating request to prevent it from overwriting the manual `Cookie` header.

### Theme System

Two complete color palettes (`light` / `dark`) live in `src/theme.ts` alongside spacing, typography, radius, and size tokens. The active palette is selected by `useColors()` based on the persisted `themeStore` preference. Navigation themes are derived from the same tokens so native headers and tab bars follow the app theme automatically.

### Data Models

| Model | Key fields |
|---|---|
| `UserProfile` | `id`, `username`, `display_name`, `bio`, `avatar_url`, `follower_count`, `following_count`, `is_following` |
| `Post` | `id`, `content`, `image_url`, `author`, `tags`, `post_type` (`original`/`repost`/`quote`), `original_post?`, `like_count`, `repost_count`, `comment_count`, `is_liked`, `is_bookmarked` |
| `Comment` | `id`, `content`, `author`, `created_at` |
| `Message` | `id`, `sender_id`, `receiver_id`, `content`, `image_url`, `read_at` |
| `Notification` | `id`, `actor`, `type` (`like`/`comment`/`follow`/`mention`/`repost`/`quote`) |
| `Tag` | `name`, `post_count` |

All list endpoints return a `PaginatedResponse<T>` with `data`, `page`, `limit`, `total`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start Metro bundler |
| `npm run android` | Build and run on connected Android device/emulator |
| `npm run ios` | Build and run on iOS simulator (macOS only) |
| `npm test` | Run Jest test suite |
| `npm run lint` | Run ESLint across the whole project |
| `npm run typecheck` | Run TypeScript compiler without emitting (type checking only) |
| `npm run clean` | Clean Android Gradle cache and iOS Xcode build |

---

## Testing

Tests live in `__tests__/` and follow Jest conventions.

```bash
# Run all tests
npm test

# Run a specific file
npx jest __tests__/MyComponent.test.tsx

# Run with coverage
npx jest --coverage

# Watch mode
npx jest --watch
```

---

## Troubleshooting

### Metro bundler port conflict

```bash
# Kill whatever is on port 8081 and restart
npx react-native start --reset-cache
```

### Android emulator cannot reach backend

`10.0.2.2` is the correct host loopback for Android emulators. If you're using a physical device, set `API_BASE_URL` to your machine's LAN IP (e.g. `http://192.168.1.100:8080/api/v1`).

### "Unable to load script" on Android

The Metro bundler must be running (`npm start`) before you run `npm run android`. Alternatively, check that the emulator can reach port 8081 on the host.

### iOS build failure after `npm install`

Run `pod install` inside the `ios/` directory to update CocoaPods dependencies before building:

```bash
cd ios && pod install && cd ..
```

### Vector icons not rendering on Android

Fonts are linked via `react-native-vector-icons/fonts.gradle` in `android/app/build.gradle`. If icons appear as squares, try a clean build:

```bash
npm run clean
npm run android
```

### Custom fonts (Syne / Outfit) not showing

Font files must be linked. Run `npx react-native-asset` or verify that `react-native.config.js` correctly points to the font asset directories, then rebuild the app.

### TypeScript errors after pulling new changes

```bash
npm install        # sync dependencies
npm run typecheck  # surface type errors
```
