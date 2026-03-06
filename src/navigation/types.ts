import type {NavigatorScreenParams} from '@react-navigation/native';
import type {Post} from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  PostDetail: {postId: string};
  Profile: {username: string};
  CreatePost: undefined;
  QuotePost: {post: Post};
  Followers: {username: string};
  Following: {username: string};
  EditProfile: undefined;
};

export type ExploreStackParamList = {
  Explore: undefined;
  TagPosts: {tagName: string};
  Profile: {username: string};
  PostDetail: {postId: string};
  QuotePost: {post: Post};
  Followers: {username: string};
  Following: {username: string};
  EditProfile: undefined;
};

export type MessagesStackParamList = {
  Messages: undefined;
  NewConversation: undefined;
  Conversation: {username: string; userId: string; displayName: string};
};

export type NotificationsStackParamList = {
  Notifications: undefined;
  Profile: {username: string};
  PostDetail: {postId: string};
};

export type ProfileStackParamList = {
  Profile: {username?: string};
  EditProfile: undefined;
  Followers: {username: string};
  Following: {username: string};
  Settings: undefined;
  Bookmarks: undefined;
  PostDetail: {postId: string};
  QuotePost: {post: Post};
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  NotificationsTab: NavigatorScreenParams<NotificationsStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
