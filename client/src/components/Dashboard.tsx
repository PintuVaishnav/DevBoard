import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Code,
  BarChart3,
  Settings,
  Heart,
  DollarSign,
  Key,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
} from "lucide-react";
import {
  SiAmazon,
  SiGooglecloud,
  SiDocker,
  SiGithubactions,
  SiGithub,
  SiKubernetes,
  SiHelm,
} from "react-icons/si";
import { cn } from "@/lib/utils";

interface DashboardProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Overview", href: "/overview", icon: BarChart3 },
  { name: "CI/CD Pipelines", href: "/pipelines", icon: SiGithubactions },
  { name: "GCP", href: "/gcp", icon: SiGooglecloud },
  { name: "AWS", href: "/aws", icon: SiAmazon },
  { name: "App Health", href: "/health", icon: Heart },
  { name: "Infrastructure Costs", href: "/costs", icon: DollarSign },
  { name: "API Tokens", href: "/tokens", icon: Key },
  { name: "GitHub Repos", href: "/githubrepo", icon: SiGithub },
  { name: "Docker Hub", href: "/dockerhub", icon: SiDocker },
  { name: "HELM", href: "/helm", icon: SiHelm },
  { name: "Kubernetes", href: "/kubernetes", icon: SiKubernetes },
];

export default function Dashboard({ children }: DashboardProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [location, setLocation] = useLocation();
  const logoutRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dummy notification for test (remove in prod)
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => ["✅ Slack integration test 🔔", ...prev]);
      setHasUnread(true); // mark unread
    }, 3000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        logoutRef.current &&
        !logoutRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
            <SidebarContent user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:dark:bg-gray-800 lg:shadow-lg">
        <SidebarContent user={user} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                DevBoard
              </h1>
            </div>
            <div className="relative flex items-center space-x-4" ref={logoutRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>

              {/* 🔔 Notifications */}
              <div className="relative" ref={notifRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNotifications((prev) => !prev);
                    setHasUnread(false); // clear red dot when opened
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <Bell className="h-5 w-5" />
                  {hasUnread && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((note, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700"
                        >
                          {note}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* ⚙️ Settings */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => setShowLogout(!showLogout)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                {showLogout && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        localStorage.clear();
                        setLocation("/login");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  user: any;
  onClose?: () => void;
}

function SidebarContent({ user, onClose }: SidebarContentProps) {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Code className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">DevBoard</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-5 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <button
              key={item.name}
              onClick={() => {
                setLocation(item.href);
                if (onClose) onClose();
              }}
              className={cn(
                "nav-item w-full flex items-center px-3 py-2 rounded text-sm font-medium",
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role || "Developer"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
