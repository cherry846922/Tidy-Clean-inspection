import React, { createContext, useContext, useState, useCallback } from 'react';

type AnimationPreference = 'full' | 'reduced' | 'disabled';

interface AnimationContextType {
  preference: AnimationPreference;
  isAnimationEnabled: boolean;
  isReducedMotion: boolean;
  setPreference: (preference: AnimationPreference) => void;
  toggleAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  // Check browser settings for reduced motion preference
  const preferReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Default to browser preference: full if not reduced, reduced if browser prefers reduced
  const defaultPreference: AnimationPreference = preferReducedMotion ? 'reduced' : 'full';
  
  // Try to load from localStorage if available
  const [preference, setPreferenceState] = useState<AnimationPreference>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('animation-preference');
      return (saved as AnimationPreference) || defaultPreference;
    }
    return defaultPreference;
  });

  const isAnimationEnabled = preference !== 'disabled';
  const isReducedMotion = preference === 'reduced';

  const setPreference = useCallback((newPreference: AnimationPreference) => {
    setPreferenceState(newPreference);
    if (typeof window !== 'undefined') {
      localStorage.setItem('animation-preference', newPreference);
    }
  }, []);

  const toggleAnimation = useCallback(() => {
    setPreference(
      preference === 'full' 
        ? 'reduced' 
        : preference === 'reduced' 
        ? 'disabled' 
        : 'full'
    );
  }, [preference, setPreference]);

  return (
    <AnimationContext.Provider
      value={{
        preference,
        isAnimationEnabled,
        isReducedMotion,
        setPreference,
        toggleAnimation
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}