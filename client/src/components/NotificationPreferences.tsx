import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShakeError, SuccessCheckmark } from '@/components/animation/feedback-animations';
import { AnimatedButton } from '@/components/animation/animated-button';

// Define a schema for notification preferences
const preferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  inspectionReminders: z.boolean().default(true),
  paymentNotifications: z.boolean().default(true),
  reportNotifications: z.boolean().default(true),
  propertyUpdates: z.boolean().default(true),
  marketingNotifications: z.boolean().default(false),
});

type NotificationPreferences = z.infer<typeof preferencesSchema>;

export default function NotificationPreferencesComponent() {
  const { toast } = useToast();
  const [isSuccessSaving, setIsSuccessSaving] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  
  // Fetch notification preferences
  const { 
    data: preferences,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/notification-preferences'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notification-preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      return response.json();
    }
  });
  
  // Update notification preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedPreferences: NotificationPreferences) => {
      const response = await apiRequest('PATCH', '/api/notification-preferences', updatedPreferences);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification preferences');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      setIsSuccessSaving(true);
      setTimeout(() => setIsSuccessSaving(false), 2000);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      setIsSaveError(true);
      setTimeout(() => setIsSaveError(false), 1000);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleToggleChange = (field: keyof NotificationPreferences) => (checked: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      [field]: checked
    };
    
    updateMutation.mutate(updatedPreferences);
  };
  
  const handleSaveAll = () => {
    if (!preferences) return;
    updateMutation.mutate(preferences);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control which notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control which notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-red-600">
            <p>Failed to load notification preferences. Please try again later.</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] })}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <ShakeError shake={isSaveError}>
      <Card className="relative">
        {isSuccessSaving && (
          <div className="absolute top-4 right-4">
            <SuccessCheckmark show={isSuccessSaving} size="lg" color="green" />
          </div>
        )}
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control which notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences?.emailNotifications}
              onCheckedChange={handleToggleChange('emailNotifications')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              checked={preferences?.pushNotifications}
              onCheckedChange={handleToggleChange('pushNotifications')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Inspection Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming inspections
              </p>
            </div>
            <Switch
              checked={preferences?.inspectionReminders}
              onCheckedChange={handleToggleChange('inspectionReminders')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Payment Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about payment requests and confirmations
              </p>
            </div>
            <Switch
              checked={preferences?.paymentNotifications}
              onCheckedChange={handleToggleChange('paymentNotifications')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Report Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new inspection reports are available
              </p>
            </div>
            <Switch
              checked={preferences?.reportNotifications}
              onCheckedChange={handleToggleChange('reportNotifications')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Property Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about property changes and updates
              </p>
            </div>
            <Switch
              checked={preferences?.propertyUpdates}
              onCheckedChange={handleToggleChange('propertyUpdates')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing Communications</Label>
              <p className="text-sm text-muted-foreground">
                Receive marketing emails and offers
              </p>
            </div>
            <Switch
              checked={preferences?.marketingNotifications}
              onCheckedChange={handleToggleChange('marketingNotifications')}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <AnimatedButton 
              onClick={handleSaveAll} 
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>
    </ShakeError>
  );
}