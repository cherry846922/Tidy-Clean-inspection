import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate, getStatusClass, type Status, type PaymentStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Inspection } from "@shared/schema";
import { useLocation } from "wouter";

interface InspectionCardProps {
  inspection: Inspection;
  variant?: "compact" | "full";
}

export default function InspectionCard({ inspection, variant = "full" }: InspectionCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleStatusChange = async (newStatus: Status) => {
    try {
      await apiRequest('PATCH', `/api/inspections/${inspection.id}/status`, { status: newStatus });
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections/byDate'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections/upcoming'] });
      
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
  
  const handlePayNow = () => {
    navigate(`/checkout/${inspection.id}`);
  };
  
  const inspectionTime = new Date(inspection.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  if (variant === "compact") {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-start">
          <div>
            <h3 className="font-medium text-[#484848]">{inspection.property.name}</h3>
            <p className="text-[#767676] text-sm mt-1">{formatDate(inspection.date)}, {inspectionTime}</p>
          </div>
          <div className={`${getStatusClass(inspection.status as Status)} text-white text-xs px-2 py-1 rounded-full`}>
            {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="text-sm text-[#767676] mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {inspection.cleaner.name}
          </div>
          <div className="mt-3 flex justify-between">
            {inspection.status === 'completed' && (
              <>
                <span className="text-sm text-[#767676]">Issues: <span className="text-[#484848] font-medium">{inspection.issues || 'None'}</span></span>
                <Button variant="ghost" className="text-[#FF5A5F] hover:text-[#FF5A5F]/80 text-sm p-0">View Report</Button>
              </>
            )}
            {inspection.status === 'cancelled' && (
              <>
                <span className="text-sm text-[#767676]">Reason: <span className="text-[#484848] font-medium">{inspection.cancellationReason || 'Not specified'}</span></span>
                <Button 
                  variant="ghost" 
                  className="text-[#FF5A5F] hover:text-[#FF5A5F]/80 text-sm p-0"
                  onClick={() => handleStatusChange('scheduled' as Status)}
                >
                  Reschedule
                </Button>
              </>
            )}
            {inspection.status === 'scheduled' && (
              <div className="w-full flex justify-end">
                <Button 
                  variant="ghost" 
                  className="text-[#00A699] hover:text-[#00A699]/80 text-sm p-1 mr-2"
                  onClick={() => handleStatusChange('completed' as Status)}
                >
                  Complete
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-[#FF5A5F] hover:text-[#FF5A5F]/80 text-sm p-1"
                  onClick={() => handleStatusChange('cancelled' as Status)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-[#484848]">{inspection.property.name}</h3>
          <p className="text-[#767676] text-sm mt-1">{formatDate(inspection.date)}, {inspectionTime}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className={`${getStatusClass(inspection.status as Status)} text-white text-xs px-2 py-1 rounded-full`}>
            {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
          </div>
          {inspection.price > 0 && (
            <div className="text-[#484848] font-medium text-sm">
              ${inspection.price.toFixed(2)}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex items-center text-sm text-[#767676]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {inspection.cleaner.name}
      </div>
      
      <div className="mt-2 flex items-center text-sm text-[#767676]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {inspection.property.address}
      </div>
      
      <div className="mt-2 flex items-center text-sm justify-between">
        {inspection.paymentStatus && (
          <div className={`
            ${inspection.paymentStatus === 'paid' ? 'text-green-600' : 
              inspection.paymentStatus === 'processing' ? 'text-blue-600' : 'text-amber-600'}
            font-medium
          `}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {inspection.paymentStatus.charAt(0).toUpperCase() + inspection.paymentStatus.slice(1)}
          </div>
        )}
        
        {inspection.price > 0 && inspection.paymentStatus === 'unpaid' && (
          <Button
            variant="outline"
            size="sm"
            className="text-[#FF5A5F] border-[#FF5A5F] text-xs ml-auto"
            onClick={handlePayNow}
          >
            Pay Now
          </Button>
        )}
        
        {(!inspection.price || inspection.price === 0) && (
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 text-xs ml-auto"
            onClick={() => navigate(`/price/${inspection.id}`)}
          >
            Set Price & Add-ons
          </Button>
        )}
      </div>
      
      {inspection.notes && (
        <div className="mt-2 text-sm text-[#767676]">
          <span className="font-medium">Notes:</span> {inspection.notes}
        </div>
      )}
      
      <div className="mt-3 flex justify-end space-x-2">
        {inspection.status === 'scheduled' && (
          <>
            <Button 
              onClick={() => handleStatusChange('completed' as Status)}
              variant="ghost" 
              size="sm"
              className="text-[#00A699]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete
            </Button>
            <Button 
              onClick={() => handleStatusChange('cancelled' as Status)}
              variant="ghost" 
              size="sm"
              className="text-[#FF5A5F]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cancel
            </Button>
          </>
        )}
        {inspection.status === 'cancelled' && (
          <Button 
            onClick={() => handleStatusChange('scheduled' as Status)}
            variant="outline" 
            size="sm"
            className="text-[#FF5A5F] border-[#FF5A5F]"
          >
            Reschedule
          </Button>
        )}
      </div>
    </div>
  );
}