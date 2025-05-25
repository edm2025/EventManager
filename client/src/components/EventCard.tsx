import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Event } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.startDate);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();
  
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 h-full">
      <div className="h-48 w-full relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        {event.featured && (
          <div className="absolute top-0 right-0 m-4">
            <Badge className="bg-accent-500 hover:bg-accent-500">FEATURED</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide">
              {event.category}
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {event.title}
            </h3>
          </div>
          <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2 text-center">
            <p className="text-xs text-primary-800 dark:text-primary-200 font-medium">{month}</p>
            <p className="text-lg font-bold text-primary-800 dark:text-primary-200">{day}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
          <span>{event.location}</span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
          <span>{new Date(event.startDate).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })} - {new Date(event.endDate).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}</span>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-primary-600 dark:text-primary-400 font-medium">
            {event.minPrice === event.maxPrice 
              ? formatCurrency(event.minPrice) 
              : `${formatCurrency(event.minPrice)} - ${formatCurrency(event.maxPrice)}`}
          </span>
          <Button asChild>
            <Link href={`/events/${event.id}`}>
              <a>Get Tickets</a>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
