import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Profile update schema
const profileSchema = z.object({
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  // Password update schema
  const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/user/profile", values);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.setQueryData(["/api/user"], (old: any) => ({
        ...old,
        ...data,
      }));
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("PUT", "/api/user/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(values);
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return user?.username.substring(0, 2).toUpperCase() || "U";
    
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 pb-4">
                    <Avatar className="h-24 w-24 border-2 border-primary/10">
                      <AvatarFallback className="text-xl">
                        {getInitials(user.name || undefined)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
                      <p className="text-muted-foreground">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                      {user.email && <p className="text-sm">{user.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              disabled={!isEditing}
                              placeholder="Your full name" 
                              value={field.value || ""} 
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              disabled={!isEditing}
                              type="email" 
                              placeholder="Your email address" 
                              value={field.value || ""} 
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              disabled={!isEditing}
                              placeholder="Your phone number" 
                              value={field.value || ""} 
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : "Save Changes"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Password Update */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Change your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter current password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full mt-2" 
                    disabled={updatePasswordMutation.isPending}>
                    {updatePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : "Update Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}