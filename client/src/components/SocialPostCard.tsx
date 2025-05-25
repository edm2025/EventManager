import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share } from "lucide-react";
import { SocialPost } from "@shared/schema";
import { getTimeAgo } from "@/lib/utils";

interface SocialPostCardProps {
  post: SocialPost;
}

export function SocialPostCard({ post }: SocialPostCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-700 overflow-hidden shadow-md">
      <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-600 flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={post.user.profileImageUrl || ""} alt={post.user.firstName || "User"} />
          <AvatarFallback>{post.user.firstName?.charAt(0) || post.user.email?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {post.user.firstName} {post.user.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(post.createdAt)}</p>
        </div>
      </CardHeader>
      
      {post.imageUrl && (
        <div className="w-full h-60">
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
      </CardContent>
      
      <CardFooter className="flex space-x-4 text-gray-500 dark:text-gray-400 p-4">
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <Heart className="h-4 w-4" />
          <span>{post.likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <MessageSquare className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <Share className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
