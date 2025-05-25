import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@/hooks/useNavigate";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit2, BarChart3, Users, Ticket, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  startDate: z.date(),
  endDate: z.date(),
  imageUrl: z.string().url("Please enter a valid image URL"),
  minPrice: z.coerce.number().min(0, "Price cannot be negative"),
  maxPrice: z.coerce.number().min(0, "Price cannot be negative"),
  ticketsTotal: z.coerce.number().int().positive("Total tickets must be positive"),
  ticketUrl: z.string().url("Please enter a valid ticket URL"),
  featured: z.boolean().default(false),
  ageRestriction: z.string().optional(),
  performers: z.string().optional(),
  tags: z.string().optional(),
});

export default function Admin() {
  const [, navigate] = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  
  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events/admin"],
    enabled: !!user && user.isAdmin,
  });
  
  // Fetch ticket locations
  const { data: ticketLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/ticket-locations"],
    enabled: !!user && user.isAdmin,
  });
  
  // Form for adding/editing events
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      imageUrl: "",
      minPrice: 0,
      maxPrice: 0,
      ticketsTotal: 100,
      ticketUrl: "",
      featured: false,
      ageRestriction: "",
      performers: "",
      tags: "",
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema>) => {
      const response = await apiRequest("POST", "/api/events", {
        ...data,
        performers: data.performers ? data.performers.split(',').map(p => p.trim()) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events/admin"] });
      setIsAddEventOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema> & { id: number }) => {
      const { id, ...eventData } = data;
      const response = await apiRequest("PATCH", `/api/events/${id}`, {
        ...eventData,
        performers: eventData.performers ? eventData.performers.split(',').map(p => p.trim()) : [],
        tags: eventData.tags ? eventData.tags.split(',').map(t => t.trim()) : [],
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events/admin"] });
      setIsEditEventOpen(false);
      setCurrentEvent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/events/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events/admin"] });
      setIsDeleteEventOpen(false);
      setCurrentEvent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Add ticket location mutation
  const addLocationMutation = useMutation({
    mutationFn: async (data: { name: string; address: string }) => {
      const response = await apiRequest("POST", "/api/ticket-locations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location added",
        description: "The ticket location has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ticket-locations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add location: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission for adding events
  const onAddEventSubmit = (data: z.infer<typeof eventFormSchema>) => {
    createEventMutation.mutate(data);
  };
  
  // Handle form submission for editing events
  const onEditEventSubmit = (data: z.infer<typeof eventFormSchema>) => {
    if (currentEvent) {
      updateEventMutation.mutate({ ...data, id: currentEvent.id });
    }
  };
  
  // Handle edit button click
  const handleEditEvent = (event: any) => {
    setCurrentEvent(event);
    
    // Set form values
    form.reset({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      imageUrl: event.imageUrl,
      minPrice: event.minPrice,
      maxPrice: event.maxPrice,
      ticketsTotal: event.ticketsTotal,
      ticketUrl: event.ticketUrl,
      featured: event.featured,
      ageRestriction: event.ageRestriction || "",
      performers: event.performers ? event.performers.join(', ') : "",
      tags: event.tags ? event.tags.join(', ') : "",
    });
    
    setIsEditEventOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteEvent = (event: any) => {
    setCurrentEvent(event);
    setIsDeleteEventOpen(true);
  };
  
  // Redirect non-admin users
  if (!authLoading && user && !user.isAdmin) {
    navigate("/");
    return null;
  }
  
  // Show loading state
  if (authLoading || eventsLoading) {
    return (
      <Layout>
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate("/api/login");
    return null;
  }
  
  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage events, ticket sales, and more</p>
            </div>
            <Button onClick={() => {
              form.reset();
              setIsAddEventOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
          
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {events?.length || 0}
                    </h3>
                  </div>
                  <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tickets Sold</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {events?.reduce((total, event) => total + event.ticketsSold, 0) || 0}
                    </h3>
                  </div>
                  <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                    <Ticket className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Locations</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {ticketLocations?.length || 0}
                    </h3>
                  </div>
                  <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ${events?.reduce((total, event) => {
                        const avgPrice = (event.minPrice + event.maxPrice) / 2;
                        return total + (avgPrice * event.ticketsSold);
                      }, 0)?.toFixed(2) || 0}
                    </h3>
                  </div>
                  <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Admin Tabs */}
          <Tabs defaultValue="events" className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <TabsList className="bg-gray-100 dark:bg-gray-900 p-0 rounded-t-lg border-b border-gray-200 dark:border-gray-700 w-full justify-start">
              <TabsTrigger value="events" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="tickets" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                <Ticket className="h-4 w-4 mr-2" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="analytics" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                <Users className="h-4 w-4 mr-2" />
                Ticket Locations
              </TabsTrigger>
            </TabsList>
            
            {/* Events Tab */}
            <TabsContent value="events" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Events</h3>
              </div>
              
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Event</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tickets Sold</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <tr key={event.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img src={event.imageUrl} alt={event.title} className="h-10 w-10 rounded-md object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-gray-500 dark:text-gray-400">{event.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(event.startDate), 'MMM d, yyyy')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {event.ticketsSold} / {event.ticketsTotal}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <Badge className={cn(
                              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                              new Date(event.endDate) < new Date() && "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            )}>
                              {new Date(event.endDate) < new Date() ? "Ended" : "Active"}
                            </Badge>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex space-x-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleDeleteEvent(event)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          No events found. Create your first event!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            {/* Tickets Tab */}
            <TabsContent value="tickets" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket Sales Dashboard</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events && events.length > 0 ? (
                        events.map((event) => (
                          <div key={event.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 mr-3">
                                <img src={event.imageUrl} alt={event.title} className="h-8 w-8 rounded-md object-cover" />
                              </div>
                              <span className="font-medium text-sm truncate max-w-[150px]">{event.title}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 dark:text-white font-medium">{event.ticketsSold} tickets</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">${((event.minPrice + event.maxPrice) / 2 * event.ticketsSold).toFixed(2)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-6">No sales data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Ticket Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Detailed purchase data will appear here</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Connect your payment processor to view this data</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Analytics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Event Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Category distribution chart will appear here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Ticket Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Monthly sales chart will appear here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Event Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Event</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Views</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Ticket Sales</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Conversion Rate</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {events && events.length > 0 ? (
                            events.map((event) => {
                              const views = Math.floor(Math.random() * 1000) + 100; // Simulated data
                              const conversionRate = ((event.ticketsSold / views) * 100).toFixed(1);
                              const revenue = ((event.minPrice + event.maxPrice) / 2 * event.ticketsSold).toFixed(2);
                              
                              return (
                                <tr key={event.id}>
                                  <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">{event.title}</td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{views}</td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{event.ticketsSold}</td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{conversionRate}%</td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">${revenue}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">
                                No analytics data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Ticket Locations Tab */}
            <TabsContent value="settings" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket Sales Locations</h3>
                <Button onClick={() => {
                  const name = prompt("Enter location name:");
                  const address = prompt("Enter location address:");
                  
                  if (name && address) {
                    addLocationMutation.mutate({ name, address });
                  }
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locationsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : ticketLocations && ticketLocations.length > 0 ? (
                  ticketLocations.map((location) => (
                    <Card key={location.id}>
                      <CardContent className="p-6">
                        <h4 className="font-medium text-lg mb-2">{location.name}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{location.address}</p>
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${location.name}?`)) {
                                // Implement delete functionality
                                toast({
                                  title: "Location deleted",
                                  description: "The ticket location has been removed successfully.",
                                });
                                queryClient.invalidateQueries({ queryKey: ["/api/ticket-locations"] });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-3 text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No ticket locations have been added yet</p>
                    <Button onClick={() => {
                      const name = prompt("Enter location name:");
                      const address = prompt("Enter location address:");
                      
                      if (name && address) {
                        addLocationMutation.mutate({ name, address });
                      }
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Location
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event to publish on the platform.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddEventSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Beats Festival 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Central Park Amphitheater" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the event image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="ticketsTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Tickets</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ticketUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/tickets" {...field} />
                      </FormControl>
                      <FormDescription>
                        Link to where tickets can be purchased
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ageRestriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Restriction</FormLabel>
                      <FormControl>
                        <Input placeholder="18+ only" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional - leave blank if none
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="performers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performers</FormLabel>
                      <FormControl>
                        <Input placeholder="Artist 1, Artist 2, Band Name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of performers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="music, live, summer, outdoor" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Featured Event
                        </FormLabel>
                        <FormDescription>
                          This event will be showcased in the featured section
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddEventOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update details for this event.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditEventSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Beats Festival 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Remaining form fields are identical to Add Event dialog */}
                {/* ... */}
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Central Park Amphitheater" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the event image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="ticketsTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Tickets</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ticketUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/tickets" {...field} />
                      </FormControl>
                      <FormDescription>
                        Link to where tickets can be purchased
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ageRestriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Restriction</FormLabel>
                      <FormControl>
                        <Input placeholder="18+ only" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional - leave blank if none
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="performers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performers</FormLabel>
                      <FormControl>
                        <Input placeholder="Artist 1, Artist 2, Band Name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of performers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="music, live, summer, outdoor" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Featured Event
                        </FormLabel>
                        <FormDescription>
                          This event will be showcased in the featured section
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditEventOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateEventMutation.isPending}
                >
                  {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Event Dialog */}
      <Dialog open={isDeleteEventOpen} onOpenChange={setIsDeleteEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentEvent && (
            <div className="flex items-center py-4">
              <div className="h-12 w-12 flex-shrink-0">
                <img src={currentEvent.imageUrl} alt={currentEvent.title} className="h-12 w-12 rounded-md object-cover" />
              </div>
              <div className="ml-4">
                <p className="font-medium">{currentEvent.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(currentEvent.startDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteEventOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteEventMutation.isPending}
              onClick={() => currentEvent && deleteEventMutation.mutate(currentEvent.id)}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
