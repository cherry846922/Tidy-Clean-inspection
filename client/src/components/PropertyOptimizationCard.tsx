import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OptimizationSuggestion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Zap, ThumbsUp, AlertTriangle, ArrowRight, Sparkles, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "all",
  "guest experience",
  "maintenance",
  "amenities",
  "efficiency",
  "sustainability",
  "safety",
  "aesthetics"
];

interface PropertyOptimizationCardProps {
  propertyId: number;
  propertyName: string;
  className?: string;
  onSaveSuggestion?: (suggestion: OptimizationSuggestion) => void;
}

export function PropertyOptimizationCard({ 
  propertyId, 
  propertyName, 
  className,
  onSaveSuggestion 
}: PropertyOptimizationCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  
  // Query for fetching optimization suggestions
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/properties', propertyId, 'optimization-suggestions', selectedCategory],
    queryFn: async () => {
      const url = `/api/properties/${propertyId}/optimization-suggestions${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`;
      const res = await apiRequest('GET', url);
      return await res.json();
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false
  });

  // Mutation for generating new suggestions (refresh)
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const url = `/api/properties/${propertyId}/optimization-suggestions${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`;
      const res = await apiRequest('GET', url);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the query to get fresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/properties', propertyId, 'optimization-suggestions']
      });
      toast({
        title: "Suggestions refreshed",
        description: "New optimization suggestions have been generated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to refresh suggestions",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Helper to get impact/effort color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getImpactDescription = (impact: string) => {
    switch (impact) {
      case 'high':
        return "Major improvement to guest experience or significant ROI";
      case 'medium':
        return "Noticeable improvement with moderate benefit";
      case 'low':
        return "Incremental improvement with modest benefit";
      default:
        return "";
    }
  };

  const getEffortDescription = (effort: string) => {
    switch (effort) {
      case 'high':
        return "Requires significant time, resources, or professional help";
      case 'medium':
        return "Moderate time and resource commitment";
      case 'low':
        return "Quick and easy to implement";
      default:
        return "";
    }
  };

  // Handle saving a suggestion
  const handleSaveSuggestion = (suggestion: OptimizationSuggestion) => {
    if (onSaveSuggestion) {
      onSaveSuggestion(suggestion);
      toast({
        title: "Suggestion saved",
        description: "The optimization suggestion has been saved to your task list."
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>AI Property Optimization</div>
          </CardTitle>
          <CardDescription>Generating intelligent suggestions for {propertyName}...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    // Check if the error is related to OpenAI API quota
    const isQuotaError = error instanceof Error && 
      (error.message.includes('quota') || error.message.includes('OpenAI API'));
    
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>{isQuotaError ? "OpenAI API Quota Exceeded" : "Something went wrong"}</div>
          </CardTitle>
          <CardDescription>
            {isQuotaError 
              ? "We couldn't generate optimization suggestions because the OpenAI API quota has been exceeded."
              : "We couldn't generate optimization suggestions at this time."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'Unknown error'}</p>
            
            {isQuotaError && (
              <div className="mt-3 border-t border-destructive/20 pt-3">
                <p className="text-sm text-muted-foreground">
                  This feature requires an active OpenAI API key with available credits. 
                  Please try again later or update the API key with one that has available quota.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({
              queryKey: ['/api/properties', propertyId, 'optimization-suggestions']
            })}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const filteredSuggestions = selectedCategory === 'all' 
    ? data?.suggestions 
    : data?.suggestions.filter((s: OptimizationSuggestion) => s.category === selectedCategory);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>AI Property Optimization</div>
            </CardTitle>
            <CardDescription>Smart suggestions to improve {propertyName}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            {regenerateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate New
              </>
            )}
          </Button>
        </div>
        
        {data?.summary && (
          <div className="mt-4 bg-muted/50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">Summary</h4>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
            
            {data.summary.includes("DEMO MODE") && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>OpenAI API quota exceeded - viewing demo data</span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex items-center overflow-x-auto pb-1 w-full justify-start">
            {CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="h-[420px] relative rounded-md">
            {filteredSuggestions?.length > 0 ? (
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion: OptimizationSuggestion, index: number) => (
                  <div 
                    key={`${suggestion.category}-${index}`} 
                    className="border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">
                          {suggestion.title}
                          {suggestion.title.includes("Demo") && (
                            <Badge variant="secondary" className="ml-2 text-xs">DEMO</Badge>
                          )}
                        </h3>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {suggestion.category}
                        </Badge>
                      </div>
                      {onSaveSuggestion && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSaveSuggestion(suggestion)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">{suggestion.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Impact</div>
                        <div className={`text-sm font-medium ${getLevelColor(suggestion.impact)}`}>
                          {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)}
                          <span className="text-xs font-normal text-muted-foreground ml-2 capitalize">
                            {getImpactDescription(suggestion.impact)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Effort</div>
                        <div className={`text-sm font-medium ${getLevelColor(suggestion.effort)}`}>
                          {suggestion.effort.charAt(0).toUpperCase() + suggestion.effort.slice(1)}
                          <span className="text-xs font-normal text-muted-foreground ml-2 capitalize">
                            {getEffortDescription(suggestion.effort)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Est. Cost</div>
                        <div className="text-sm">{suggestion.costEstimate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Timeframe</div>
                        <div className="text-sm">{suggestion.timeframe}</div>
                      </div>
                    </div>
                    
                    {suggestion.benefits && suggestion.benefits.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Benefits</div>
                        <ul className="text-sm">
                          {suggestion.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 mb-1">
                              <ThumbsUp className="h-3.5 w-3.5 text-primary mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-muted-foreground">
                  No suggestions found for this category.
                </div>
                <Button variant="link" onClick={() => setSelectedCategory('all')}>
                  View all suggestions
                </Button>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Powered by AI analysis of your property data and inspection history.
        </p>
      </CardFooter>
    </Card>
  );
}