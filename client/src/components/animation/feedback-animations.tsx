import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, X } from 'lucide-react';

interface FeedbackIndicatorProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
  duration?: number;
  onClose?: () => void;
}

export function FeedbackIndicator({
  visible,
  type,
  message,
  className,
  duration = 3000,
  onClose
}: FeedbackIndicatorProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'p-4 rounded-md border flex items-start space-x-2',
            getTypeStyles(),
            className
          )}
        >
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1">{message}</div>
          {onClose && (
            <button 
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ShakeErrorProps {
  shake: boolean;
  children: React.ReactNode;
  className?: string;
  onAnimationComplete?: () => void;
}

export function ShakeError({ shake, children, className, onAnimationComplete }: ShakeErrorProps) {
  return (
    <motion.div
      animate={shake ? 
        { x: [0, -10, 10, -10, 10, 0] } : 
        { x: 0 }
      }
      transition={{ duration: 0.5, type: 'spring' }}
      onAnimationComplete={onAnimationComplete}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SuccessCheckmarkProps {
  show: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onAnimationComplete?: () => void;
}

export function SuccessCheckmark({ 
  show, 
  className, 
  size = 'md', 
  color = 'green',
  onAnimationComplete 
}: SuccessCheckmarkProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colors = {
    green: 'text-green-500 bg-green-100',
    blue: 'text-blue-500 bg-blue-100',
    red: 'text-red-500 bg-red-100',
    amber: 'text-amber-500 bg-amber-100',
    purple: 'text-purple-500 bg-purple-100'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring', bounce: 0.5 }}
          onAnimationComplete={onAnimationComplete}
          className={cn(
            'rounded-full p-1 flex items-center justify-center',
            colors[color as keyof typeof colors],
            sizes[size],
            className
          )}
        >
          <Check className={cn('h-full w-full')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FlashUpdateProps {
  flash: boolean;
  children: React.ReactNode;
  className?: string;
  onAnimationComplete?: () => void;
}

export function FlashUpdate({ flash, children, className, onAnimationComplete }: FlashUpdateProps) {
  return (
    <motion.div
      animate={flash ? 
        { backgroundColor: ['transparent', 'rgba(250, 204, 21, 0.2)', 'transparent'] } : 
        { backgroundColor: 'transparent' }
      }
      transition={{ duration: 1 }}
      onAnimationComplete={onAnimationComplete}
      className={className}
    >
      {children}
    </motion.div>
  );
}