import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAnimation } from "@/contexts/animation-context";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullscreen?: boolean;
}

export function LoadingAnimation({
  size = "md",
  className,
  text = "Loading...",
  fullscreen = false,
}: LoadingAnimationProps) {
  const { isAnimationEnabled } = useAnimation();
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  
  // If animations are disabled, show a simple static loading indicator
  if (!isAnimationEnabled) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          fullscreen ? "fixed inset-0 bg-white/80 z-50" : "",
          className
        )}
      >
        <Loader2 className={cn(sizeClasses[size], "text-primary")} />
        {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullscreen ? "fixed inset-0 bg-white/80 z-50" : "",
        className
      )}
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Loader2 className={cn(sizeClasses[size], "text-primary")} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm text-gray-500"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Loading spinner that appears only after a delay
// Useful for operations that might be fast so you don't want to flash a spinner
export function DelayedLoadingAnimation({
  delay = 500,
  ...props
}: LoadingAnimationProps & { delay?: number }) {
  const [showSpinner, setShowSpinner] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!showSpinner) return null;
  
  return <LoadingAnimation {...props} />;
}