import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  generateCalendarDays, 
  getMonthAndYear, 
  getNextMonth, 
  getPreviousMonth, 
  isSameDay 
} from "@/lib/calendar-utils";
import { Button } from "@/components/ui/button";
import { getPropertyAbbreviation } from "@/lib/utils";
import type { Inspection } from "@shared/schema";

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  propertyFilter: string;
}

export default function CalendarView({ selectedDate, onDateChange, propertyFilter }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  ));

  // Refetch inspections when month changes
  const startMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const { data: inspections } = useQuery<Inspection[]>({
    queryKey: [
      '/api/inspections',
      {
        startDate: startMonth.toISOString(),
        endDate: endMonth.toISOString(),
        ...(propertyFilter !== "all" ? { propertyId: propertyFilter } : {})
      }
    ],
  });

  // Update calendar days when month changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    ));
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const handleDayClick = (date: Date) => {
    // Create a new date to avoid reference issues
    const newDate = new Date(date.getTime());
    console.log("Calendar day clicked:", newDate.toISOString());
    onDateChange(newDate);
  };

  // Group inspections by date
  const inspectionsByDate = (inspections || []).reduce<Record<string, Inspection[]>>(
    (acc, inspection) => {
      const dateKey = new Date(inspection.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(inspection);
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#484848]">{getMonthAndYear(currentMonth)}</h2>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#767676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#767676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-sm font-medium text-[#767676]">
        <div className="py-3">Sun</div>
        <div className="py-3">Mon</div>
        <div className="py-3">Tue</div>
        <div className="py-3">Wed</div>
        <div className="py-3">Thu</div>
        <div className="py-3">Fri</div>
        <div className="py-3">Sat</div>
      </div>
      <div className="grid grid-cols-7 text-sm border-t border-gray-200">
        {calendarDays.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDate);
          const dateKey = day.date.toDateString();
          const dayInspections = inspectionsByDate[dateKey] || [];
          
          return (
            <div 
              key={index}
              className={`calendar-day aspect-square p-1 border-t border-l border-gray-200 relative ${
                isSelected ? 'bg-blue-50' : ''
              } cursor-pointer hover:bg-gray-50`}
              onClick={() => handleDayClick(day.date)}
            >
              <div className="h-full flex flex-col">
                <span className={`ml-1 ${!day.isCurrentMonth ? 'text-[#767676]' : ''}`}>
                  {day.dayOfMonth}
                </span>
                <div className="flex-1 flex flex-col gap-1 mt-1">
                  {dayInspections.slice(0, 2).map((inspection) => (
                    <div 
                      key={inspection.id}
                      className={`rounded-sm text-xs px-1 py-0.5 truncate ${
                        isSelected 
                          ? 'bg-white bg-opacity-80 text-[#484848]' 
                          : inspection.status === 'scheduled' 
                            ? 'bg-[#FFB400] text-white'
                            : inspection.status === 'completed'
                              ? 'bg-[#00A699] text-white'
                              : 'bg-[#FF5A5F] text-white'
                      }`}
                      title={`${inspection.property.name} - ${new Date(inspection.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                    >
                      {getPropertyAbbreviation(inspection.property.name)} {new Date(inspection.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  ))}
                  {dayInspections.length > 2 && (
                    <div className="text-xs text-[#767676] text-center">+{dayInspections.length - 2} more</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#FFB400] mr-2"></div>
            <span className="text-[#767676]">Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#00A699] mr-2"></div>
            <span className="text-[#767676]">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#FF5A5F] mr-2"></div>
            <span className="text-[#767676]">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
