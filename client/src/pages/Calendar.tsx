import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";
import DayDetail from "@/components/DayDetail";
import FilterBar, { FilterValues } from "@/components/FilterBar";
import NewInspectionModal from "@/components/NewInspectionModal";
import RecentlyCompleted from "@/components/RecentlyCompleted";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
  
  // Parse URL parameters
  const getInitialPropertyId = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const propertyId = params.get("propertyId");
      return propertyId || "all";
    }
    return "all";
  };
  
  const [filters, setFilters] = useState<FilterValues>({
    propertyId: getInitialPropertyId(),
    dateRange: "this-month",
    status: "all"
  });
  
  // Update URL when filters change
  useEffect(() => {
    const url = new URL(window.location.href);
    
    if (filters.propertyId !== "all") {
      url.searchParams.set("propertyId", filters.propertyId);
    } else {
      url.searchParams.delete("propertyId");
    }
    
    window.history.replaceState({}, "", url.toString());
  }, [filters.propertyId]);
  
  const handleDateChange = (date: Date) => {
    console.log("Date changed in Calendar page:", date.toISOString());
    setSelectedDate(new Date(date.getTime()));
  };
  
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#484848]">Calendar</h1>
            <p className="text-[#767676] mt-1">Schedule and manage your cleaning inspections</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => setIsNewInspectionModalOpen(true)}
              className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Inspection
            </Button>
          </div>
        </div>
        
        {/* Filter Bar */}
        <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <CalendarView 
              selectedDate={selectedDate} 
              onDateChange={handleDateChange} 
              propertyFilter={filters.propertyId}
            />
          </div>
          
          <DayDetail 
            selectedDate={selectedDate} 
            onInspectionAction={() => {
              // Open the new inspection modal when requested from DayDetail
              setIsNewInspectionModalOpen(true);
            }} 
          />
        </div>
        
        {/* Recently Completed Section */}
        <RecentlyCompleted />
        
        {/* New Inspection Modal */}
        <NewInspectionModal 
          isOpen={isNewInspectionModalOpen} 
          onClose={() => setIsNewInspectionModalOpen(false)} 
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
