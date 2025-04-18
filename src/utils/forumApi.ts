import { supabase } from '../integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfileMap, ensureUserProfile } from './supabaseUtils';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  heart_count?: number;
  author_name?: string;
  author_company?: string;
  comment_count?: number;
  is_hearted?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  heart_count?: number;
  is_hearted?: boolean;
  author_name?: string;
  author_company?: string;
  author_avatar?: string;
}

export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  console.log('Fetching all forum posts');
  
  try {
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching forum posts:', error);
      throw error;
    }
    
    if (!posts || posts.length === 0) {
      console.log('No forum posts found');
      return [];
    }

    console.log(`Retrieved ${posts.length} forum posts`);
    
    const userIds = [...new Set(posts.map(post => post.user_id))].filter(Boolean);
    console.log('Unique user IDs from posts:', userIds);
    
    const userMap = await getUserProfileMap(userIds);
    console.log('User profile map created with keys:', Object.keys(userMap));
    
    const commentCounts: Record<string, number> = {};
    for (const post of posts) {
      const { count, error } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      if (error) {
        console.error(`Error fetching comment count for post ${post.id}:`, error);
      } else {
        commentCounts[post.id] = count || 0;
      }
    }
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    let userHearts: Record<string, boolean> = {};
    if (userId) {
      const postIds = posts.map(post => post.id);
      const { data: hearts } = await supabase
        .from('forum_post_hearts')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);
        
      if (hearts) {
        hearts.forEach(heart => {
          userHearts[heart.post_id] = true;
        });
      }
    }
    
    const enrichedPosts = posts.map(post => {
      const authorInfo = userMap[post.user_id] || { name: 'Anonymous User', company: '' };
      
      return {
        ...post,
        author_name: authorInfo.name,
        author_company: authorInfo.company,
        comment_count: commentCounts[post.id] || 0,
        is_hearted: userHearts[post.id] || false
      };
    });
    
    console.log('Enriched posts with author info and comment counts');
    return enrichedPosts;
  } catch (error) {
    console.error('Error in fetchForumPosts:', error);
    throw error;
  }
};

export const fetchPostWithComments = async (postId: string): Promise<{ post: ForumPost, comments: ForumComment[] }> => {
  console.log('Fetching post and comments for postId:', postId);
  
  try {
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
    
    const { data: comments, error: commentsError } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      throw commentsError;
    }
    
    console.log(`Retrieved ${comments?.length || 0} comments for post ${postId}`);
    
    const allUserIds = [
      post.user_id,
      ...(comments || []).map(comment => comment.user_id)
    ].filter(Boolean);
    
    const userIds = [...new Set(allUserIds)];
    console.log('User IDs to fetch profiles for:', userIds);
    
    const userMap = await getUserProfileMap(userIds);
    console.log('User profile map created for post with comments:', Object.keys(userMap));
    
    const enrichedPost: ForumPost = {
      ...post,
      author_name: userMap[post.user_id]?.name || 'Anonymous User',
      author_company: userMap[post.user_id]?.company || '',
      comment_count: comments?.length || 0
    };
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (userId) {
      const { data: heart } = await supabase
        .from('forum_post_hearts')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
        
      enrichedPost.is_hearted = !!heart;
    }
    
    const enrichedComments: ForumComment[] = [];
    
    for (const comment of comments || []) {
      const authorInfo = userMap[comment.user_id] || { 
        name: 'Anonymous User', 
        company: '', 
        avatarUrl: '' 
      };
      
      let isHearted = false;
      if (userId) {
        const { data: heart } = await supabase
          .from('forum_comment_hearts')
          .select('*')
          .eq('comment_id', comment.id)
          .eq('user_id', userId)
          .single();
          
        isHearted = !!heart;
      }
      
      enrichedComments.push({
        ...comment,
        author_name: authorInfo.name,
        author_company: authorInfo.company,
        author_avatar: authorInfo.avatarUrl,
        is_hearted: isHearted
      });
    }
    
    console.log('Successfully enriched post and comments with author info and heart status');
    return {
      post: enrichedPost,
      comments: enrichedComments
    };
  } catch (error) {
    console.error('Error in fetchPostWithComments:', error);
    throw error;
  }
};

export const createForumPost = async (title: string, content: string): Promise<ForumPost> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('You must be logged in to create a post');
    }
    
    const userId = userData.user.id;
    console.log('Creating post as user:', userId);
    
    await ensureUserProfile(userId);
    
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        user_id: userId
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
    
    console.log('Post created successfully:', post);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, company')
      .eq('id', userId)
      .single();
    
    return {
      ...post,
      author_name: profile?.full_name || 'Anonymous User',
      author_company: profile?.company || '',
      comment_count: 0,
      is_hearted: false
    };
  } catch (error) {
    console.error('Error in createForumPost:', error);
    throw error;
  }
};

export const createForumComment = async (postId: string, content: string): Promise<ForumComment> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('You must be logged in to comment');
    }
    
    const userId = userData.user.id;
    console.log('Creating comment as user:', userId);
    
    await ensureUserProfile(userId);
    
    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        content,
        user_id: userId
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
    
    console.log('Comment created successfully:', comment);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, company')
      .eq('id', userId)
      .single();
    
    return {
      ...comment,
      author_name: profile?.full_name || 'Anonymous User',
      author_company: profile?.company || ''
    };
  } catch (error) {
    console.error('Error in createForumComment:', error);
    throw error;
  }
};

export const togglePostHeart = async (postId: string): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('You must be logged in to heart a post');
    }

    const userId = userData.user.id;
    console.log('Toggling heart for post:', postId, 'by user:', userId);

    const { data: existingHeart, error: checkError } = await supabase
      .from('forum_post_hearts')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing heart:', checkError);
      throw checkError;
    }

    if (existingHeart) {
      const { error: deleteError } = await supabase
        .from('forum_post_hearts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error removing heart:', deleteError);
        throw deleteError;
      }

      console.log('Heart removed successfully');
      return false;
    } else {
      const { error: insertError } = await supabase
        .from('forum_post_hearts')
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (insertError) {
        console.error('Error adding heart:', insertError);
        throw insertError;
      }

      console.log('Heart added successfully');
      return true;
    }
  } catch (error) {
    console.error('Error in togglePostHeart:', error);
    throw error;
  }
};

export const toggleCommentHeart = async (commentId: string): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('You must be logged in to heart a comment');
    }

    const userId = userData.user.id;
    console.log('Toggling heart for comment:', commentId, 'by user:', userId);

    const { data: existingHeart, error: checkError } = await supabase
      .from('forum_comment_hearts')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing heart:', checkError);
      throw checkError;
    }

    if (existingHeart) {
      const { error: deleteError } = await supabase
        .from('forum_comment_hearts')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error removing heart:', deleteError);
        throw deleteError;
      }

      console.log('Comment heart removed successfully');
      return false;
    } else {
      const { error: insertError } = await supabase
        .from('forum_comment_hearts')
        .insert({
          comment_id: commentId,
          user_id: userId
        });

      if (insertError) {
        console.error('Error adding heart to comment:', insertError);
        throw insertError;
      }

      console.log('Comment heart added successfully');
      return true;
    }
  } catch (error) {
    console.error('Error in toggleCommentHeart:', error);
    throw error;
  }
};

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

export const useTogglePostHeart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => togglePostHeart(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      queryClient.invalidateQueries({ queryKey: ['forumPost', postId] });
    }
  });
};

export const useToggleCommentHeart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => toggleCommentHeart(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.postId] });
    }
  });
};

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
