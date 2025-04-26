import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useAnimation } from "@/contexts/animation-context";
import { cn } from "@/lib/utils";

interface AnimatedListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  emptyState?: React.ReactNode;
  containerTag?: "ul" | "div";
  loading?: boolean;
  loadingItemCount?: number;
  loadingItem?: React.ReactNode;
}

export function AnimatedList({
  items,
  renderItem,
  className,
  itemClassName,
  emptyState,
  containerTag = "ul",
  loading = false,
  loadingItemCount = 3,
  loadingItem
}: AnimatedListProps) {
  const { isAnimationEnabled, isReducedMotion } = useAnimation();
  
  // If we're in a loading state, display skeleton items
  if (loading) {
    return React.createElement(
      containerTag,
      { className },
      Array(loadingItemCount)
        .fill(0)
        .map((_, index) => (
          <motion.li
            key={`loading-${index}`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                repeat: Infinity,
                duration: 1.5,
                delay: isReducedMotion ? 0 : index * 0.1
              }
            }}
            className={itemClassName}
          >
            {loadingItem || (
              <div className="h-24 bg-gray-200 rounded-md animate-pulse" />
            )}
          </motion.li>
        ))
    );
  }
  
  // If there are no items and we're not loading, show empty state
  if (items.length === 0 && !loading) {
    return (
      <div className={cn("flex justify-center items-center py-8", className)}>
        {emptyState || (
          <p className="text-gray-500 italic">No items to display</p>
        )}
      </div>
    );
  }
  
  // If animations are disabled, simply render the items
  if (!isAnimationEnabled) {
    return React.createElement(
      containerTag,
      { className },
      items.map((item, index) => (
        <li key={item.id || index} className={itemClassName}>
          {renderItem(item, index)}
        </li>
      ))
    );
  }

  // For reduced motion, use simpler animations
  const variants = isReducedMotion 
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }
    : { ...staggerContainer };
  
  const itemVariants = isReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.3 }
        }
      }
    : { ...staggerItem };

  // Use motion.div or motion.ul directly instead of dynamic component
  return containerTag === 'ul' ? (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id || index}
          variants={itemVariants}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </motion.li>
      ))}
    </motion.ul>
  ) : (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          variants={itemVariants}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}