import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function SwitchRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // First step: log out the current user
  const logoutUser = async () => {
    setIsLoading(true);
    setMessage("Logging out current user...");
    
    try {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Failed to log out");
      }
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Failed to log out");
      toast({
        title: "Error",
        description: "Failed to log out current user",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  // Second step: log in as the specified role
  const loginAs = async (username: string, password: string, roleName: string) => {
    setMessage(`Logging in as ${roleName}...`);
    
    try {
      const res = await apiRequest("POST", "/api/login", { 
        username, 
        password
      });
      
      if (!res.ok) {
        throw new Error(`Failed to login as ${roleName}`);
      }
      
      // Invalidate user query and any cached data
      queryClient.invalidateQueries();
      
      setMessage(`Success! You are now logged in as ${roleName}`);
      toast({
        title: "Role Switched",
        description: `Successfully logged in as ${roleName}`,
      });
      
      // Short delay before redirecting
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      
      return true;
    } catch (error) {
      console.error(`Login error for ${roleName}:`, error);
      setMessage(`Failed to login as ${roleName}`);
      toast({
        title: "Login Failed",
        description: `Could not login as ${roleName}`,
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  // Switch to host role
  const switchToHost = async () => {
    setIsLoading(true);
    const loggedOut = await logoutUser();
    if (loggedOut) {
      // Small delay to ensure logout is processed
      await new Promise(resolve => setTimeout(resolve, 500));
      await loginAs("HostDemo", "password123", "Host");
    }
  };

  // Switch to inspector role
  const switchToInspector = async () => {
    setIsLoading(true);
    const loggedOut = await logoutUser();
    if (loggedOut) {
      // Small delay to ensure logout is processed
      await new Promise(resolve => setTimeout(resolve, 500));
      await loginAs("Cherry84", "password123", "Inspector");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold gradient-text-primary">
            Switch Role
          </CardTitle>
          <CardDescription>
            Use these options to switch between user roles for testing
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {message && (
            <div className="p-3 bg-gray-100 rounded-md text-center">
              {isLoading && (
                <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin text-primary" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="border-blue-400 text-blue-500 hover:bg-blue-50"
              onClick={switchToHost}
              disabled={isLoading}
            >
              Login as Host
            </Button>
            
            <Button
              variant="outline"
              className="border-green-400 text-green-500 hover:bg-green-50"
              onClick={switchToInspector}
              disabled={isLoading}
            >
              Login as Inspector
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 text-center text-xs text-gray-500">
          <p className="w-full">
            Use this page to easily switch between user roles for testing purposes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}