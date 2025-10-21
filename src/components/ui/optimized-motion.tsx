'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode, memo } from 'react';

interface OptimizedMotionProps extends MotionProps {
  children: ReactNode;
  className?: string;
  reduceMotion?: boolean;
}

export const OptimizedMotion = memo(({ 
  children, 
  className, 
  reduceMotion = false,
  ...props 
}: OptimizedMotionProps) => {
  // Respect user's motion preferences
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

OptimizedMotion.displayName = 'OptimizedMotion';

// Pre-configured optimized components
export const OptimizedCard = memo(({ children, ...props }: OptimizedMotionProps) => (
  <OptimizedMotion
    layout
    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    {...props}
  >
    {children}
  </OptimizedMotion>
));

OptimizedCard.displayName = 'OptimizedCard';

export const OptimizedList = memo(({ children, ...props }: OptimizedMotionProps) => (
  <OptimizedMotion
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, staggerChildren: 0.1 }}
    {...props}
  >
    {children}
  </OptimizedMotion>
));

OptimizedList.displayName = 'OptimizedList';

export const OptimizedListItem = memo(({ children, ...props }: OptimizedMotionProps) => (
  <OptimizedMotion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </OptimizedMotion>
));

OptimizedListItem.displayName = 'OptimizedListItem';
