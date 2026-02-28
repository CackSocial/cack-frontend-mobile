import type {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  PostDetail: {postId: string};
  Profile: {username: string};
  CreatePost: undefined;
  Followers: {username: string};
  Following: {username: string};
  EditProfile: undefined;
};

export type ExploreStackParamList = {
  Explore: undefined;
  TagPosts: {tagName: string};
  Profile: {username: string};
  PostDetail: {postId: string};
  Followers: {username: string};
  Following: {username: string};
  EditProfile: undefined;
};

export type MessagesStackParamList = {
  Messages: undefined;
  NewConversation: undefined;
  Conversation: {username: string; userId: string; displayName: string};
};

export type ProfileStackParamList = {
  Profile: {username?: string} | undefined;
  EditProfile: undefined;
  Followers: {username: string};
  Following: {username: string};
  Settings: undefined;
  PostDetail: {postId: string};
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
