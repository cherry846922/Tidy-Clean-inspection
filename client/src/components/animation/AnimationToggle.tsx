import { Button } from "@/components/ui/button";
import { useAnimation } from "@/contexts/animation-context";
import { motion } from "framer-motion";
import { Zap, ZapOff, Activity } from "lucide-react";
import React from "react";

export function AnimationToggle() {
  const { preference, toggleAnimation } = useAnimation();

  // Define different variants based on the preference
  const getIcon = () => {
    switch (preference) {
      case "full":
        return (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.4, repeat: 0 }}
          >
            <Zap className="h-5 w-5 text-yellow-500" />
          </motion.div>
        );
      case "reduced":
        return <Activity className="h-5 w-5 text-blue-500" />;
      case "disabled":
        return <ZapOff className="h-5 w-5 text-gray-500" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (preference) {
      case "full":
        return "Full Animations";
      case "reduced":
        return "Reduced Animations";
      case "disabled":
        return "Animations Off";
      default:
        return "Animations";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={toggleAnimation}
    >
      <span className="mr-2">
        {getIcon()}
      </span>
      {getLabel()}
    </Button>
  );
}