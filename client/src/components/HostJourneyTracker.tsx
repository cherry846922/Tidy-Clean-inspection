import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  CircleDashed, 
  ArrowRight, 
  Award, 
  Home, 
  CalendarCheck,
  Clipboard,
  User,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeIn, staggerContainer, staggerItem, pulse } from "@/lib/animations";
import { AnimatedButton } from "@/components/animation/animated-button";
import { Link } from "wouter";
import { useAnimation } from "@/contexts/animation-context";

// Journey step types
type JourneyStepStatus = "completed" | "active" | "upcoming";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: JourneyStepStatus;
  icon: React.ReactNode;
  link: string;
  actionText?: string;
}

// Host information
interface HostData {
  name: string;
  profileCompletion: number;
  propertiesCount: number;
  inspectionsCompleted: number;
  daysActive: number;
  rank?: string;
}

interface HostJourneyTrackerProps {
  hostData: HostData;
  className?: string;
}

export function HostJourneyTracker({ hostData, className }: HostJourneyTrackerProps) {
  const { isAnimationEnabled } = useAnimation();
  
  // Calculate journey steps based on host data
  const journeySteps: JourneyStep[] = [
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your contact information and preferences",
      status: hostData.profileCompletion >= 100 ? "completed" : "active",
      icon: <User size={20} />,
      link: "/profile",
      actionText: hostData.profileCompletion >= 100 ? "View Profile" : "Complete Profile"
    },
    {
      id: "properties",
      title: "Add Properties",
      description: "Register your properties for inspection",
      status: hostData.propertiesCount > 0 ? "completed" : "active",
      icon: <Home size={20} />,
      link: "/properties",
      actionText: hostData.propertiesCount > 0 ? "Manage Properties" : "Add Property"
    },
    {
      id: "schedule",
      title: "Schedule First Inspection",
      description: "Book your first property inspection",
      status: hostData.inspectionsCompleted > 0 ? "completed" : 
              hostData.propertiesCount > 0 ? "active" : "upcoming",
      icon: <CalendarCheck size={20} />,
      link: "/calendar",
      actionText: "Schedule Inspection"
    },
    {
      id: "reports",
      title: "View Inspection Reports",
      description: "Review your completed inspection reports",
      status: hostData.inspectionsCompleted > 0 ? "active" : "upcoming",
      icon: <Clipboard size={20} />,
      link: "/reports",
      actionText: "View Reports"
    },
    {
      id: "preferences",
      title: "Set Notification Preferences",
      description: "Customize how you receive updates",
      status: "upcoming",
      icon: <Settings size={20} />,
      link: "/profile?tab=notifications",
      actionText: "Set Preferences"
    }
  ];
  
  // Calculate overall progress
  const activeStepIndex = journeySteps.findIndex(step => step.status === "active");
  const completedSteps = journeySteps.filter(step => step.status === "completed").length;
  const totalSteps = journeySteps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  // Handle next step click
  const handleNextStepClick = (link: string) => {
    // You could add analytics tracking here
    console.log("Navigating to", link);
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <Award className="h-5 w-5" />
          Your Host Journey
        </CardTitle>
        <CardDescription className="text-white/90">
          Track your progress and unlock new features
        </CardDescription>
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>{progressPercentage}% Complete</span>
            <span>{completedSteps}/{totalSteps} Steps</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-white/30" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <motion.div
          variants={isAnimationEnabled ? staggerContainer : undefined}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {journeySteps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={isAnimationEnabled ? staggerItem : undefined}
              className={cn(
                "flex items-start gap-4 relative",
                index !== journeySteps.length - 1 && "pb-6 border-l-2 border-dashed border-gray-200 ml-[10px]",
                step.status === "completed" && index !== journeySteps.length - 1 && "border-green-500"
              )}
            >
              <div className="absolute -left-[10px]">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 bg-white rounded-full" />
                ) : step.status === "active" ? (
                  <motion.div
                    animate={isAnimationEnabled ? pulse : undefined}
                  >
                    <CircleDashed className="h-5 w-5 text-blue-500" />
                  </motion.div>
                ) : (
                  <CircleDashed className="h-5 w-5 text-gray-300" />
                )}
              </div>
              
              <div className="flex-1 pl-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  
                  <Badge
                    variant={
                      step.status === "completed" ? "default" : 
                      step.status === "active" ? "outline" : "secondary"
                    }
                    className={
                      step.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                      step.status === "active" ? "border-blue-300 text-blue-800" : "bg-gray-100 text-gray-500"
                    }
                  >
                    {step.status === "completed" ? "Completed" : 
                      step.status === "active" ? "In Progress" : "Upcoming"}
                  </Badge>
                </div>
                
                {(step.status === "active" || step.status === "completed") && (
                  <div className="mt-3">
                    <Link href={step.link}>
                      <AnimatedButton
                        variant={step.status === "completed" ? "outline" : "default"}
                        size="sm"
                        className={step.status === "completed" ? 
                          "border-green-200 text-green-800 hover:bg-green-50 hover:text-green-900" : 
                          ""}
                        onClick={() => handleNextStepClick(step.link)}
                      >
                        <span className="flex items-center gap-1">
                          {step.actionText} 
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      </AnimatedButton>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {hostData.rank && (
          <motion.div 
            variants={isAnimationEnabled ? fadeIn : undefined}
            initial="hidden"
            animate="visible"
            className="mt-6 flex items-center justify-center"
          >
            <div className="bg-amber-50 text-amber-800 py-2 px-4 rounded-full flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Host Rank: {hostData.rank}</span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}