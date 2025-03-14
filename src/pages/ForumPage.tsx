
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ForumPage = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: 'Fundraising strategies in a down market',
      content: "I'm preparing for our Series A and wondering what strategies are working best in the current economic climate. Has anyone successfully raised in the last 6 months? What channels or approaches yielded the best results?",
      author: 'Alex Chen',
      date: '2 days ago',
      replies: 5,
      replyList: [
        {
          id: 1,
          author: 'Sarah Miller',
          content: "We raised our Series A two months ago. What worked for us was focusing on profitability and unit economics rather than pure growth. Investors are much more focused on sustainable business models now.",
          date: '1 day ago'
        },
        {
          id: 2,
          author: 'David Wong',
          content: "Strategic investors were key for us. We found that industry-specific VCs were still actively deploying capital, while generalist funds were being more cautious.",
          date: '1 day ago'
        }
      ]
    },
    {
      id: 2,
      title: 'Best practices for remote engineering teams',
      content: "We've been fully remote since day one, but as we scale past 15 engineers, I'm noticing some communication challenges. Would love to hear what tools and processes are working well for other remote-first startups.",
      author: 'Sarah Johnson',
      date: '3 days ago',
      replies: 8,
      replyList: [
        {
          id: 1,
          author: 'Michael Chen',
          content: "We've had great success with Notion for documentation, Linear for project management, and asynchronous stand-ups where everyone records a quick video update.",
          date: '2 days ago'
        }
      ]
    },
    {
      id: 3,
      title: 'Marketing channels that worked for early-stage B2B',
      content: "We're a B2B SaaS with a $15K ACV and trying to figure out which marketing channels to prioritize. Content marketing has been slow to gain traction. Has anyone found success with alternative approaches?",
      author: 'Michael Rodriguez',
      date: '5 days ago',
      replies: 12,
      replyList: [
        {
          id: 1,
          author: 'Lisa Park',
          content: "Targeted LinkedIn campaigns worked surprisingly well for us, especially when we focused on specific job titles and company sizes.",
          date: '4 days ago'
        }
      ]
    }
  ]);
  const { toast } = useToast();

  const handleCreatePost = () => {
    if (!postTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would be an API call to create a post
    const newPost = {
      id: discussions.length + 1,
      title: postTitle,
      content: postContent,
      author: "You",
      date: "Just now",
      replies: 0,
      replyList: []
    };

    setDiscussions([newPost, ...discussions]);
    setPostTitle('');
    setPostContent('');
    
    toast({
      title: "Success",
      description: "Your post has been published!",
    });
  };

  const handleViewDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setDialogOpen(true);
    setReplyContent('');
  };

  const handlePostReply = () => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your reply.",
        variant: "destructive",
      });
      return;
    }

    // Update the selected discussion with the new reply
    const newReply = {
      id: selectedDiscussion.replyList ? selectedDiscussion.replyList.length + 1 : 1,
      author: "You",
      content: replyContent,
      date: "Just now"
    };

    const updatedDiscussions = discussions.map(discussion => {
      if (discussion.id === selectedDiscussion.id) {
        const updatedReplyList = [...(discussion.replyList || []), newReply];
        return {
          ...discussion,
          replies: discussion.replies + 1,
          replyList: updatedReplyList
        };
      }
      return discussion;
    });

    // Update the discussions state
    setDiscussions(updatedDiscussions);
    
    // Update the selected discussion to include the new reply
    const updatedSelectedDiscussion = {
      ...selectedDiscussion,
      replies: selectedDiscussion.replies + 1,
      replyList: [...(selectedDiscussion.replyList || []), newReply]
    };
    setSelectedDiscussion(updatedSelectedDiscussion);
    
    // Clear the reply input
    setReplyContent('');
    
    toast({
      title: "Success",
      description: "Your reply has been posted!",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Founder Forum</h1>
      
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input 
                placeholder="Discussion topic..." 
                className="mb-4"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
              <Textarea 
                placeholder="Share your thoughts, ask questions, or start a discussion..." 
                className="min-h-[120px]"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCreatePost}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Post
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Discussions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <div key={discussion.id} className="group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium group-hover:text-daydream-blue cursor-pointer transition-colors">
                        {discussion.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        Started by {discussion.author} • {discussion.date} • {discussion.replies} replies
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDiscussion(discussion)}
                    >
                      View
                    </Button>
                  </div>
                  {index < discussions.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedDiscussion?.title}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Posted by {selectedDiscussion?.author} • {selectedDiscussion?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-gray-700 whitespace-pre-line">{selectedDiscussion?.content}</p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Replies ({selectedDiscussion?.replies})</h4>
            {selectedDiscussion?.replyList && selectedDiscussion.replyList.length > 0 ? (
              <div className="space-y-4">
                {selectedDiscussion.replyList.map((reply) => (
                  <div key={reply.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{reply.author}</span>
                      <span className="text-xs text-gray-500">{reply.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No replies yet. Be the first to respond!</p>
            )}
          </div>
          <div className="mt-4">
            <Textarea 
              placeholder="Write a reply..." 
              className="mb-2" 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <Button size="sm" onClick={handlePostReply}>Post Reply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPage;
