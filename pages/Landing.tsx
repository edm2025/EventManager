import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/SearchModal";
import { useState } from "react";
import { Calendar, Search } from "lucide-react";

export default function Landing() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
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
              Sign in to find and book tickets for the hottest concerts, festivals, and performances in your area.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="/api/login">
                  <Calendar className="mr-2 h-5 w-5" />
                  Sign In
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto bg-white text-primary-700 hover:bg-gray-50"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Events
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              How EventHub Works
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              Your all-in-one platform for discovering and managing events
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                      <Search className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Discover Events</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Browse through our curated list of concerts, festivals, workshops, and more. Filter by date, location, or category.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                      <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Book Tickets</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Secure your spot at any event with our easy booking system. Get instant confirmation and digital tickets.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Share Experiences</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Connect with other attendees on our social wall. Share photos, memories, and make new friends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start?</span>
            <span className="block text-primary-300">Join EventHub today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button asChild size="lg" className="bg-white text-primary-700 hover:bg-gray-50">
                <a href="/api/login">
                  Get Started
                </a>
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-primary-600">
                <a href="/events">
                  Browse Events
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
