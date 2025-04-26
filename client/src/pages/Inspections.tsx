import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import InspectionCard from "@/components/InspectionCard";
import NewInspectionModal from "@/components/NewInspectionModal";
import FilterBar, { FilterValues } from "@/components/FilterBar";

export default function Inspections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filters, setFilters] = useState<FilterValues>({
    propertyId: "all",
    dateRange: "all",
    status: "all",
  });
  
  // Check if user is an inspector or host
  const isInspector = user?.role === "inspector";
  const isHost = user?.role === "host";
  
  // Query inspections based on filters and active tab
  const inspectionStatus = activeTab !== "all" ? activeTab : undefined;
  
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections', { 
      status: inspectionStatus,
      propertyId: filters.propertyId !== "all" ? filters.propertyId : undefined,
      dateRange: filters.dateRange !== "all" ? filters.dateRange : undefined
    }],
    enabled: !!user,
  });
  
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // If user is a host, don't render the page at all
  if (isHost) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2D3748] mb-2">Host View</h1>
          <p className="text-[#767676]">Hosts don't have access to the Inspections page.</p>
          <p className="text-[#767676] mt-2">Please go to the Dashboard or Calendar view.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#2D3748]">Inspections</h1>
            <p className="text-[#767676] mt-1">View and manage all your cleaning inspections</p>
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
        <FilterBar onFilterChange={handleFilterChange} />
        
        {/* Inspector View - Only show if user is an inspector */}
        {isInspector && (
          <>
            {/* Inspection Status Tabs */}
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            
              <TabsContent value="upcoming" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                  </div>
                ) : inspections && inspections.length > 0 ? (
                  inspections.map(inspection => (
                    <InspectionCard key={inspection.id} inspection={inspection} />
                  ))
                ) : (
                  <div className="text-center py-12 text-[#767676]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No upcoming inspections found.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsNewInspectionModalOpen(true)}
                    >
                      Schedule an Inspection
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                  </div>
                ) : inspections && inspections.length > 0 ? (
                  inspections.map(inspection => (
                    <InspectionCard key={inspection.id} inspection={inspection} />
                  ))
                ) : (
                  <div className="text-center py-12 text-[#767676]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No completed inspections found.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cancelled" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                  </div>
                ) : inspections && inspections.length > 0 ? (
                  inspections.map(inspection => (
                    <InspectionCard key={inspection.id} inspection={inspection} />
                  ))
                ) : (
                  <div className="text-center py-12 text-[#767676]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No cancelled inspections found.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                  </div>
                ) : inspections && inspections.length > 0 ? (
                  inspections.map(inspection => (
                    <InspectionCard key={inspection.id} inspection={inspection} />
                  ))
                ) : (
                  <div className="text-center py-12 text-[#767676]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No inspections found.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsNewInspectionModalOpen(true)}
                    >
                      Schedule an Inspection
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* New Inspection Modal */}
            <NewInspectionModal 
              isOpen={isNewInspectionModalOpen} 
              onClose={() => setIsNewInspectionModalOpen(false)} 
            />
          </>
        )}
      </div>
    </div>
  );
}