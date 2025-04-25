import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Calendar from "@/pages/Calendar";
import Inspections from "@/pages/Inspections";
import Properties from "@/pages/Properties";
import PricePage from "@/pages/PricePage";
import Checkout from "@/pages/Checkout";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calendar} />
      <Route path="/inspections" component={Inspections} />
      <Route path="/properties" component={Properties} />
      <Route path="/price/:id" component={PricePage} />
      <Route path="/checkout/:id" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        {/* Mobile Header */}
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
        
        <main className="flex-1">
          <Router />
        </main>
        
        <MobileNav />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
