import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar, Filter, Search } from "lucide-react";

export default function Events() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  // Search filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [eventLocation, setEventLocation] = useState(searchParams.get("location") || "");
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("maxPrice") || "100"),
  ]);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Build query params for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (category && category !== "all") params.append("category", category);
    if (date && date !== "any") params.append("date", date);
    if (eventLocation) params.append("location", eventLocation);
    if (priceRange[0] !== 100) params.append("maxPrice", priceRange[0].toString());
    params.append("page", page.toString());
    return params.toString();
  };

  // Fetch events
  const { data, isLoading } = useQuery({
    queryKey: [`/api/events?${buildQueryParams()}`],
  });

  const events = data?.events || [];
  const totalEvents = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const eventsPerPage = data?.perPage || 12;

  const handleSearch = () => {
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Events</h1>
        
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search" className="mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category" className="mb-2">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date" className="mb-2">Date</Label>
              <Select value={date} onValueChange={setDate}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Any Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="weekend">This Weekend</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search-button" className="mb-2">&nbsp;</Label>
              <Button 
                id="search-button"
                className="w-full" 
                onClick={handleSearch}
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <Label htmlFor="location" className="mb-2">Location</Label>
              <Input
                id="location"
                placeholder="City or venue"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>
            
            <div className="lg:col-span-2">
              <Label htmlFor="price-range" className="mb-2">
                Price Range: Up to ${priceRange[0]}
              </Label>
              <Slider
                id="price-range"
                min={0}
                max={500}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
              />
            </div>
            
            <div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setCategory("");
                  setDate("");
                  setEventLocation("");
                  setPriceRange([100]);
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            {isLoading ? (
              <span>Loading events...</span>
            ) : (
              <span>
                {totalEvents === 0
                  ? "No events found"
                  : `Showing ${(page - 1) * eventsPerPage + 1} to ${
                      Math.min(page * eventsPerPage, totalEvents)
                    } of ${totalEvents} events`}
              </span>
            )}
          </p>
          <Button 
            variant="secondary" 
            size="sm"
            className="text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-100 dark:hover:bg-primary-800"
          >
            <Calendar className="mr-1.5 h-4 w-4" />
            View Calendar
          </Button>
        </div>
        
        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[350px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : events.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search filters</p>
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
    </div>
  );
}
