import React from "react";
import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buttonTap } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  className?: string;
  animateOnHover?: boolean;
  animateOnTap?: boolean;
}

export function AnimatedButton({
  children,
  className,
  animateOnHover = true,
  animateOnTap = true,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={animateOnHover ? { scale: 1.05 } : undefined}
      whileTap={animateOnTap ? buttonTap : undefined}
      className="inline-block"
    >
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}

// Animated icon button with a pulse animation for notifications or alerts
export function AnimatedIconButton({
  children,
  className,
  pulsing = false,
  ...props
}: AnimatedButtonProps & { pulsing?: boolean }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={buttonTap}
      animate={pulsing ? {
        scale: [1, 1.1, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }
      } : undefined}
      className="inline-block"
    >
      <Button
        variant="ghost"
        className={cn("rounded-full p-2 h-auto", className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}