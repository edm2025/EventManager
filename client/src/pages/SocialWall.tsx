import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SocialPostCard } from "@/components/SocialPostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialPostModal } from "@/components/SocialPostModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PlusCircle, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/hooks/useNavigate";

export default function SocialWall() {
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  // Build query params for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (eventFilter) params.append("eventId", eventFilter);
    params.append("sort", sortBy);
    params.append("page", page.toString());
    return params.toString();
  };

  // Fetch social posts
  const { data, isLoading } = useQuery({
    queryKey: [`/api/social-posts?${buildQueryParams()}`],
  });

  // Fetch events for filter dropdown
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const posts = data?.posts || [];
  const totalPosts = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearch = () => {
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Wall</h1>
            <p className="text-gray-500 dark:text-gray-400">Share and discover event experiences</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => {
                if (user) {
                  setPostModalOpen(true);
                } else {
                  toast({
                    title: "Authentication required",
                    description: "Please sign in to share your memories",
                    variant: "default",
                  });
                  navigate("/api/login");
                }
              }}
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Share Memory
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  {events?.map((event: any) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-3">
              <Select value={sortBy} onValueChange={setSortBy} className="flex-1">
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="comments">Most Comments</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleSearch}>
                <Filter className="mr-1.5 h-4 w-4" />
                Apply
              </Button>
            </div>
          </div>
        </div>
        
        {/* Social Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[350px] rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : posts.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <SocialPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No posts found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || eventFilter
                ? "Try adjusting your search filters"
                : "Be the first to share your experience"}
            </p>
            {!searchQuery && !eventFilter && (
              <Button 
                onClick={() => {
                  if (user) {
                    setPostModalOpen(true);
                  } else {
                    toast({
                      title: "Authentication required",
                      description: "Please sign in to share your memories",
                      variant: "default",
                    });
                    navigate("/api/login");
                  }
                }}
              >
                Create First Post
              </Button>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => 
                    p === 1 || 
                    p === totalPages || 
                    (p >= page - 1 && p <= page + 1)
                  )
                  .map((p, i, arr) => {
                    // Add ellipsis
                    if (i > 0 && arr[i - 1] !== p - 1) {
                      return (
                        <PaginationItem key={`ellipsis-${p}`}>
                          <div className="flex h-9 w-9 items-center justify-center">
                            <span>...</span>
                          </div>
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      
      <SocialPostModal open={postModalOpen} onOpenChange={setPostModalOpen} />
    </div>
  );
}
