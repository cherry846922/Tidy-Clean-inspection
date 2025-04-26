import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatDate, formatShortDate, getStatusClass, Status } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Inspection } from "@shared/schema";
import { Link } from "wouter";

interface DayDetailProps {
  selectedDate: Date;
  onInspectionAction: () => void;
}

export default function DayDetail({ selectedDate, onInspectionAction }: DayDetailProps) {
  const { toast } = useToast();
  const [upcomingInspections, setUpcomingInspections] = useState<Inspection[]>([]);
  
  // Get inspections for the selected date
  // Format the date properly for the API
  const formattedDate = selectedDate.toISOString().split('T')[0];
  
  const { data: inspectionsForDay, isLoading: isLoadingDay, refetch: refetchDay } = useQuery<Inspection[]>({
    queryKey: [
      '/api/inspections/byDate',
      { date: formattedDate }
    ],
    // Ensure date parameter is passed in the URL
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/inspections/byDate?date=${formattedDate}`);
      if (!res.ok) {
        throw new Error('Failed to fetch inspections for the selected date');
      }
      return res.json();
    }
  });
  
  // Get upcoming inspections for the week
  const { data: upcomingData, isLoading: isLoadingUpcoming } = useQuery<Inspection[]>({
    queryKey: ['/api/inspections/upcoming'],
  });
  
  useEffect(() => {
    if (upcomingData) {
      // Filter out inspections for the selected date
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const filtered = upcomingData.filter(
        inspection => new Date(inspection.date).toISOString().split('T')[0] !== selectedDateStr
      ).slice(0, 3); // Get only the first few
      
      setUpcomingInspections(filtered);
    }
  }, [upcomingData, selectedDate]);
  
  const handleStatusChange = async (inspectionId: number, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      await apiRequest('PATCH', `/api/inspections/${inspectionId}/status`, { status: newStatus });
      await refetchDay();
      onInspectionAction();
      
      toast({
        title: "Status updated",
        description: `Inspection has been marked as ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "There was a problem updating the inspection status.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="md:col-span-1 bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#484848] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF5A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(selectedDate)}
        </h2>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-[#767676] mb-2">INSPECTIONS TODAY</h3>
        {isLoadingDay ? (
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
          </div>
        ) : inspectionsForDay && inspectionsForDay.length > 0 ? (
          <div className="space-y-4">
            {inspectionsForDay.map((inspection) => (
              <div 
                key={inspection.id} 
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-[#484848]">{inspection.property.name}</h4>
                    <p className="text-[#767676] text-sm mt-1">
                      {new Date(inspection.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })} - {new Date(new Date(inspection.date).getTime() + inspection.durationMinutes * 60000).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </p>
                  </div>
                  <div className={`${getStatusClass(inspection.status as Status)} text-white text-xs px-2 py-1 rounded-full`}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-sm text-[#767676]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {inspection.cleaner.name}
                </div>
                
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(inspection.property.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center text-sm text-[#767676] cursor-pointer hover:text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hover:underline">{inspection.property.address}</span>
                </a>
                
                <div className="mt-3 flex justify-end space-x-2">
                  {inspection.status === 'scheduled' && (
                    <Button 
                      onClick={() => handleStatusChange(inspection.id, 'completed')}
                      variant="ghost" 
                      size="icon"
                      className="text-[#00A699] hover:text-[#00A699]/80"
                      title="Mark as Complete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-[#767676] hover:text-[#484848]"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  {inspection.status === 'scheduled' && (
                    <Button 
                      onClick={() => handleStatusChange(inspection.id, 'cancelled')}
                      variant="ghost" 
                      size="icon"
                      className="text-[#767676] hover:text-[#FF5A5F]"
                      title="Cancel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#767676]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No inspections scheduled for today.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                // Pass the event up to the parent component to open the modal
                onInspectionAction();
              }}
            >
              Schedule an Inspection
            </Button>
          </div>
        )}
      </div>
      
      {(upcomingInspections && upcomingInspections.length > 0) && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-[#767676] mb-2">UPCOMING THIS WEEK</h3>
          <div className="space-y-2">
            {isLoadingUpcoming ? (
              <>
                <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
                <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
              </>
            ) : (
              upcomingInspections.map(inspection => (
                <div key={inspection.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-[#484848]">{inspection.property.name}</h4>
                      <div className="text-[#767676] text-sm mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatShortDate(inspection.date)}, {new Date(inspection.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        })}
                      </div>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(inspection.property.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center text-sm text-[#767676] cursor-pointer hover:text-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hover:underline">{inspection.property.address}</span>
                      </a>
                    </div>
                    <div className={`${getStatusClass(inspection.status as Status)} text-white text-xs px-2 py-1 rounded-full`}>
                      {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200">
        <Link href="/inspections">
          <Button variant="outline" className="w-full">
            View All Inspections
          </Button>
        </Link>
      </div>
    </div>
  );
}
