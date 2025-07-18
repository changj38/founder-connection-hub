import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageSquare, RefreshCcw, Send } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useForumPosts, useForumPost, useCreatePost, useCreateComment, useTogglePostHeart, useToggleCommentHeart, formatDate, ForumPost } from '@/utils/forumApi';
import { countProfilesInSupabase, getProfilesInSupabase, getSpecificProfile } from '@/utils/supabaseUtils';

const ForumPage = () => {
  const { data: posts, isLoading: isLoadingPosts, isError: isPostsError, error: postsError, refetch: refetchPosts } = useForumPosts();
  
  const { session } = useAuth();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const postsPerPage = 10;
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<any[] | null>(null);
  const [specificProfile, setSpecificProfile] = useState<Record<string, any> | null>(null);
  
  const { data: selectedPostData, isLoading: isLoadingPost, isError: isPostError } = useForumPost(selectedPostId || '');
  
  const createPost = useCreatePost();
  const createComment = useCreateComment();
  const togglePostHeart = useTogglePostHeart();
  const toggleCommentHeart = useToggleCommentHeart();

  useEffect(() => {
    const fetchData = async () => {
      const count = await countProfilesInSupabase();
      setProfileCount(count);
      
      const allProfiles = await getProfilesInSupabase();
      setProfiles(allProfiles);
      
      if (posts && posts.length > 0) {
        const userIds = [...new Set(posts.map(post => post.user_id))];
        console.log('Post user IDs for profile check:', userIds);
        
        const profilesById: Record<string, any> = {};
        
        for (const userId of userIds) {
          const profile = await getSpecificProfile(userId);
          if (profile) {
            profilesById[userId] = profile;
          } else {
            console.warn(`No profile found for user ID: ${userId} in ForumPage useEffect`);
            profilesById[userId] = {
              id: userId,
              full_name: 'Anonymous User',
              company: '',
              role: 'user'
            };
          }
        }
        
        setSpecificProfile(profilesById);
      }
    };

    fetchData();
  }, [posts]);

  const getInitials = (name: string) => {
    if (!name || name === 'Anonymous User') return 'AU';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  const formatAuthor = (name?: string, company?: string) => {
    if (!name || name === 'Anonymous User') return 'Anonymous User';
    if (!company) return name;
    return `${name} from ${company}`;
  };

  const paginatedPosts = posts ? posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage) : [];
  const totalPages = posts ? Math.ceil(posts.length / postsPerPage) : 0;

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPost.mutateAsync({ title, content });
      setTitle('');
      setContent('');
      setIsNewPostOpen(false);
      toast({
        title: "Success",
        description: "Your post has been published.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPostId) return;

    if (!commentContent.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter some content for your comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createComment.mutateAsync({ postId: selectedPostId, content: commentContent });
      setCommentContent('');
      toast({
        title: "Success",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment.",
        variant: "destructive",
      });
    }
  };

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setCommentContent('');
  };

  const handleHeartPost = async (postId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to heart a post.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Attempting to toggle heart for post:", postId);
      const isHearted = await togglePostHeart.mutateAsync(postId);
      
      toast({
        title: isHearted ? "Post Hearted" : "Heart Removed",
        description: isHearted 
          ? "You've added a heart to this post." 
          : "You've removed your heart from this post.",
      });
    } catch (error) {
      console.error("Error hearting post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to heart post.",
        variant: "destructive",
      });
    }
  };

  const handleHeartComment = async (postId: string, commentId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to heart a comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Attempting to toggle heart for comment:", commentId, "in post:", postId);
      const isHearted = await toggleCommentHeart.mutateAsync({ postId, commentId });
      
      toast({
        title: isHearted ? "Comment Hearted" : "Heart Removed",
        description: isHearted 
          ? "You've added a heart to this comment." 
          : "You've removed your heart from this comment.",
      });
    } catch (error) {
      console.error("Error hearting comment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to heart comment.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingPosts) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Founder Forum</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex gap-2">
              <Skeleton className="h-6 w-6" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isPostsError) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Founder Forum</h1>
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">Error loading forum posts</p>
          <p className="mb-4">{postsError instanceof Error ? postsError.message : "Unknown error"}</p>
          <Button onClick={() => refetchPosts()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Founder Forum</h1>
          <Button 
            onClick={() => setIsNewPostOpen(true)}
            disabled={!session}
          >
            New Post
          </Button>
        </div>

        <div className="bg-[#f6f6ef] border border-[#e6e6e0] rounded">
          {paginatedPosts.map((post, index) => (
            <div key={post.id} className="p-2 hover:bg-[#f0f0e8]">
              <div className="flex items-start">
                <div className="mr-2 text-center">
                  <div className="text-[#828282] text-xs">{index + 1 + (currentPage - 1) * postsPerPage}</div>
                </div>
                <div className="flex-1">
                  <div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-[#000000] font-medium hover:text-[#ff6600] text-base text-left"
                      onClick={() => handleViewPost(post.id)}
                    >
                      {post.title}
                    </Button>
                  </div>
                  <div className="text-xs text-[#828282]">
                    by {formatAuthor(post.author_name, post.author_company)} | {formatDate(post.created_at)} | {post.comment_count} comments
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleHeartPost(post.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart 
                      className={`h-5 w-5 ${post.is_hearted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                    />
                  </Button>
                  <span className="text-sm text-gray-500">{post.heart_count || 0}</span>
                </div>
              </div>
              {index < paginatedPosts.length - 1 && <Separator className="my-2" />}
            </div>
          ))}

          {posts && posts.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-[#828282] mb-4">No posts yet. Be the first to start a discussion!</p>
              {session ? (
                <Button onClick={() => setIsNewPostOpen(true)}>Create a Post</Button>
              ) : (
                <p className="text-sm">Please log in to create a post.</p>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        <Sheet open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <SheetContent className="sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Create a New Post</SheetTitle>
            </SheetHeader>
            
            <form onSubmit={handleSubmitPost} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your post"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewPostOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPost.isPending || !title.trim()}
                >
                  {createPost.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        <Dialog open={!!selectedPostId} onOpenChange={(open) => !open && setSelectedPostId(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            {isLoadingPost ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : isPostError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Error loading post</p>
                <Button onClick={() => setSelectedPostId(null)}>Close</Button>
              </div>
            ) : selectedPostData ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedPostData.post.title}</DialogTitle>
                  <div className="text-sm text-[#828282] mt-1">
                    By {formatAuthor(selectedPostData.post.author_name, selectedPostData.post.author_company)} • {formatDate(selectedPostData.post.created_at)}
                  </div>
                </DialogHeader>
                
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleHeartPost(selectedPostData.post.id)}
                    className="flex items-center gap-1 h-8"
                  >
                    <Heart 
                      className={`h-5 w-5 ${selectedPostData.post.is_hearted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                    />
                    <span className="text-sm">
                      {selectedPostData.post.heart_count || 0} {selectedPostData.post.heart_count === 1 ? 'heart' : 'hearts'}
                    </span>
                  </Button>
                </div>
                
                {selectedPostData.post.content && (
                  <div className="mt-4 whitespace-pre-line">
                    {selectedPostData.post.content}
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Comments ({selectedPostData.comments.length})</h3>
                  
                  {selectedPostData.comments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPostData.comments.map((comment) => (
                        <div key={comment.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              {comment.author_avatar ? (
                                <AvatarImage 
                                  src={comment.author_avatar} 
                                  alt={comment.author_name || 'User'} 
                                />
                              ) : (
                                <AvatarFallback className="bg-[#ff6600] text-white text-xs">
                                  {getInitials(comment.author_name || 'Anonymous User')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {formatAuthor(comment.author_name, comment.author_company)}
                                </span>
                                <span className="text-xs text-[#828282]">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <div className="mt-1 text-sm whitespace-pre-line">
                                {comment.content}
                              </div>
                              <div className="mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleHeartComment(selectedPostData.post.id, comment.id)}
                                  className="h-8 px-2 flex items-center gap-1"
                                >
                                  <Heart 
                                    className={`h-4 w-4 ${comment.is_hearted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                                  />
                                  <span className="text-xs">
                                    {comment.heart_count || 0}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#828282] text-center py-4">No comments yet. Be the first to respond!</p>
                  )}
                  
                  {session ? (
                    <form onSubmit={handleSubmitComment} className="mt-6">
                      <Textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write a comment..."
                        className="mb-3"
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          disabled={createComment.isPending || !commentContent.trim()}
                          className="flex items-center gap-2"
                        >
                          {createComment.isPending ? (
                            "Posting..."
                          ) : (
                            <>
                              <Send className="h-4 w-4" /> Post Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-sm text-[#828282] mt-4">
                      You must be logged in to comment.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ForumPage;
