import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, XCircle, Pencil, Save, Move, Image, Trash2, X, Check, Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ChecklistSection, ChecklistItem } from "@shared/schema";

interface PropertyChecklistEditorProps {
  propertyId: number;
}

export default function PropertyChecklistEditor({ propertyId }: PropertyChecklistEditorProps) {
  const { toast } = useToast();
  const [newSectionName, setNewSectionName] = useState("");
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  
  const [newItemText, setNewItemText] = useState("");
  const [addingItemToSectionId, setAddingItemToSectionId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  
  // Fetch property checklist
  const { data: checklist, isLoading, refetch } = useQuery({
    queryKey: ['/api/properties', propertyId, 'checklist'],
    queryFn: () => apiRequest('GET', `/api/properties/${propertyId}/checklist`).then(res => res.json()),
    enabled: !!propertyId,
  });
  
  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: (data: { name: string }) => 
      apiRequest('POST', `/api/properties/${propertyId}/checklist/sections`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'checklist'] });
      toast({ 
        title: "Section Added",
        description: "The checklist section has been added."
      });
      setNewSectionName("");
      setIsAddingSectionOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to add checklist section. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { name: string } }) => 
      apiRequest('PATCH', `/api/checklist/sections/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'checklist'] });
      toast({ 
        title: "Section Updated",
        description: "The checklist section has been updated."
      });
      setEditingSectionId(null);
      setEditingSectionName("");
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to update checklist section. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/checklist/sections/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'checklist'] });
      toast({ 
        title: "Section Deleted",
        description: "The checklist section has been deleted."
      });
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to delete checklist section. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number, data: { description: string } }) => 
      apiRequest('POST', `/api/checklist/sections/${sectionId}/items`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'checklist'] });
      toast({ 
        title: "Item Added",
        description: "The checklist item has been added."
      });
      setNewItemText("");
      setAddingItemToSectionId(null);
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to add checklist item. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { description: string } }) => 
      apiRequest('PATCH', `/api/checklist/items/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'checklist'] });
      toast({ 
        title: "Item Updated",
        description: "The checklist item has been updated."
      });
      setEditingItemId(null);
      setEditingItemText("");
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to update checklist item. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/checklist/items/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'checklist'] });
      toast({ 
        title: "Item Deleted",
        description: "The checklist item has been deleted."
      });
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to delete checklist item. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Handle add section
  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      toast({
        title: "Error",
        description: "Section name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    createSectionMutation.mutate({ name: newSectionName.trim() });
  };
  
  // Handle edit section
  const handleEditSection = (section: ChecklistSection) => {
    setEditingSectionId(section.id);
    setEditingSectionName(section.name);
  };
  
  // Handle save section edit
  const handleSaveSectionEdit = () => {
    if (!editingSectionName.trim() || !editingSectionId) {
      toast({
        title: "Error",
        description: "Section name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateSectionMutation.mutate({ 
      id: editingSectionId, 
      data: { name: editingSectionName.trim() } 
    });
  };
  
  // Handle delete section
  const handleDeleteSection = (id: number) => {
    if (confirm("Are you sure you want to delete this section? All items in this section will also be deleted.")) {
      deleteSectionMutation.mutate(id);
    }
  };
  
  // Handle add item
  const handleAddItem = (sectionId: number) => {
    if (!newItemText.trim()) {
      toast({
        title: "Error",
        description: "Item description cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    createItemMutation.mutate({ 
      sectionId, 
      data: { description: newItemText.trim() } 
    });
  };
  
  // Handle edit item
  const handleEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.description);
  };
  
  // Handle save item edit
  const handleSaveItemEdit = () => {
    if (!editingItemText.trim() || !editingItemId) {
      toast({
        title: "Error",
        description: "Item description cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateItemMutation.mutate({ 
      id: editingItemId, 
      data: { description: editingItemText.trim() } 
    });
  };
  
  // Handle delete item
  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(id);
    }
  };
  
  // Handle cancel section edit
  const handleCancelSectionEdit = () => {
    setEditingSectionId(null);
    setEditingSectionName("");
  };
  
  // Handle cancel item edit
  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setEditingItemText("");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Checklist</h2>
        
        {!isAddingSectionOpen ? (
          <Button 
            onClick={() => setIsAddingSectionOpen(true)}
            variant="outline"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Section
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Section name"
              className="w-48"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSection();
                if (e.key === "Escape") {
                  setIsAddingSectionOpen(false);
                  setNewSectionName("");
                }
              }}
            />
            <Button onClick={handleAddSection} size="sm">Add</Button>
            <Button 
              onClick={() => {
                setIsAddingSectionOpen(false);
                setNewSectionName("");
              }} 
              variant="ghost" 
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* No sections message */}
      {(!checklist || checklist.sections.length === 0) && !isAddingSectionOpen && (
        <Alert className="bg-muted/50">
          <AlertDescription>
            No checklist sections created yet. Click the "Add Section" button to create your first section.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Sections */}
      <div className="space-y-6">
        {checklist?.sections.map((section: ChecklistSection & { items: ChecklistItem[] }) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="bg-muted/20 pb-2">
              {editingSectionId === section.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    placeholder="Section name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSectionEdit();
                      if (e.key === "Escape") handleCancelSectionEdit();
                    }}
                  />
                  <Button onClick={handleSaveSectionEdit} size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleCancelSectionEdit} size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <CardTitle>{section.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button 
                      onClick={() => handleEditSection(section)} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteSection(section.id)} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-4">
              {/* Items list */}
              <div className="space-y-3">
                {section.items && section.items.length > 0 ? (
                  section.items.map((item: ChecklistItem) => (
                    <div key={item.id} className="group flex items-start gap-2 p-2 hover:bg-muted/30 rounded-md">
                      <div className="flex-none pt-1.5 opacity-30 cursor-grab">
                        <Grip className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-grow">
                        {editingItemId === item.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              className="min-h-[60px]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) handleSaveItemEdit();
                                if (e.key === "Escape") handleCancelItemEdit();
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <Button onClick={handleSaveItemEdit} size="sm">Save</Button>
                              <Button onClick={handleCancelItemEdit} size="sm" variant="outline">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">{item.description}</div>
                        )}
                      </div>
                      
                      {editingItemId !== item.id && (
                        <div className="flex-none flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => handleEditItem(item)} 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            onClick={() => handleDeleteItem(item.id)} 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">No items in this section</div>
                )}
              </div>
              
              {/* Add item UI */}
              {addingItemToSectionId === section.id ? (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Enter checklist item description"
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) handleAddItem(section.id);
                      if (e.key === "Escape") {
                        setAddingItemToSectionId(null);
                        setNewItemText("");
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleAddItem(section.id)} 
                      disabled={createItemMutation.isPending}
                      size="sm"
                    >
                      {createItemMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                    <Button 
                      onClick={() => {
                        setAddingItemToSectionId(null);
                        setNewItemText("");
                      }} 
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setAddingItemToSectionId(section.id)} 
                  variant="ghost" 
                  className="mt-4 text-muted-foreground hover:text-foreground"
                  size="sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}