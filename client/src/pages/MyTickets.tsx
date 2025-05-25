import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/hooks/useNavigate";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Download, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function MyTickets() {
  const [, navigate] = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch user tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/tickets"],
    enabled: !!user,
  });
  
  // Filter tickets based on search query
  const filteredTickets = tickets?.filter((ticket: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.event.title.toLowerCase().includes(query) ||
      ticket.event.location.toLowerCase().includes(query) ||
      ticket.event.category.toLowerCase().includes(query)
    );
  });
  
  // Split tickets into upcoming and past events
  const now = new Date();
  const upcomingTickets = filteredTickets?.filter((ticket: any) => 
    new Date(ticket.event.startDate) > now
  );
  const pastTickets = filteredTickets?.filter((ticket: any) => 
    new Date(ticket.event.startDate) <= now
  );
  
  // If not logged in, redirect to login
  if (!authLoading && !user) {
    navigate("/api/login");
    return null;
  }
  
  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Tickets</h1>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Loading State */}
          {(authLoading || ticketsLoading) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* No Tickets State */}
          {!ticketsLoading && tickets?.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tickets found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven't purchased any tickets yet
              </p>
              <Button onClick={() => navigate("/events")}>
                Browse Events
              </Button>
            </div>
          )}
          
          {/* Tickets Content */}
          {!ticketsLoading && tickets?.length > 0 && (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingTickets?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastTickets?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              {/* Upcoming Tickets */}
              <TabsContent value="upcoming">
                {upcomingTickets?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTickets.map((ticket: any) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        isPast={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming tickets</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {searchQuery ? "No tickets match your search" : "You don't have any upcoming events"}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => navigate("/events")}>
                        Browse Events
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {/* Past Tickets */}
              <TabsContent value="past">
                {pastTickets?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastTickets.map((ticket: any) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        isPast={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No past tickets</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? "No tickets match your search" : "You don't have any past events"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
}

interface TicketCardProps {
  ticket: any;
  isPast: boolean;
}

function TicketCard({ ticket, isPast }: TicketCardProps) {
  const [, navigate] = useNavigate();
  
  const event = ticket.event;
  const eventDate = new Date(event.startDate);
  
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="h-48 relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 m-4">
          <Badge className={isPast ? "bg-gray-500" : "bg-primary"}>
            {isPast ? "PAST" : "UPCOMING"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide">{event.category}</p>
          </div>
          <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2 text-center">
            <p className="text-xs text-primary-800 dark:text-primary-200 font-medium">
              {format(eventDate, 'MMM').toUpperCase()}
            </p>
            <p className="text-lg font-bold text-primary-800 dark:text-primary-200">
              {format(eventDate, 'd')}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            <span>{format(eventDate, 'h:mm a')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Details</div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Order #:</span>
            <span className="font-medium">{ticket.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Ticket Type:</span>
            <span className="font-medium">{ticket.type}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
            <span className="font-medium">{ticket.quantity}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button 
          size="sm"
          onClick={() => navigate(`/events/${event.id}`)}
          className="flex items-center"
        >
          View Event
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
