import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ClipboardList, AlertTriangle } from "lucide-react";
import { Property } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PropertyFeedbackDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ImprovementSuggestion {
  category: string;
  score: number;
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export default function PropertyFeedbackDialog({
  open,
  setOpen,
}: PropertyFeedbackDialogProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch properties
  const { data: properties, isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: open,
  });

  // Fetch property feedback suggestions
  const generateFeedbackMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      setProcessing(true);
      const response = await apiRequest(
        "GET",
        `/api/properties/${propertyId}/feedback-suggestions`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate feedback");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions);
      setProcessing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setProcessing(false);
    },
  });

  const handlePropertyChange = (value: string) => {
    setSelectedPropertyId(value);
    setSuggestions([]);
  };

  const handleGenerateFeedback = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Please select a property",
        description: "Select a property to generate feedback suggestions",
        variant: "destructive",
      });
      return;
    }

    generateFeedbackMutation.mutate(parseInt(selectedPropertyId));
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500 bg-red-50";
      case "medium":
        return "border-l-4 border-amber-500 bg-amber-50";
      case "low":
        return "border-l-4 border-green-500 bg-green-50";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Property Improvement Suggestions</DialogTitle>
          <DialogDescription>
            Get actionable suggestions to improve your property condition based on inspection results.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property">Select Property</Label>
            <Select value={selectedPropertyId} onValueChange={handlePropertyChange}>
              <SelectTrigger id="property" disabled={loadingProperties}>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateFeedback}
            disabled={!selectedPropertyId || processing || generateFeedbackMutation.isPending}
            className="w-full"
          >
            {(processing || generateFeedbackMutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating suggestions...
              </>
            ) : (
              <>
                <ClipboardList className="mr-2 h-4 w-4" />
                Generate Improvement Suggestions
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="font-medium text-lg">Suggested Improvements</h3>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md ${getPriorityStyles(suggestion.priority)}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{suggestion.category}</h4>
                    <span className="text-sm px-2 py-1 rounded-full bg-white">
                      Score: {suggestion.score}/100
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-700">{suggestion.issue}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Suggestion:</span> {suggestion.suggestion}
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="flex items-center text-xs font-medium">
                      <AlertTriangle className={`h-3 w-3 mr-1 
                        ${suggestion.priority === 'high' ? 'text-red-500' : 
                          suggestion.priority === 'medium' ? 'text-amber-500' : 'text-green-500'}`} 
                      />
                      {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          {suggestions.length > 0 && (
            <Button variant="secondary" onClick={() => setSuggestions([])}>
              Clear Suggestions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}