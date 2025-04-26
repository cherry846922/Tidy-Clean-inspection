import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { OptimizationSuggestion } from "@shared/schema";
import { PropertyOptimizationCard } from "@/components/PropertyOptimizationCard";
import PropertySelect from "@/components/PropertySelect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, ListChecks, Clipboard, Calendar, BookOpen, Home, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PropertyOptimizationPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [savedSuggestions, setSavedSuggestions] = useState<OptimizationSuggestion[]>([]);
  const { toast } = useToast();
  
  // Fetch properties data
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/properties');
      return await res.json();
    }
  });

  // Get the selected property details
  const selectedProperty = properties?.find(
    (property: any) => property.id.toString() === selectedPropertyId
  );

  const handlePropertyChange = (value: string) => {
    setSelectedPropertyId(value);
  };

  const handleSaveSuggestion = (suggestion: OptimizationSuggestion) => {
    // Check if this suggestion is already saved (based on title)
    if (!savedSuggestions.some(s => s.title === suggestion.title)) {
      setSavedSuggestions([...savedSuggestions, suggestion]);
    } else {
      toast({
        title: "Already saved",
        description: "This suggestion is already in your saved list.",
        variant: "default"
      });
    }
  };

  const handleRemoveSavedSuggestion = (index: number) => {
    const newSavedSuggestions = [...savedSuggestions];
    newSavedSuggestions.splice(index, 1);
    setSavedSuggestions(newSavedSuggestions);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Property Optimization</h1>
        <p className="text-muted-foreground">
          Use AI to analyze your properties and find optimization opportunities
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Select Property</CardTitle>
              <CardDescription>
                Choose a property to see AI-generated optimization suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertySelect
                value={selectedPropertyId}
                onChange={handlePropertyChange}
                includeAll={false}
                placeholder="Select a property to optimize"
              />
              
              {selectedProperty && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedProperty.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedProperty.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="text-sm">Bedrooms: {selectedProperty.bedrooms}</span>
                      <span className="text-sm">•</span>
                      <span className="text-sm">Bathrooms: {selectedProperty.bathrooms}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                <span>Saved Suggestions</span>
              </CardTitle>
              <CardDescription>
                Suggestions you've saved for future reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {savedSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {savedSuggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-md p-3 relative">
                        <div className="absolute right-2 top-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveSavedSuggestion(index)}
                          >
                            &times;
                          </Button>
                        </div>
                        <div className="pr-6">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                            {suggestion.category}
                          </span>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {suggestion.description}
                          </p>
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span>Impact: <span className="font-medium capitalize">{suggestion.impact}</span></span>
                            <span>Effort: <span className="font-medium capitalize">{suggestion.effort}</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Clipboard className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No suggestions saved yet. Click "Save" on a suggestion to add it here.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedPropertyId ? (
            <PropertyOptimizationCard
              propertyId={parseInt(selectedPropertyId)}
              propertyName={selectedProperty?.name || "Selected Property"}
              onSaveSuggestion={handleSaveSuggestion}
            />
          ) : (
            <Card className="h-full flex flex-col items-center justify-center text-center p-8">
              <Lightbulb className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Select a Property</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Choose a property from the dropdown menu to see AI-generated optimization suggestions 
                to improve guest experience, increase efficiency, and boost your property's performance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <div className="flex items-center gap-2 text-left">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm">Quick implementation timeframes</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <Clipboard className="h-5 w-5 text-primary" />
                  <span className="text-sm">Save suggestions for later</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm">Detailed optimization guides</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <span className="text-sm">Categorized by impact & effort</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}