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
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Reports from "@/pages/Reports";
import PricingManagement from "@/pages/admin/PricingManagement";
import PropertyOptimization from "@/pages/PropertyOptimization";
import AnimationDemo from "@/pages/AnimationDemo";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { AnimationProvider } from "@/contexts/animation-context";
import { PageWrapper } from "@/components/animation/PageWrapper";

function Router() {
  const [location] = useLocation();
  const isAuthPage = location === '/auth';
  
  // Create wrapped versions of components with page transitions
  const renderWithAnimation = (Component: React.ComponentType) => {
    const WrappedComponent = () => {
      return (
        <PageWrapper>
          <Component />
        </PageWrapper>
      );
    };
    return WrappedComponent;
  };
  
  return (
    <Switch>
      <ProtectedRoute path="/" component={renderWithAnimation(Calendar)} />
      <ProtectedRoute path="/calendar" component={renderWithAnimation(Calendar)} />
      <ProtectedRoute path="/dashboard" component={renderWithAnimation(Dashboard)} />
      <ProtectedRoute path="/inspections" component={renderWithAnimation(Inspections)} />
      <Route path="/properties">
        {() => <Redirect to="/inspections" />}
      </Route>
      <ProtectedRoute path="/price/:id" component={renderWithAnimation(PricePage)} />
      <ProtectedRoute path="/checkout/:id" component={renderWithAnimation(Checkout)} />
      <ProtectedRoute path="/products" component={renderWithAnimation(Products)} />
      <ProtectedRoute path="/reports" component={renderWithAnimation(Reports)} />
      <ProtectedRoute path="/optimization" component={renderWithAnimation(PropertyOptimization)} />
      <ProtectedRoute path="/admin/pricing" component={renderWithAnimation(PricingManagement)} />
      <ProtectedRoute path="/profile" component={renderWithAnimation(Profile)} />
      <ProtectedRoute path="/animation-demo" component={renderWithAnimation(AnimationDemo)} />
      <Route path="/auth" component={renderWithAnimation(AuthPage)} />
      <Route component={renderWithAnimation(NotFound)} />
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
          <h1 className="text-xl font-bold gradient-text-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Tidy Clean
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
        <AnimationProvider>
          <AppContent />
          <Toaster />
        </AnimationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
