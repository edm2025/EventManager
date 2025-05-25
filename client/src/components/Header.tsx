import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./ui/theme-provider";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  MessageSquare, 
  Ticket, 
  Settings, 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon 
} from "lucide-react";

interface HeaderProps {
  user: User | null | undefined;
}

export function Header({ user }: HeaderProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { name: "Events", path: "/events", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "Social Wall", path: "/social-wall", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { name: "My Tickets", path: "/my-tickets", icon: <Ticket className="h-4 w-4 mr-2" /> },
  ];

  // Add Admin link if user is an admin
  if (user?.isAdmin) {
    navItems.push({ name: "Admin", path: "/admin", icon: <Settings className="h-4 w-4 mr-2" /> });
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Calendar className="text-primary h-6 w-6 mr-2" />
              <Link href="/">
                <span className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  EventHub
                </span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main Navigation">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`${
                      location === item.path
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300"
                    } border-b-2 px-1 pt-1 text-sm font-medium`}
                    aria-current={location === item.path ? "page" : undefined}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Dark mode toggle */}
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">
                <Sun className="h-4 w-4" />
              </span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  theme === "dark" ? "bg-primary" : "bg-gray-200"
                }`}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <span
                  className={`${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                <Moon className="h-4 w-4" />
              </span>
            </div>
            
            {/* Notifications */}
            <Button variant="default" size="icon" className="bg-primary text-white hover:bg-primary/90">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                    <AvatarFallback>{user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/api/logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <a href="/api/login">Login</a>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`${
                    location === item.path
                      ? "bg-primary-50 dark:bg-primary-900 border-primary text-primary dark:text-primary-200"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  aria-current={location === item.path ? "page" : undefined}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                    <AvatarFallback>{user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Your Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </a>
                <a
                  href="/api/logout"
                  className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
