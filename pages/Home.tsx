import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/hooks/useNavigate";
import { EventCard } from "@/components/EventCard";
import { SocialPostCard } from "@/components/SocialPostCard";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/SearchModal";
import { SocialPostModal } from "@/components/SocialPostModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  Calendar, 
  Filter, 
  PlusCircle, 
  ArrowDownCircle,
  BarChart,
  Ticket,
  ChartBar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [, navigate] = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch featured events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events/featured"],
  });

  // Fetch recent social posts
  const { data: socialPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/social-posts/recent"],
  });

  return (
    <>
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90 mix-blend-multiply"></div>
        <div 
          className="relative h-[400px] bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')" 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col h-full justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Discover Amazing Events
            </h1>
            <p className="mt-3 max-w-md text-lg text-white sm:text-xl md:mt-5">
              Find and book tickets for the hottest concerts, festivals, and performances in your area.
            </p>
            <div className="mt-6">
              <div className="rounded-md shadow">
                <Button 
                  onClick={() => setSearchOpen(true)} 
                  size="lg"
                  className="w-full md:w-auto bg-white text-primary-700 hover:bg-gray-50"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Events
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Events</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Don't miss out on these popular events</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-3">
                <Button 
                  onClick={() => navigate('/events')}
                  variant="secondary" 
                  className="text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-100 dark:hover:bg-primary-800"
                >
                  <Calendar className="mr-1.5 h-4 w-4" />
                  All Events
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSearchOpen(true)}
                >
                  <Filter className="mr-1.5 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
          
          {/* Event Cards Grid */}
          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[350px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : events?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No featured events found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Check back soon for upcoming events</p>
            </div>
          )}
          
          {/* Pagination */}
          {events?.length > 0 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
      
      {/* Social Wall Section */}
      <section className="py-12 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Wall</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Share your event experiences with others</p>
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
          
          {/* Social Post Grid */}
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[300px] rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          ) : socialPosts?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialPosts.map((post: any) => (
                <SocialPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No posts yet</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Be the first to share your experience</p>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/social-wall')}
            >
              Load More <ArrowDownCircle className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Admin Panel Preview (only show if user is admin) */}
      {user?.isAdmin && (
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Event Management Made Easy
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
                Comprehensive tools for event organizers and administrators
              </p>
            </div>
            
            <div className="mt-12 relative">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
                <div className="relative">
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-3xl">
                    Powerful Admin Dashboard
                  </h3>
                  <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
                    Manage events, track ticket sales, and analyze performance all in one place. Our intuitive admin panel gives you complete control over your events.
                  </p>
                  
                  <dl className="mt-10 space-y-10">
                    <div className="relative">
                      <dt>
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Event Management</p>
                      </dt>
                      <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                        Create, edit, and delete events with ease. Set up ticket tiers, pricing, and availability.
                      </dd>
                    </div>
                    
                    <div className="relative">
                      <dt>
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                          <Ticket className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Ticket Sales Tracking</p>
                      </dt>
                      <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                        Monitor ticket sales in real-time. View detailed reports on attendance and revenue.
                      </dd>
                    </div>
                    
                    <div className="relative">
                      <dt>
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                          <ChartBar className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Analytics</p>
                      </dt>
                      <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                        Gain insights into your audience demographics, popular events, and sales patterns.
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-8">
                    <Button onClick={() => navigate('/admin')}>
                      Go to Admin Dashboard
                    </Button>
                  </div>
                </div>
                
                <div className="mt-10 -mx-4 relative lg:mt-0">
                  <div className="relative rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gray-800 p-3 rounded-t-lg flex items-center space-x-1">
                      <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                      <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
                      <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                      <div className="ml-2 text-xs text-gray-400">Admin Dashboard</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-b-lg">
                      <div className="text-center">
                        <BarChart className="h-32 w-32 text-primary-600 mx-auto" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                          Event Performance Analytics
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                          Track sales, attendance, and engagement metrics
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Modals */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <SocialPostModal open={postModalOpen} onOpenChange={setPostModalOpen} />
    </>
  );
}
