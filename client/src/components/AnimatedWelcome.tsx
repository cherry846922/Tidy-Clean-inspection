import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, X, Sun, Cloud, Moon, CloudRain } from "lucide-react";
import { fadeIn, slideInRight, slideInLeft, subtleFloat } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useAnimation } from "@/contexts/animation-context";

interface AnimatedWelcomeProps {
  userName: string;
  onDismiss: () => void;
  className?: string;
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type Weather = "sunny" | "cloudy" | "rainy" | "clear";

export function AnimatedWelcome({ userName, onDismiss, className }: AnimatedWelcomeProps) {
  const { isAnimationEnabled } = useAnimation();
  const [dismissed, setDismissed] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [weather, setWeather] = useState<Weather>("sunny");
  
  useEffect(() => {
    // Determine time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeOfDay("morning");
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay("afternoon");
    } else if (hour >= 17 && hour < 21) {
      setTimeOfDay("evening");
    } else {
      setTimeOfDay("night");
    }
    
    // For demo purposes, randomly select weather
    // In a real app, you might use a weather API
    const weathers: Weather[] = ["sunny", "cloudy", "rainy", "clear"];
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
  }, []);
  
  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };
  
  const getGreeting = () => {
    const greetings = {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Good night"
    };
    return `${greetings[timeOfDay]}, ${userName}!`;
  };
  
  const getWeatherIcon = () => {
    switch (weather) {
      case "sunny":
        return <Sun className="h-8 w-8 text-amber-400" />;
      case "cloudy":
        return <Cloud className="h-8 w-8 text-blue-400" />;
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "clear":
        return timeOfDay === "night" ? 
          <Moon className="h-8 w-8 text-indigo-400" /> : 
          <Sun className="h-8 w-8 text-amber-400" />;
    }
  };
  
  const getTimeDescription = () => {
    const descriptions = {
      morning: "Start your day with a fresh perspective.",
      afternoon: "Keep the momentum going as you manage your properties.",
      evening: "Review your day's accomplishments.",
      night: "Plan for tomorrow's inspections."
    };
    return descriptions[timeOfDay];
  };
  
  const getBackgroundGradient = () => {
    const gradients = {
      morning: "from-amber-100 to-sky-100",
      afternoon: "from-sky-100 to-blue-100",
      evening: "from-orange-100 to-purple-100",
      night: "from-indigo-100 to-blue-100"
    };
    return gradients[timeOfDay];
  };
  
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          variants={isAnimationEnabled ? fadeIn : undefined}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn("mb-6", className)}
        >
          <Card className={cn("overflow-hidden border-none", className)}>
            <CardContent className="p-0">
              <div 
                className={cn(
                  "relative p-6 bg-gradient-to-r rounded-lg",
                  getBackgroundGradient()
                )}
              >
                <button 
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
                
                <div className="flex">
                  <motion.div 
                    className="flex-1"
                    variants={isAnimationEnabled ? slideInLeft : undefined}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{getGreeting()}</h2>
                    <p className="text-gray-600 mb-4">{getTimeDescription()}</p>
                    
                    <div className="inline-flex items-center text-sm font-medium text-primary">
                      Go to Dashboard 
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-start justify-center"
                    variants={isAnimationEnabled ? slideInRight : undefined}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      animate={isAnimationEnabled ? subtleFloat : undefined}
                    >
                      {getWeatherIcon()}
                    </motion.div>
                  </motion.div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-full" />
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}