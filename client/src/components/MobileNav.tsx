import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isInspector = user?.role === "inspector";
  const isHost = user?.role === "host";
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-10">
      <Link href="/dashboard" 
        className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-primary' : 'text-[#767676]'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs mt-1">Dashboard</span>
      </Link>
      <Link href="/" 
        className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-[#767676]'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs mt-1">Calendar</span>
      </Link>
      {/* Inspections tab - only for inspectors */}
      {isInspector && (
        <Link href="/inspections" 
          className={`flex flex-col items-center p-2 ${isActive('/inspections') ? 'text-primary' : 'text-[#767676]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs mt-1">Inspections</span>
        </Link>
      )}
      {/* Properties tab - only for hosts */}
      {isHost && (
        <Link href="/inspections" 
          className={`flex flex-col items-center p-2 ${isActive('/inspections') ? 'text-primary' : 'text-[#767676]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Properties</span>
        </Link>
      )}

      {/* Optimization link only for hosts */}
      {isHost && (
        <Link href="/optimization" 
          className={`flex flex-col items-center p-2 ${isActive('/optimization') ? 'text-primary' : 'text-[#767676]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs mt-1">Optimize</span>
        </Link>
      )}
      {/* Pricing link only for inspectors */}
      {isInspector && (
        <Link href="/admin/pricing" 
          className={`flex flex-col items-center p-2 ${isActive('/admin/pricing') ? 'text-primary' : 'text-[#767676]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1">Pricing</span>
        </Link>
      )}
      <Link href="/profile" 
        className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-primary' : 'text-[#767676]'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs mt-1">Account</span>
      </Link>
    </div>
  );
}
