import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Addon } from "@shared/schema";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PricingManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("add-ons");
  const [newAddon, setNewAddon] = useState<Partial<Addon>>({
    name: "",
    description: "",
    price: "0",
    isActive: true
  });
  const [baseRate, setBaseRate] = useState<string>("60");

  // Fetch all add-ons
  const { data: addons, isLoading } = useQuery<Addon[]>({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/addons");
      return res.json();
    }
  });

  // Create new add-on
  const createAddonMutation = useMutation({
    mutationFn: async (addon: Partial<Addon>) => {
      const res = await apiRequest("POST", "/api/addons", addon);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      setNewAddon({
        name: "",
        description: "",
        price: "0",
        isActive: true
      });
      toast({
        title: "Add-on created",
        description: "The add-on has been successfully created."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create add-on",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update add-on
  const updateAddonMutation = useMutation({
    mutationFn: async (addon: Partial<Addon>) => {
      const res = await apiRequest("PATCH", `/api/addons/${addon.id}`, addon);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      toast({
        title: "Add-on updated",
        description: "The add-on has been successfully updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update add-on",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle add-on active status
  const toggleAddonMutation = useMutation({
    mutationFn: async (addon: Addon) => {
      const res = await apiRequest("PATCH", `/api/addons/${addon.id}`, { 
        isActive: !addon.isActive 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update base rate
  const updateBaseRateMutation = useMutation({
    mutationFn: async (rate: string) => {
      const res = await apiRequest("POST", "/api/settings/base-rate", { rate });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Base rate updated",
        description: "The inspection base rate has been successfully updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update base rate",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle form submission for new add-on
  const handleAddAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddon.name || !newAddon.price) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and price for the add-on.",
        variant: "destructive"
      });
      return;
    }
    createAddonMutation.mutate(newAddon);
  };

  // Handle updating an add-on (edit in-place)
  const handleUpdateAddon = (addon: Addon, field: keyof Addon, value: any) => {
    updateAddonMutation.mutate({ id: addon.id, [field]: value });
  };

  // Handle updating base rate
  const handleUpdateBaseRate = () => {
    updateBaseRateMutation.mutate(baseRate);
  };

  // Only render if user is an inspector
  if (user && user.role !== "inspector") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access pricing management.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Pricing Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
          <TabsTrigger value="base-rate">Base Rate</TabsTrigger>
        </TabsList>
        
        {/* Add-ons Management Tab */}
        <TabsContent value="add-ons">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Item</CardTitle>
                <CardDescription>
                  Add a new item that can be included in inspections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAddon} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input 
                        id="name" 
                        value={newAddon.name} 
                        onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
                        placeholder="e.g. Lightbulb"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={newAddon.price} 
                        onChange={(e) => setNewAddon({...newAddon, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="active">Active</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch 
                          id="active" 
                          checked={newAddon.isActive} 
                          onCheckedChange={(checked) => setNewAddon({...newAddon, isActive: checked})}
                        />
                        <span>{newAddon.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      value={newAddon.description || ""} 
                      onChange={(e) => setNewAddon({...newAddon, description: e.target.value})}
                      placeholder="Describe the item..."
                    />
                  </div>
                  <Button type="submit" disabled={createAddonMutation.isPending}>
                    {createAddonMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Manage Add-on Items</CardTitle>
                <CardDescription>
                  Update prices and manage your add-on inventory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !addons || addons.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No add-on items found. Add your first item above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addons.map((addon) => (
                          <TableRow key={addon.id}>
                            <TableCell>
                              <Input 
                                value={addon.name} 
                                onChange={(e) => handleUpdateAddon(addon, "name", e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value !== addon.name) {
                                    handleUpdateAddon(addon, "name", e.target.value);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={addon.description || ""} 
                                onChange={(e) => handleUpdateAddon(addon, "description", e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value !== addon.description) {
                                    handleUpdateAddon(addon, "description", e.target.value);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={addon.price.toString()} 
                                onChange={(e) => handleUpdateAddon(addon, "price", e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value !== addon.price.toString()) {
                                    handleUpdateAddon(addon, "price", e.target.value);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={addon.isActive} 
                                  onCheckedChange={() => toggleAddonMutation.mutate(addon)}
                                />
                                <span>{addon.isActive ? "Active" : "Inactive"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Base Rate Tab */}
        <TabsContent value="base-rate">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Base Rate</CardTitle>
              <CardDescription>
                Set the base hourly rate for inspection services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseRate">Hourly Rate ($)</Label>
                    <div className="flex space-x-4">
                      <Input 
                        id="baseRate" 
                        type="number" 
                        min="0" 
                        step="1" 
                        value={baseRate} 
                        onChange={(e) => setBaseRate(e.target.value)}
                      />
                      <Button 
                        onClick={handleUpdateBaseRate}
                        disabled={updateBaseRateMutation.isPending}
                      >
                        {updateBaseRateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is the base hourly rate charged for inspection services.
                    The total inspection cost will be calculated based on this rate 
                    multiplied by the inspection duration (in hours), plus any add-on items.
                  </p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Pricing Examples</h3>
                  <p className="text-sm mb-2">Based on current rate of ${baseRate}/hour:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>30 minute inspection:</span>
                      <span className="font-medium">${(parseInt(baseRate) * 0.5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1 hour inspection:</span>
                      <span className="font-medium">${baseRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2 hour inspection:</span>
                      <span className="font-medium">${(parseInt(baseRate) * 2).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}