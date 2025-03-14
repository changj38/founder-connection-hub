
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send } from 'lucide-react';

const ForumPage = () => {
  const [postContent, setPostContent] = useState('');
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: 'Fundraising strategies in a down market',
      author: 'Alex Chen',
      date: '2 days ago',
      replies: 5
    },
    {
      id: 2,
      title: 'Best practices for remote engineering teams',
      author: 'Sarah Johnson',
      date: '3 days ago',
      replies: 8
    },
    {
      id: 3,
      title: 'Marketing channels that worked for early-stage B2B',
      author: 'Michael Rodriguez',
      date: '5 days ago',
      replies: 12
    }
  ]);
  const { toast } = useToast();

  const handleCreatePost = () => {
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
      title: postContent.split('\n')[0] || "New discussion",
      author: "You",
      date: "Just now",
      replies: 0
    };

    setDiscussions([newPost, ...discussions]);
    setPostContent('');
    
    toast({
      title: "Success",
      description: "Your post has been published!",
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
            <Textarea 
              placeholder="Share your thoughts, ask questions, or start a discussion..." 
              className="mb-4 min-h-[120px]"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
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
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  {index < discussions.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumPage;
