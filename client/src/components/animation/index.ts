// Export all animation components for easier imports

// Animation components
export { AnimatedCard } from './animated-card';
export { AnimatedButton, AnimatedIconButton } from './animated-button';
export { PageWrapper } from './PageWrapper';
export { PageTransition, StaggeredList } from './page-transition';
export { 
  FeedbackIndicator, 
  ShakeError, 
  SuccessCheckmark, 
  FlashUpdate 
} from './feedback-animations';
export { AnimatedList } from './animated-list';
export { LoadingAnimation, DelayedLoadingAnimation } from './loading-animation';
export { AnimatedNotification } from './animated-notification';

// Animation context provider and hook
export { AnimationProvider, useAnimation } from '@/contexts/animation-context';

// Animation toggle component
export { AnimationToggle } from './AnimationToggle';

// Animation utilities
export * from '@/lib/animations';