import React from "react";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./page-transition";
import { useAnimation } from "@/contexts/animation-context";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const { isAnimationEnabled } = useAnimation();
  
  // If animations are disabled, render the children directly
  if (!isAnimationEnabled) {
    return <div className={className}>{children}</div>;
  }
  
  // Otherwise, apply the page transition animations
  return (
    <AnimatePresence mode="wait">
      <PageTransition className={className}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}