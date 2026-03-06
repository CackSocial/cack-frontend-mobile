export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export interface Post {
  id: string;
  content: string;
  image_url: string;
  author: UserProfile;
  tags: string[];
  post_type: 'original' | 'repost' | 'quote';
  original_post?: Post;
  repost_count: number;
  is_reposted: boolean;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  actor: UserProfile;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'quote';
  reference_id: string;
  reference_type: string;
  is_read: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author: UserProfile;
  created_at: string;
}

export interface Tag {
  name: string;
  post_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string;
  read_at: string | null;
  created_at: string;
}

export interface ConversationListItem {
  user: UserProfile;
  last_message: Message;
  unread_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

// REFACTORED: Removed unused ApiResponse<T> interface (envelope unwrapped in client.ts interceptor)

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  follower_count: number;
  following_count: number;
  mutual_follower_count: number;
}

export interface ImageAsset {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}
