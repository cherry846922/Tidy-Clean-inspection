import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PropertySelect from "@/components/PropertySelect";
import { Status } from "@/lib/utils";

interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
}

export interface FilterValues {
  propertyId: string;
  dateRange: string;
  status: Status | "all";
}

export default function FilterBar({ onFilterChange, initialFilters = {} }: FilterBarProps) {
  // Get initial propertyId from URL if present
  const getInitialPropertyId = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const propertyId = params.get("propertyId");
      return propertyId || initialFilters.propertyId || "all";
    }
    return initialFilters.propertyId || "all";
  };
  
  const [filters, setFilters] = useState<FilterValues>({
    propertyId: getInitialPropertyId(),
    dateRange: initialFilters.dateRange || "this-month",
    status: initialFilters.status || "all"
  });
  
  // Apply initial filters on component mount
  useEffect(() => {
    // Apply the filters automatically when component mounts
    onFilterChange(filters);
  }, []);

  const handlePropertyChange = (value: string) => {
    const newFilters = { ...filters, propertyId: value };
    setFilters(newFilters);
  };

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters, status: value as Status | "all" };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 min-w-0">
          <Label className="block text-sm font-medium text-[#767676] mb-1">Property</Label>
          <PropertySelect
            value={filters.propertyId}
            onChange={handlePropertyChange}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Label className="block text-sm font-medium text-[#767676] mb-1">Date Range</Label>
          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="next-month">Next Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-0">
          <Label className="block text-sm font-medium text-[#767676] mb-1">Status</Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:self-end">
          <Button 
            onClick={applyFilters}
            variant="outline" 
            className="w-full md:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
