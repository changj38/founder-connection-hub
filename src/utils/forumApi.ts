
import { supabase } from '../integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  // Additional fields for UI
  author_name?: string;
  author_company?: string;
  comment_count?: number;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Additional fields for UI
  author_name?: string;
  author_company?: string;
}

// Fetch profiles for multiple user IDs
const fetchProfiles = async (userIds: string[]) => {
  if (!userIds || userIds.length === 0) return {};
  
  // Filter out any null or undefined IDs
  const validUserIds = userIds.filter(Boolean);
  
  if (validUserIds.length === 0) return {};
  
  console.log('Fetching profiles for user IDs:', validUserIds);
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, company')
    .in('id', validUserIds);
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return {};
  }
  
  console.log('Profiles retrieved from database:', profiles);
  
  // Create a map of user IDs to profiles
  const userMap: Record<string, { name: string, company: string }> = {};
  
  if (profiles && profiles.length > 0) {
    profiles.forEach(profile => {
      userMap[profile.id] = {
        name: profile.full_name || 'Anonymous User',
        company: profile.company || ''
      };
    });
  }
  
  return userMap;
};

// Forum posts functions
export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  console.log('Fetching all forum posts');
  
  // Fetch posts
  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching forum posts:', error);
    throw error;
  }
  
  if (!posts || posts.length === 0) {
    return [];
  }

  console.log('Retrieved posts:', posts);

  // Get unique user IDs from posts
  const userIds = [...new Set(posts.map(post => post.user_id))].filter(Boolean);
  console.log('Unique user IDs from posts:', userIds);
  
  // Fetch user profiles
  const userMap = await fetchProfiles(userIds);
  console.log('User profile map for posts:', userMap);
  
  // Count comments for each post
  const commentCounts: Record<string, number> = {};
  for (const post of posts) {
    const { count, error } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    
    if (error) {
      console.error('Error fetching comment count:', error);
    } else {
      commentCounts[post.id] = count || 0;
    }
  }
  
  // Enrich posts with author names, companies, and comment counts
  const enrichedPosts = posts.map(post => {
    const authorInfo = userMap[post.user_id] || { name: 'Anonymous User', company: '' };
    console.log(`Enriching post by user_id: ${post.user_id} with author info:`, authorInfo);
    
    return {
      ...post,
      author_name: authorInfo.name,
      author_company: authorInfo.company,
      comment_count: commentCounts[post.id] || 0
    };
  });
  
  console.log('Enriched posts:', enrichedPosts);
  return enrichedPosts;
};

export const fetchPostWithComments = async (postId: string): Promise<{ post: ForumPost, comments: ForumComment[] }> => {
  console.log('Fetching post and comments for postId:', postId);
  
  // Fetch the post
  const { data: post, error: postError } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', postId)
    .single();
  
  if (postError) {
    console.error('Error fetching forum post:', postError);
    throw postError;
  }
  
  if (!post) {
    throw new Error('Post not found');
  }
  
  console.log('Retrieved post:', post);
  
  // Fetch comments for the post
  const { data: comments, error: commentsError } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
    throw commentsError;
  }
  
  console.log('Retrieved comments:', comments);
  
  // Get unique user IDs from post and comments
  const allUserIds = [
    post.user_id,
    ...(comments || []).map(comment => comment.user_id)
  ].filter(Boolean);
  
  // Remove duplicates
  const userIds = [...new Set(allUserIds)];
  
  console.log('User IDs to fetch profiles for:', userIds);
  
  // Fetch user profiles
  const userMap = await fetchProfiles(userIds);
  
  console.log('User mapping created:', userMap);
  
  // Enrich post with author name and company
  const enrichedPost: ForumPost = {
    ...post,
    author_name: userMap[post.user_id]?.name || 'Anonymous User',
    author_company: userMap[post.user_id]?.company || '',
    comment_count: comments?.length || 0
  };
  
  // Enrich comments with author names and companies
  const enrichedComments: ForumComment[] = (comments || []).map(comment => {
    const authorInfo = userMap[comment.user_id] || { name: 'Anonymous User', company: '' };
    console.log('Enriching comment by user_id:', comment.user_id, 'with author info:', authorInfo);
    return {
      ...comment,
      author_name: authorInfo.name,
      author_company: authorInfo.company
    };
  });
  
  console.log('Enriched post:', enrichedPost);
  console.log('Enriched comments:', enrichedComments);
  
  return {
    post: enrichedPost,
    comments: enrichedComments
  };
};

export const createForumPost = async (title: string, content: string): Promise<ForumPost> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error('You must be logged in to create a post');
  }
  
  const { data: post, error } = await supabase
    .from('forum_posts')
    .insert({
      title,
      content,
      user_id: userData.user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
  
  if (!post) {
    throw new Error('Failed to create post');
  }
  
  // Fetch the current user's profile data to return with the new post
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, company')
    .eq('id', userData.user.id)
    .single();
    
  if (profileError) {
    console.error('Error fetching current user profile:', profileError);
  }
  
  return {
    ...post,
    author_name: profile?.full_name || 'Anonymous User',
    author_company: profile?.company || '',
    comment_count: 0
  };
};

export const createForumComment = async (postId: string, content: string): Promise<ForumComment> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error('You must be logged in to comment');
  }
  
  const { data: comment, error } = await supabase
    .from('forum_comments')
    .insert({
      post_id: postId,
      content,
      user_id: userData.user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
  
  if (!comment) {
    throw new Error('Failed to create comment');
  }
  
  // Fetch the current user's profile data to return with the new comment
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, company')
    .eq('id', userData.user.id)
    .single();
    
  if (profileError) {
    console.error('Error fetching current user profile:', profileError);
  }
  
  return {
    ...comment,
    author_name: profile?.full_name || 'Anonymous User',
    author_company: profile?.company || ''
  };
};

// Hooks for React Query integration
export const useForumPosts = () => {
  return useQuery({
    queryKey: ['forumPosts'],
    queryFn: fetchForumPosts
  });
};

export const useForumPost = (postId: string) => {
  return useQuery({
    queryKey: ['forumPost', postId],
    queryFn: () => fetchPostWithComments(postId),
    enabled: !!postId
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) => 
      createForumPost(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      createForumComment(postId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });
};

// Formatting functions
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};
