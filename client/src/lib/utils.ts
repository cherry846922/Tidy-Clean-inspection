import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Status = "scheduled" | "completed" | "cancelled";

export function formatTime(time: string): string {
  // Convert "13:00:00" to "1:00 PM"
  const date = new Date(`2000-01-01T${time}`);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export function getStatusClass(status: Status): string {
  switch (status) {
    case "scheduled":
      return "status-scheduled";
    case "completed":
      return "status-completed";
    case "cancelled":
      return "status-cancelled";
    default:
      return "";
  }
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatShortDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getPropertyAbbreviation(name: string): string {
  return name.split(' ').map(word => word[0]).join('');
}
