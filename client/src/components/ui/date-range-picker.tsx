import React from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({ date, setDate, className }: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePickerPresets() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });

  const presets = [
    {
      name: "Today",
      dates: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      name: "Yesterday",
      dates: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      name: "Last 7 days",
      dates: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      name: "Last 30 days",
      dates: {
        from: addDays(new Date(), -29),
        to: new Date(),
      },
    },
    {
      name: "Last 90 days",
      dates: {
        from: addDays(new Date(), -89),
        to: new Date(),
      },
    },
    {
      name: "Last year",
      dates: {
        from: addDays(new Date(), -364),
        to: new Date(),
      },
    },
  ];

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className={cn(
                  "justify-start font-normal",
                  (date?.from &&
                    preset.dates.from?.getDate() === date.from.getDate() &&
                    preset.dates.from?.getMonth() === date.from.getMonth() &&
                    preset.dates.from?.getFullYear() === date.from.getFullYear() &&
                    preset.dates.to?.getDate() === date.to?.getDate() &&
                    preset.dates.to?.getMonth() === date.to?.getMonth() &&
                    preset.dates.to?.getFullYear() === date.to?.getFullYear()) &&
                    "bg-muted font-medium text-foreground"
                )}
                onClick={() => setDate(preset.dates)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
          <div className="rounded-md border">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}