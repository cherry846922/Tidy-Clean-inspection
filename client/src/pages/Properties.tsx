import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Property } from "@shared/schema";
import { Loader2, Activity, Calendar, MessageSquare, CheckSquare, Sparkles, SparkleIcon } from "lucide-react";
import PropertyFeedbackDialog from "@/components/PropertyFeedbackDialog";
import PropertyChecklistEditor from "@/components/PropertyChecklistEditor";
import { AnimatedList } from "@/components/animation/animated-list";
import { AnimatedCard } from "@/components/animation/animated-card";
import { PageWrapper as PageTransition } from "@/components/animation/PageWrapper";
import { AnimatedButton } from "@/components/animation/animated-button";

// Form validation schema
const propertyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  type: z.string().min(1, "Type is required"),
  bedrooms: z.coerce.number().int().positive("Must be a positive number"),
  bathrooms: z.coerce.number().positive("Must be a positive number"),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// Health score types
interface HealthScore {
  propertyId: number;
  score: number;
  lastChecked: Date;
  details?: {
    cleanliness: number;
    maintenance: number;
    amenities: number;
    safety: number;
  };
}

// Property health score component
function PropertyHealthScore({ propertyId }: { propertyId: number }) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Query to get the health score
  const { 
    data: healthScore,
    isLoading: isScoreLoading,
    isError: isScoreError,
    refetch: refetchScore 
  } = useQuery<HealthScore>({
    queryKey: ['/api/properties', propertyId, 'health-score'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/properties/${propertyId}/health-score`);
      if (res.status === 404) {
        return null;
      }
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false
  });
  
  // Mutation to generate a new health score
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/properties/health-score', { propertyId });
      return res.json();
    },
    onSuccess: (data) => {
      refetchScore();
      toast({
        title: "Health Score Generated",
        description: `Your property received a score of ${data.score}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate health score. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };
  
  const getScoreClass = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };
  
  const formatDate = (date: Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (isScoreLoading) {
    return (
      <div className="p-3 text-center">
        <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
        <p className="text-xs text-gray-500 mt-1">Loading score...</p>
      </div>
    );
  }
  
  if (isScoreError || !healthScore) {
    return (
      <div className="mt-4 p-3 border border-dashed border-gray-200 rounded-md">
        <div className="text-center">
          <SparkleIcon className="h-10 w-10 mx-auto text-gray-300" />
          <h4 className="font-medium text-sm text-gray-600 mt-2">No Health Score</h4>
          <p className="text-xs text-gray-500 mt-1">Generate a score to see how your property is performing</p>
          <AnimatedButton 
            size="sm"
            variant="outline" 
            className="mt-3 text-sm bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] hover:from-[#FF385C] hover:to-[#FF5A5F] text-white border-none"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-2" />
                Generate Score
              </>
            )}
          </AnimatedButton>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 border border-gray-100 rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-2 text-gray-500" />
            <h4 className="font-medium text-sm">Property Health</h4>
          </div>
          <div className="flex items-baseline mt-1">
            <span className={`text-xl font-bold ${getScoreColor(healthScore.score)}`}>
              {healthScore.score}
            </span>
            <span className="text-xs text-gray-500 ml-1">/100</span>
          </div>
        </div>
        <AnimatedButton 
          size="sm"
          variant="outline" 
          className="text-xs"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Refresh"
          )}
        </AnimatedButton>
      </div>
      
      <Progress 
        value={healthScore.score} 
        className={`h-2 mt-2 ${getScoreClass(healthScore.score)}`} 
      />
      
      <div className="mt-3 flex justify-between">
        <span className="text-xs text-gray-500">
          <Calendar className="h-3 w-3 inline mr-1" />
          Last updated: {formatDate(healthScore.lastChecked)}
        </span>
        {healthScore.details && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-5 px-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
        )}
      </div>
      
      {showDetails && healthScore.details && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-white rounded border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cleanliness</span>
              <span className={getScoreColor(healthScore.details.cleanliness)}>
                {healthScore.details.cleanliness}
              </span>
            </div>
            <Progress 
              value={healthScore.details.cleanliness} 
              className={`h-1 mt-1 ${getScoreClass(healthScore.details.cleanliness)}`} 
            />
          </div>
          <div className="p-2 bg-white rounded border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Maintenance</span>
              <span className={getScoreColor(healthScore.details.maintenance)}>
                {healthScore.details.maintenance}
              </span>
            </div>
            <Progress 
              value={healthScore.details.maintenance} 
              className={`h-1 mt-1 ${getScoreClass(healthScore.details.maintenance)}`} 
            />
          </div>
          <div className="p-2 bg-white rounded border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amenities</span>
              <span className={getScoreColor(healthScore.details.amenities)}>
                {healthScore.details.amenities}
              </span>
            </div>
            <Progress 
              value={healthScore.details.amenities} 
              className={`h-1 mt-1 ${getScoreClass(healthScore.details.amenities)}`} 
            />
          </div>
          <div className="p-2 bg-white rounded border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Safety</span>
              <span className={getScoreColor(healthScore.details.safety)}>
                {healthScore.details.safety}
              </span>
            </div>
            <Progress 
              value={healthScore.details.safety} 
              className={`h-1 mt-1 ${getScoreClass(healthScore.details.safety)}`} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Main Properties component
export default function Properties() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  
  // Check for propertyId in URL query params
  useEffect(() => {
    // Parse query parameters to check for propertyId
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const propertyId = searchParams.get('propertyId');
    if (propertyId) {
      setHighlightedPropertyId(propertyId);
      
      // Scroll to the highlighted property with a small delay to ensure render
      setTimeout(() => {
        const element = document.getElementById(`property-${propertyId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Clear the highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedPropertyId(null);
        // Remove the propertyId from the URL without navigating
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Fetch properties
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Add property form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "",
      bedrooms: 1,
      bathrooms: 1
    },
  });
  
  // Add property form submission
  const onSubmit = async (values: PropertyFormValues) => {
    try {
      await apiRequest('POST', '/api/properties', values);
      await queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      setIsAddDialogOpen(false);
      form.reset();
      
      toast({
        title: "Property added",
        description: "Your property has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error adding property",
        description: "There was a problem adding your property. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Edit property form
  const editForm = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "",
      bedrooms: 1,
      bathrooms: 1
    },
  });
  
  // Set form values when a property is selected for editing
  useEffect(() => {
    if (selectedProperty) {
      editForm.reset({
        name: selectedProperty.name,
        address: selectedProperty.address,
        type: selectedProperty.type || "",
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms
      });
    }
  }, [selectedProperty, editForm]);
  
  // Handle property edit submission
  const onEditSubmit = async (values: PropertyFormValues) => {
    if (!selectedProperty) return;
    
    try {
      await apiRequest('PATCH', `/api/properties/${selectedProperty.id}`, values);
      await queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      setIsEditDialogOpen(false);
      setSelectedProperty(null);
      
      toast({
        title: "Property updated",
        description: "Your property has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating property",
        description: "There was a problem updating your property. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Render property card component
  const renderProperty = (property: Property) => {
    const isHighlighted = highlightedPropertyId === property.id.toString();
    
    return (
      <Card 
        id={`property-${property.id}`}
        key={property.id} 
        className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
          isHighlighted ? 'ring-2 ring-primary shadow-lg animate-pulse' : ''
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle>{property.name}</CardTitle>
          <CardDescription>{property.type}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-[#767676] space-y-2">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#767676] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{property.address}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#767676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>
                {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}, {' '}
                {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
              </span>
            </div>
          </div>
          
          {/* Health Score Component */}
          <PropertyHealthScore propertyId={property.id} />
          
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <AnimatedButton 
              variant="outline" 
              size="sm" 
              className="text-emerald-600"
              onClick={() => {
                setSelectedPropertyId(property.id.toString());
                setIsChecklistDialogOpen(true);
              }}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Checklist
            </AnimatedButton>
            <AnimatedButton 
              variant="outline" 
              size="sm" 
              className="text-purple-600"
              onClick={() => {
                setSelectedPropertyId(property.id.toString());
                setIsFeedbackDialogOpen(true);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Get Feedback
            </AnimatedButton>
            <AnimatedButton 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedProperty(property);
                setIsEditDialogOpen(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </AnimatedButton>
            <AnimatedButton 
              variant="outline" 
              size="sm" 
              className="text-[#FF5A5F]"
              onClick={() => {
                // Navigate to calendar with property filter
                setLocation(`/calendar?propertyId=${property.id}`);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Schedule
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#484848]">Properties</h1>
              <p className="text-[#767676] mt-1">Manage your Airbnb properties</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <AnimatedButton className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Property
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                      Enter the details of your Airbnb property
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Seaside Villa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 123 Beach Road" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Apartment, Villa, Cabin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl>
                                <Input type="number" min="0.5" step="0.5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <AnimatedButton type="submit" className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white">
                          Add Property
                        </AnimatedButton>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
          ) : properties && properties.length > 0 ? (
            <AnimatedList
              containerTag="div"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              items={properties}
              renderItem={(property) => renderProperty(property)}
              itemClassName=""
              emptyState={
                <div className="text-center py-12 text-[#767676] col-span-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <p>No properties found.</p>
                  <AnimatedButton 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add Your First Property
                  </AnimatedButton>
                </div>
              }
            />
          ) : (
            <div className="text-center py-12 text-[#767676]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p>No properties found.</p>
              <AnimatedButton 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Your First Property
              </AnimatedButton>
            </div>
          )}
          
          {/* Property Feedback Dialog */}
          <PropertyFeedbackDialog 
            open={isFeedbackDialogOpen} 
            setOpen={setIsFeedbackDialogOpen}
            initialPropertyId={selectedPropertyId}
          />
          
          {/* Property Checklist Dialog */}
          <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Property Checklist</DialogTitle>
                <DialogDescription>
                  Create and manage checklists for this property
                </DialogDescription>
              </DialogHeader>
              {selectedPropertyId && (
                <PropertyChecklistEditor propertyId={parseInt(selectedPropertyId)} />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Property Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Property</DialogTitle>
                <DialogDescription>
                  Update your property details
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" min="0.5" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <AnimatedButton type="submit" className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white">
                      Save Changes
                    </AnimatedButton>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}