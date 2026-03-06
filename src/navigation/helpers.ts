import type {NavigationProp} from '@react-navigation/native';
import type {MainTabParamList, MessagesStackParamList} from './types';

export const TAB_ROOT = {
  HomeTab: 'Home',
  ExploreTab: 'Explore',
  NotificationsTab: 'Notifications',
  MessagesTab: 'Messages',
  ProfileTab: 'Profile',
} as const satisfies {
  [K in keyof MainTabParamList]: string;
};

const TAB_ROOT_PARAMS: {
  [K in keyof MainTabParamList]: MainTabParamList[K];
} = {
  HomeTab: {screen: 'Home'},
  ExploreTab: {screen: 'Explore'},
  NotificationsTab: {screen: 'Notifications'},
  MessagesTab: {screen: 'Messages'},
  ProfileTab: {screen: 'Profile', params: {}},
};

export type MainTabNavigation = NavigationProp<MainTabParamList>;

export function navigateToTabRoot(
  navigation: MainTabNavigation,
  tabName: keyof MainTabParamList,
) {
  const navigate = navigation.navigate as unknown as (
    screen: keyof MainTabParamList,
    params: MainTabParamList[keyof MainTabParamList],
  ) => void;
  navigate(tabName, TAB_ROOT_PARAMS[tabName]);
}

export function navigateToExploreTag(
  navigation: MainTabNavigation,
  tagName: string,
) {
  navigation.navigate('ExploreTab', {
    screen: 'TagPosts',
    params: {tagName},
    initial: false,
  });
}

export function navigateToConversation(
  navigation: MainTabNavigation,
  params: MessagesStackParamList['Conversation'],
) {
  navigation.navigate('MessagesTab', {
    screen: 'Conversation',
    params,
    initial: false,
  });
}
