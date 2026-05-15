'use client';

import { motion, MotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedDivProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedDiv({ children, className, ...props }: AnimatedDivProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function AnimatedButton({ children, className, ...props }: AnimatedDivProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <button className={className}>{children}</button>;
  }

  return (
    <motion.button className={className} whileTap={{ scale: 0.96 }} {...props}>
      {children}
    </motion.button>
  );
}
