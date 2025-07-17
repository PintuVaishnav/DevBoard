import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/Dashboard";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Pipelines from "@/pages/Pipelines";
import Health from "@/pages/Health";
import Features from "@/pages/Features";
import Releases from "@/pages/Releases";
import Costs from "@/pages/Costs";
import Tokens from "@/pages/Tokens";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function DashboardRouter() {
  const [currentPage, setCurrentPage] = useState('overview');
  
  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Home />;
      case 'pipelines':
        return <Pipelines />;
      case 'health':
        return <Health />;
      case 'features':
        return <Features />;
      case 'releases':
        return <Releases />;
      case 'costs':
        return <Costs />;
      case 'tokens':
        return <Tokens />;
      default:
        return <Home />;
    }
  };

  return (
    <Dashboard>
      {renderPage()}
    </Dashboard>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={DashboardRouter} />
          <Route path="/pipelines" component={DashboardRouter} />
          <Route path="/health" component={DashboardRouter} />
          <Route path="/features" component={DashboardRouter} />
          <Route path="/releases" component={DashboardRouter} />
          <Route path="/costs" component={DashboardRouter} />
          <Route path="/tokens" component={DashboardRouter} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
