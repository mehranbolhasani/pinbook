'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function AnimatedContainer({ 
  children, 
  className = '', 
  stagger = false 
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : undefined}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {stagger ? (
        <motion.div variants={staggerItem}>
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
}

export function AnimatedList({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
      layout
    >
      {children}
    </motion.div>
  );
}
