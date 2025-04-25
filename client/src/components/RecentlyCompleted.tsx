import { useQuery } from "@tanstack/react-query";
import InspectionCard from "@/components/InspectionCard";
import type { Inspection } from "@shared/schema";

export default function RecentlyCompleted() {
  const { data: recentInspections, isLoading } = useQuery<Inspection[]>({
    queryKey: ['/api/inspections/recent'],
  });
  
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#484848] mb-4">Recently Completed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (!recentInspections || recentInspections.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#484848] mb-4">Recently Completed</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentInspections.map(inspection => (
          <InspectionCard key={inspection.id} inspection={inspection} variant="compact" />
        ))}
      </div>
    </div>
  );
}
