'use client';

import { motion, MotionProps, Transition } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerNormal, staggerFast, staggerSlow } from '@/lib/animations';

interface StaggerContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'ol' | 'section';
  speed?: 'fast' | 'normal' | 'slow';
}

const staggerMap = {
  fast: staggerFast,
  normal: staggerNormal,
  slow: staggerSlow,
};

export function StaggerContainer({
  children,
  className,
  as: Component = 'div',
  speed = 'normal',
  ...props
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = Component;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[Component];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: staggerMap[speed] as Transition,
        },
      }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
