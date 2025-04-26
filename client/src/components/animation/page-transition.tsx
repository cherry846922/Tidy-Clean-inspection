import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

// Wrapper for list items to create staggered animations
interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
}

export function StaggeredList({ 
  children, 
  className,
  staggerDelay = 0.05,
  itemClassName
}: StaggeredListProps) {
  // Create custom staggered container animation with configurable delay
  const customStaggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    }
  };

  // Wrap each child in a motion.div with staggerItem animation
  const wrappedChildren = React.Children.map(children, (child, index) => (
    <motion.div
      key={index}
      variants={staggerItem}
      className={itemClassName}
    >
      {child}
    </motion.div>
  ));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={customStaggerContainer}
      className={className}
    >
      {wrappedChildren}
    </motion.div>
  );
}