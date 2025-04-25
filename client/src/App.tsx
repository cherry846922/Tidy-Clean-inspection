import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Calendar from "@/pages/Calendar";
import Inspections from "@/pages/Inspections";
import Properties from "@/pages/Properties";
import PricePage from "@/pages/PricePage";
import Checkout from "@/pages/Checkout";
import AuthPage from "@/pages/auth-page";
import Profile from "@/pages/profile";
import PricingManagement from "@/pages/admin/PricingManagement";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  const isAuthPage = location === '/auth';
  
  return (
    <Switch>
      <ProtectedRoute path="/" component={Calendar} />
      <ProtectedRoute path="/inspections" component={Inspections} />
      <ProtectedRoute path="/properties" component={Properties} />
      <ProtectedRoute path="/price/:id" component={PricePage} />
      <ProtectedRoute path="/checkout/:id" component={Checkout} />
      <ProtectedRoute path="/admin/pricing" component={PricingManagement} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Don't show sidebar/header on auth page
  const isAuthPage = location === '/auth';
  
  if (isAuthPage) {
    return (
      <main className="flex-1">
        <Router />
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {user && <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />}
      
      {/* Mobile Header - only if logged in */}
      {user && (
        <div className="md:hidden bg-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#FF5A5F] flex items-center">
            <i className="fas fa-broom mr-2"></i> CleanBnB
          </h1>
          <button 
            className="text-[#484848] p-2 rounded-full hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}
      
      <main className="flex-1">
        <Router />
      </main>
      
      {user && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
