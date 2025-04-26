import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, AlertCircle, Info, X } from "lucide-react";
import { useAnimation } from "@/contexts/animation-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnimatedNotificationProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AnimatedNotification({
  show,
  onClose,
  title,
  message,
  type = "info",
  duration = 5000,
  action,
  className,
}: AnimatedNotificationProps) {
  const { isAnimationEnabled, isReducedMotion } = useAnimation();
  
  // Automatically close the notification after duration
  React.useEffect(() => {
    if (show && duration > 0) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timeout);
    }
  }, [show, duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getStyles = () => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-amber-200 bg-amber-50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50";
    }
  };
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={isAnimationEnabled ? { opacity: 0, y: -20, scale: 0.95 } : false}
          animate={isAnimationEnabled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }}
          exit={isAnimationEnabled ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
          transition={{
            type: isReducedMotion ? "tween" : "spring",
            duration: isReducedMotion ? 0.2 : undefined,
            damping: 20,
            stiffness: 300,
          }}
          className={cn(
            "fixed top-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-md",
            getStyles(),
            className
          )}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">{getIcon()}</div>
            <div className="flex-1">
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm mt-1 text-gray-600">{message}</p>
              {action && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
            </div>
            <button
              className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}