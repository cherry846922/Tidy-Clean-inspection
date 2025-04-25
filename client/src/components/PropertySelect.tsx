import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Property } from "@shared/schema";

interface PropertySelectProps {
  value: number | string | null;
  onChange: (value: string) => void;
  includeAll?: boolean;
  placeholder?: string;
}

export default function PropertySelect({ value, onChange, includeAll = true, placeholder = "Select a property" }: PropertySelectProps) {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  return (
    <Select
      value={value?.toString() || ""}
      onValueChange={onChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="all">All Properties</SelectItem>
        )}
        {properties?.map((property) => (
          <SelectItem key={property.id} value={property.id.toString()}>
            {property.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
