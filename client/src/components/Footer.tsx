import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="text-primary-400 h-6 w-6 mr-2" />
              <span className="text-xl font-bold">EventHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your all-in-one event management platform. Discover, book, and create memorable experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">For Attendees</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/events" className="text-gray-400 hover:text-white text-sm">Browse Events</a></li>
              <li><a href="/my-tickets" className="text-gray-400 hover:text-white text-sm">Ticket Purchases</a></li>
              <li><a href="/social-wall" className="text-gray-400 hover:text-white text-sm">Social Wall</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">My Account</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">For Organizers</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/admin" className="text-gray-400 hover:text-white text-sm">Create Events</a></li>
              <li><a href="/admin" className="text-gray-400 hover:text-white text-sm">Ticket Management</a></li>
              <li><a href="/admin" className="text-gray-400 hover:text-white text-sm">Analytics</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Promotion Tools</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Help & Support</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} EventHub. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <p className="text-gray-400 text-sm mr-4">Stay up to date with our newsletter</p>
            <div className="relative rounded-md shadow-sm flex">
              <Input 
                type="email" 
                className="focus:ring-primary focus:border-primary block w-full pr-12 sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white" 
                placeholder="Your email" 
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute inset-y-0 right-0 px-3 flex items-center text-primary-400 hover:text-primary-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
