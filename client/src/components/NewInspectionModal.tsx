import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Property, Cleaner } from "@shared/schema";

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

const formSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  cleanerId: z.string().min(1, "Cleaner is required"),
  durationMinutes: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewInspectionModal({ isOpen, onClose, selectedDate }: NewInspectionModalProps) {
  const { toast } = useToast();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  
  const { data: propertiesData } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  const { data: cleanersData } = useQuery<Cleaner[]>({
    queryKey: ['/api/cleaners'],
  });
  
  useEffect(() => {
    if (propertiesData) {
      setProperties(propertiesData);
    }
  }, [propertiesData]);
  
  useEffect(() => {
    if (cleanersData) {
      setCleaners(cleanersData);
    }
  }, [cleanersData]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: "",
      cleanerId: "",
      durationMinutes: "60", // Default 1 hour
      notes: "",
    },
  });
  
  useEffect(() => {
    if (selectedDate && isOpen) {
      form.setValue("date", selectedDate.toISOString().split('T')[0]);
    }
  }, [selectedDate, isOpen, form]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      // Combine date and time
      const dateTime = new Date(`${values.date}T${values.time}`);
      
      const payload = {
        propertyId: parseInt(values.propertyId),
        cleanerId: parseInt(values.cleanerId),
        date: dateTime.toISOString(),
        durationMinutes: parseInt(values.durationMinutes),
        notes: values.notes || null,
        status: "scheduled"
      };
      
      await apiRequest('POST', '/api/inspections', payload);
      
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections/byDate'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections/upcoming'] });
      
      toast({
        title: "Inspection scheduled",
        description: "Your cleaning inspection has been scheduled successfully.",
      });
      
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error scheduling inspection",
        description: "There was a problem scheduling your inspection. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#484848]">Schedule New Cleaning Inspection</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#767676] hover:text-[#484848]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="cleanerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaner</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cleaner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cleaners.map((cleaner) => (
                          <SelectItem key={cleaner.id} value={cleaner.id.toString()}>
                            {cleaner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any special instructions or notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-6 flex space-x-3 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white">
                  Schedule Inspection
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
