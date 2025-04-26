import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { slideUp, shake, fadeIn } from "@/lib/animations";

interface FeedbackIndicatorProps {
  type: "success" | "error" | "warning" | "info";
  message?: string;
  className?: string;
  autoHide?: boolean;
  duration?: number;
  icon?: boolean;
}

export function FeedbackIndicator({
  type,
  message,
  className,
  autoHide = true,
  duration = 3000,
  icon = true,
}: FeedbackIndicatorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
      case "info":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideUp}
          className={cn(
            "flex items-center p-3 rounded-md border",
            getBgColor(),
            className
          )}
        >
          {icon && <span className="mr-2">{getIcon()}</span>}
          {message && <span className="text-sm">{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated shake effect for forms with validation errors
export function ShakeError({ 
  children, 
  error = false, 
  className 
}: { 
  children: React.ReactNode; 
  error?: boolean; 
  className?: string;
}) {
  return (
    <motion.div
      animate={error ? "visible" : "hidden"}
      variants={shake}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Success checkmark animation that appears and fades away
export function SuccessCheckmark({ 
  show = false,
  className,
  onComplete
}: { 
  show: boolean;
  className?: string;
  onComplete?: () => void;
}) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("fixed inset-0 flex items-center justify-center z-50 bg-black/20", className)}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.1
            }}
            className="bg-white rounded-full p-4 shadow-lg"
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A subtle flash animation for row/item updates
export function FlashUpdate({ 
  children,
  trigger,
  className
}: { 
  children: React.ReactNode;
  trigger: any; // Value that when changed will trigger animation
  className?: string;
}) {
  return (
    <motion.div
      key={JSON.stringify(trigger)} // Re-render animation when trigger changes
      initial={{ backgroundColor: "#ecfdf5" }}
      animate={{ backgroundColor: "transparent" }}
      transition={{ duration: 1.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}