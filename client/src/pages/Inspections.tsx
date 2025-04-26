import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterBar, { FilterValues } from "@/components/FilterBar";
import InspectionCard from "@/components/InspectionCard";
import NewInspectionModal from "@/components/NewInspectionModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Home } from "lucide-react";
import type { Inspection, Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Inspections() {
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    propertyId: "all",
    dateRange: "this-month",
    status: "all"
  });
  
  const [activeTab, setActiveTab] = useState("upcoming");
  const { user } = useAuth();
  const isInspector = user?.role === "inspector";
  const isHost = user?.role === "host";
  
  const { data: inspections, isLoading } = useQuery<Inspection[]>({
    queryKey: [
      '/api/inspections',
      {
        status: activeTab === "upcoming" ? "scheduled" : 
                activeTab === "completed" ? "completed" : 
                activeTab === "cancelled" ? "cancelled" : undefined,
        ...(filters.propertyId !== "all" ? { propertyId: filters.propertyId } : {})
      }
    ],
  });
  
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#484848]">Inspections</h1>
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
        
        {/* Main Tabs - Properties and Inspections (Host only gets both tabs) */}
        <Tabs defaultValue="inspections" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            {/* Properties tab only visible to hosts */}
            {isHost && (
              <TabsTrigger value="properties">Properties</TabsTrigger>
            )}
          </TabsList>
          
          {/* Inspections Tab Content */}
          <TabsContent value="inspections">
            {/* Inspection Status Tabs */}
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
          </TabsContent>
          
          {/* Properties Tab Content - Only visible to hosts */}
          {isHost && (
            <TabsContent value="properties">
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Property Cards will be dynamically loaded here */}
                  <PropertyList />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* New Inspection Modal */}
        <NewInspectionModal 
          isOpen={isNewInspectionModalOpen} 
          onClose={() => setIsNewInspectionModalOpen(false)} 
        />
      </div>
    </div>
  );
}

// Property List Component for the Properties Tab
function PropertyList() {
  interface Property {
    id: number;
    name: string;
    address: string;
    healthScore?: number;
    lastInspection?: string;
  }

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  if (isLoading) {
    return (
      <>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-[#767676]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p>No properties found.</p>
        <Button variant="outline" className="mt-4">
          Add Property
        </Button>
      </div>
    );
  }

  return (
    <>
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-[#00A6A6] to-[#5BC0EB] text-white">
            <CardTitle className="text-xl">{property.name}</CardTitle>
            <CardDescription className="text-white/80">{property.address}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Health Score</span>
                <span className="text-sm font-medium">
                  {property.healthScore ? `${property.healthScore}%` : 'N/A'}
                </span>
              </div>
              <Progress value={property.healthScore || 0} className="h-2" />
              
              <div className="flex justify-between text-sm mt-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Last: {property.lastInspection || 'Never'}</span>
                </div>
                <div>
                  <Button variant="ghost" size="sm" className="text-[#00A6A6] hover:text-[#00A6A6]/80 -mr-2">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}