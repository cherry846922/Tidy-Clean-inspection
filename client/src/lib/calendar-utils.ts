export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const days: CalendarDay[] = [];
  
  // Add days from previous month
  const lastDayOfPrevMonth = new Date(year, month, 0);
  const daysInPrevMonth = lastDayOfPrevMonth.getDate();
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({
      date,
      dayOfMonth: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    });
  }
  
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: true,
      isToday: isSameDay(date, today)
    });
  }
  
  // Add days from next month
  const remainingDays = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    });
  }
  
  return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function getMonthAndYear(date: Date): string {
  return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
}

export function getPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function getNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth();
}
