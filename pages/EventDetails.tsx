import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useNavigate } from "@/hooks/useNavigate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, MapPin, Users, Ticket, ArrowLeft, Share2, Heart, ExternalLink } from "lucide-react";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { SocialPostModal } from "@/components/SocialPostModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function EventDetails() {
  const { id } = useParams();
  const [, navigate] = useNavigate();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${id}`],
  });

  // Fetch event related posts
  const { data: relatedPosts } = useQuery({
    queryKey: [`/api/social-posts/event/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-[400px] bg-gray-300 dark:bg-gray-700 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            </div>
            <div>
              <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  const ticketsSoldPercentage = Math.round((event.ticketsSold / event.ticketsTotal) * 100);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Image */}
      <div className="relative h-[400px]">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 hover:text-white"
              onClick={() => navigate("/events")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
            {event.featured && (
              <Badge className="mb-4 bg-accent-500 hover:bg-accent-500">FEATURED</Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center text-white/80 gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{event.ticketsSold} attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="organizer">Organizer</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>About This Event</h2>
                  <p>{event.description}</p>
                  
                  <h3>Event Schedule</h3>
                  <ul>
                    <li><strong>Doors Open:</strong> {formatTime(new Date(event.startDate).setHours(new Date(event.startDate).getHours() - 1))}</li>
                    <li><strong>Event Start:</strong> {formatTime(event.startDate)}</li>
                    <li><strong>Event End:</strong> {formatTime(event.endDate)}</li>
                  </ul>
                  
                  {event.performers && (
                    <>
                      <h3>Performers</h3>
                      <ul>
                        {event.performers.map((performer: string, index: number) => (
                          <li key={index}>{performer}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <h3>Additional Information</h3>
                  <ul>
                    <li><strong>Age Restrictions:</strong> {event.ageRestriction || "None"}</li>
                    <li><strong>Accessibility:</strong> {event.accessibility || "Contact venue for details"}</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="venue">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>{event.venueDetails?.name || event.location}</h2>
                  <p>{event.venueDetails?.address || "Address information not available"}</p>
                  
                  {event.venueDetails?.description && (
                    <>
                      <h3>About the Venue</h3>
                      <p>{event.venueDetails.description}</p>
                    </>
                  )}
                  
                  <h3>Facilities</h3>
                  <ul>
                    {event.venueDetails?.facilities ? 
                      event.venueDetails.facilities.map((facility: string, index: number) => (
                        <li key={index}>{facility}</li>
                      )) : 
                      <li>Information not available</li>
                    }
                  </ul>
                  
                  <div className="mt-6">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">How to get there</h3>
                      <p>{event.venueDetails?.directions || "Please contact the venue for directions."}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="organizer">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={event.organizer?.profileImageUrl} alt={event.organizer?.name} />
                      <AvatarFallback>{event.organizer?.name?.charAt(0) || "O"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold m-0">{event.organizer?.name || "Event Organizer"}</h2>
                      <p className="text-gray-500 dark:text-gray-400 m-0">Event Organizer</p>
                    </div>
                  </div>
                  
                  <p>{event.organizer?.description || "No organizer information available."}</p>
                  
                  <h3>Contact Information</h3>
                  <ul>
                    <li><strong>Email:</strong> {event.organizer?.email || "Not provided"}</li>
                    <li><strong>Phone:</strong> {event.organizer?.phone || "Not provided"}</li>
                    <li><strong>Website:</strong> {event.organizer?.website ? (
                      <a href={event.organizer.website} target="_blank" rel="noopener noreferrer">
                        {event.organizer.website}
                      </a>
                    ) : "Not provided"}</li>
                  </ul>
                  
                  <h3>Other Events by this Organizer</h3>
                  {event.organizerEvents && event.organizerEvents.length > 0 ? (
                    <ul>
                      {event.organizerEvents.map((evt: any) => (
                        <li key={evt.id}>
                          <a href={`/events/${evt.id}`}>{evt.title}</a> - {formatDate(evt.startDate)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No other events found.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="discussion">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Event Discussion</h2>
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
                      Share Your Experience
                    </Button>
                  </div>
                  
                  {relatedPosts && relatedPosts.length > 0 ? (
                    <div className="space-y-6">
                      {relatedPosts.map((post: any) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-4">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={post.user.profileImageUrl} alt={post.user.firstName} />
                                <AvatarFallback>{post.user.firstName?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{post.user.firstName} {post.user.lastName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</div>
                              </div>
                            </div>
                            
                            {post.imageUrl && (
                              <div className="mb-4">
                                <img 
                                  src={post.imageUrl} 
                                  alt="Post image" 
                                  className="rounded-md w-full max-h-80 object-cover"
                                />
                              </div>
                            )}
                            
                            <p className="text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>
                            
                            <div className="flex space-x-4 text-gray-500 dark:text-gray-400">
                              <Button variant="ghost" size="sm" className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                <span>{post.likes}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center">
                                <Share2 className="h-4 w-4 mr-1" />
                                <span>Share</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No discussions yet for this event.</p>
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
                        Be the first to share
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Ticket Information</h3>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                    {event.minPrice === event.maxPrice 
                      ? formatCurrency(event.minPrice) 
                      : `${formatCurrency(event.minPrice)} - ${formatCurrency(event.maxPrice)}`}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tickets Remaining</span>
                      <span>{event.ticketsTotal - event.ticketsSold} / {event.ticketsTotal}</span>
                    </div>
                    <Progress value={ticketsSoldPercentage} className="h-2" />
                  </div>
                  
                  <Button className="w-full mb-4" asChild>
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                      <Ticket className="mr-2 h-4 w-4" />
                      Get Tickets
                    </a>
                  </Button>
                  
                  {event.ticketVendors && event.ticketVendors.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <h4 className="font-medium mb-2">Also available at:</h4>
                      <ul className="space-y-2">
                        {event.ticketVendors.map((vendor: any, index: number) => (
                          <li key={index}>
                            <a 
                              href={vendor.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {vendor.name}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-bold mb-4">Share this event</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <SocialPostModal open={postModalOpen} onOpenChange={setPostModalOpen} />
    </div>
  );
}
