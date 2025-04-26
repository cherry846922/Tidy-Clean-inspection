import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { scaleIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  cardContentClassName?: string;
  cardHeaderClassName?: string;
  cardFooterClassName?: string;
  variant?: "default" | "hover" | "interactive";
}

export function AnimatedCard({
  children,
  className,
  header,
  footer,
  cardContentClassName,
  cardHeaderClassName,
  cardFooterClassName,
  variant = "default",
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleIn}
      whileHover={variant === "hover" || variant === "interactive" ? { scale: 1.02 } : undefined}
      whileTap={variant === "interactive" ? { scale: 0.98 } : undefined}
      className={cn("h-full", className)}
      {...props}
    >
      <Card className="h-full">
        {header && <CardHeader className={cardHeaderClassName}>{header}</CardHeader>}
        <CardContent className={cn("pt-4", cardContentClassName)}>{children}</CardContent>
        {footer && <CardFooter className={cardFooterClassName}>{footer}</CardFooter>}
      </Card>
    </motion.div>
  );
}