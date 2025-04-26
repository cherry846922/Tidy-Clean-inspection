import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import AddOnCard from "@/components/AddOnCard";
import type { Addon, Inspection, InspectionAddon } from "@shared/schema";

export default function PricePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});
  const [basePrice, setBasePrice] = useState(0);
  const [customBasePrice, setCustomBasePrice] = useState<number | null>(null);
  const [isEditingBasePrice, setIsEditingBasePrice] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Fetch inspection details
  const { data: inspection, isLoading: inspectionLoading } = useQuery({
    queryKey: ['/api/inspections', id],
    queryFn: () => apiRequest('GET', `/api/inspections/${id}`).then(res => res.json()),
    enabled: !!id,
  });
  
  // Fetch available add-ons
  const { data: addons, isLoading: addonsLoading } = useQuery({
    queryKey: ['/api/addons'],
    queryFn: () => apiRequest('GET', `/api/addons`).then(res => res.json()),
  });
  
  // Fetch inspection add-ons
  const { data: inspectionAddons, isLoading: inspectionAddonsLoading } = useQuery({
    queryKey: ['/api/inspections', id, 'addons'],
    queryFn: () => apiRequest('GET', `/api/inspections/${id}/addons`).then(res => res.json()),
    enabled: !!id,
  });
  
  // Add add-on mutation
  const addAddonMutation = useMutation({
    mutationFn: ({ addonId, quantity }: { addonId: number, quantity: number }) => 
      apiRequest('POST', `/api/inspections/${id}/addons`, { addonId, quantity }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections', id, 'addons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inspections', id] });
      toast({ 
        title: "Add-on added",
        description: "The add-on has been added to the inspection."
      });
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to add the add-on. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Remove add-on mutation
  const removeAddonMutation = useMutation({
    mutationFn: (addonId: number) => 
      apiRequest('DELETE', `/api/inspections/${id}/addons/${addonId}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections', id, 'addons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inspections', id] });
      toast({ 
        title: "Add-on removed",
        description: "The add-on has been removed from the inspection."
      });
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to remove the add-on. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Update price mutation
  const updatePriceMutation = useMutation({
    mutationFn: (price: number) => 
      apiRequest('PATCH', `/api/inspections/${id}`, { price }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      toast({ 
        title: "Price updated",
        description: "The inspection price has been updated."
      });
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to update the price. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Initialize selected add-ons from existing data
  useEffect(() => {
    if (inspectionAddons) {
      const initialSelected: Record<number, number> = {};
      inspectionAddons.forEach((item: InspectionAddon & { addon: Addon }) => {
        initialSelected[item.addonId] = item.quantity;
      });
      setSelectedAddons(initialSelected);
    }
  }, [inspectionAddons]);
  
  // Calculate base price from inspection duration
  useEffect(() => {
    if (inspection) {
      // Calculate base inspection price ($30 per hour)
      const hours = Math.max(1, inspection.durationMinutes / 60);
      const calculatedBasePrice = Math.round(hours * 30);
      setBasePrice(calculatedBasePrice);
    }
  }, [inspection]);
  
  // Calculate total price (base + add-ons)
  useEffect(() => {
    let addonTotal = 0;
    
    if (addons && selectedAddons) {
      Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
        const addon = addons.find((a: Addon) => a.id === parseInt(addonId));
        if (addon && quantity > 0) {
          addonTotal += parseFloat(addon.price) * quantity;
        }
      });
    }
    
    // Use custom base price if available, otherwise use calculated base price
    const effectiveBasePrice = customBasePrice !== null ? customBasePrice : basePrice;
    setTotalPrice(effectiveBasePrice + addonTotal);
  }, [basePrice, customBasePrice, selectedAddons, addons]);
  
  // Handle base price edit
  const handleBasePriceEdit = () => {
    setIsEditingBasePrice(true);
    setCustomBasePrice(customBasePrice !== null ? customBasePrice : basePrice);
  };
  
  // Handle base price save
  const handleBasePriceSave = () => {
    setIsEditingBasePrice(false);
    // Make sure customBasePrice is not negative
    if (customBasePrice !== null && customBasePrice < 0) {
      setCustomBasePrice(0);
    }
  };
  
  // Handle base price cancel
  const handleBasePriceCancel = () => {
    setIsEditingBasePrice(false);
    setCustomBasePrice(null);
  };
  
  // Handle adding or updating add-on
  const handleAddonChange = (addonId: number, checked: boolean) => {
    if (checked) {
      // Add or set to 1
      setSelectedAddons(prev => ({ ...prev, [addonId]: 1 }));
      addAddonMutation.mutate({ addonId, quantity: 1 });
    } else {
      // Remove
      setSelectedAddons(prev => {
        const newSelected = { ...prev };
        delete newSelected[addonId];
        return newSelected;
      });
      removeAddonMutation.mutate(addonId);
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (addonId: number, quantity: number) => {
    if (quantity > 0) {
      setSelectedAddons(prev => ({ ...prev, [addonId]: quantity }));
      addAddonMutation.mutate({ addonId, quantity });
    }
  };
  
  // Save price and continue to checkout
  const handleSaveAndCheckout = () => {
    updatePriceMutation.mutate(totalPrice);
    navigate(`/checkout/${id}`);
  };
  
  if (inspectionLoading || addonsLoading || inspectionAddonsLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Inspection Not Found</CardTitle>
            <CardDescription>The inspection you're looking for could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/inspections')}>Back to Inspections</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inspection Price</CardTitle>
                  <CardDescription>{inspection.property.name} - {formatDate(inspection.date)}</CardDescription>
                </div>
                <Badge variant={inspection.status === 'completed' ? "secondary" : "default"} 
                       className={inspection.status === 'completed' ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                  {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Base Price</h3>
                    {!isEditingBasePrice ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleBasePriceEdit}
                      >
                        Edit Price
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={handleBasePriceSave}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBasePriceCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm text-gray-500">Inspection Duration</p>
                      <p className="font-medium">{inspection.durationMinutes} minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Base Price</p>
                      {isEditingBasePrice ? (
                        <div className="flex items-center justify-end mt-1">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            value={customBasePrice !== null ? customBasePrice : basePrice}
                            onChange={(e) => setCustomBasePrice(parseFloat(e.target.value) || 0)}
                            className="w-24 text-right"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <p className="font-medium">
                          ${(customBasePrice !== null ? customBasePrice : basePrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Add-on Products</h3>
                  
                  <div className="space-y-4">
                    {addons && addons.map((addon: Addon) => (
                      <AddOnCard 
                        key={addon.id}
                        addon={addon}
                        quantity={selectedAddons[addon.id] || 1}
                        isSelected={!!selectedAddons[addon.id]}
                        onQuantityChange={handleQuantityChange}
                        onSelectionChange={handleAddonChange}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Base inspection price:</span>
                  <span className="font-medium">
                    ${(customBasePrice !== null ? customBasePrice : basePrice).toFixed(2)}
                    {customBasePrice !== null && (
                      <span className="text-gray-400 text-xs ml-2">(Custom price)</span>
                    )}
                  </span>
                </div>
                
                {addons && Object.entries(selectedAddons).map(([addonId, quantity]) => {
                  const addon = addons.find((a: Addon) => a.id === parseInt(addonId));
                  if (!addon || quantity <= 0) return null;
                  
                  const itemTotal = parseFloat(addon.price) * quantity;
                  return (
                    <div key={addonId} className="flex justify-between">
                      <span>{addon.name} (x{quantity}):</span>
                      <span className="font-medium">${itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSaveAndCheckout}
                disabled={updatePriceMutation.isPending}
              >
                {updatePriceMutation.isPending ? "Saving..." : "Save and Checkout"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/inspections')}
              >
                Back to Inspections
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}