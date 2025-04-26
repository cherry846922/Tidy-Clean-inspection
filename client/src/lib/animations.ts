import { Variants } from "framer-motion";

// Fade in animation that can be used with framer-motion
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Scale and fade in animation for cards and modal components
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Slide in from bottom - good for toast notifications or action feedback
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30 
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Slide in from right - good for panel openings
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30 
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  }
};

// Slide in from left - alternative for panel openings
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30 
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

// Staggered children animation - good for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

// Item animation for use with staggered containers
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.2 }
  }
};

// Bounce animation - great for notifications or attention grabbing elements
export const bounce: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  exit: { 
    scale: 0,
    transition: { duration: 0.2 }
  }
};

// Pulse animation - subtle attention grabber
export const pulse = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse" as const
  }
};

// Shake animation - for error states or warnings
export const shake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4 }
  }
};

// Flash color animation - useful for success/error feedback
export const flashSuccess = {
  backgroundColor: ["#ffffff", "#ecfdf5", "#ffffff"],
  transition: { duration: 1.5 }
};

export const flashError = {
  backgroundColor: ["#ffffff", "#fef2f2", "#ffffff"],
  transition: { duration: 1.5 }
};

// Initial load animation for page content
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Button click animation
export const buttonTap = {
  scale: 0.98,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 20
  }
};

// Hover animation for interactive elements
export const hoverScale = {
  scale: 1.03,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 20
  }
};

// Subtle movement animation for backgrounds or decorative elements
export const subtleFloat = {
  y: [0, -5, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut"
  }
};

// Rotating animation - good for loading indicators
export const rotate = {
  rotate: 360,
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear"
  }
};