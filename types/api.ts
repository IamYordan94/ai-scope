/**
 * API response types
 */

import { Post } from './post';
import { Tool } from './tool';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreatePostResponse extends ApiResponse {
  post?: {
    id: string;
    slug: string;
    title: string;
    published_at: string | null;
  };
  scheduled_for?: string;
}

export interface PostsListResponse extends ApiResponse {
  posts?: Post[];
  stats?: {
    total: number;
    published: number;
    scheduled: number;
    drafts: number;
  };
  categorized?: {
    published: Post[];
    scheduled: Post[];
    drafts: Post[];
  };
}

export interface ToolsNeedingPostsResponse extends ApiResponse {
  tools?: Tool[];
  count?: number;
  totalTools?: number;
  totalPosts?: number;
}

export interface PostUpdateResponse extends ApiResponse {
  post?: Post;
}

