import { Transition, Variants } from 'motion/react';

export const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  duration: 0.3,
};

export const gentleTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  duration: 0.4,
};

export const fastTransition: Transition = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeInOut',
};

export const staggerFast = {
  staggerChildren: 0.05,
  delayChildren: 0.05,
};

export const staggerNormal = {
  staggerChildren: 0.08,
  delayChildren: 0.1,
};

export const staggerSlow = {
  staggerChildren: 0.12,
  delayChildren: 0.15,
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: fastTransition,
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentleTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: gentleTransition,
  },
};

export const listItem = (index: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...gentleTransition,
      delay: index * 0.04,
    },
  },
});

export const fadeInUpStaggered: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const hoverLift: Variants = {
  rest: {
    y: 0,
    transition: gentleTransition,
  },
  hover: {
    y: -2,
    transition: gentleTransition,
  },
};

export const buttonHover: Variants = {
  rest: {
    y: 0,
    transition: gentleTransition,
  },
  hover: {
    y: -1,
    transition: gentleTransition,
  },
  tap: {
    y: 0,
    transition: fastTransition,
  },
};

export const skeletonPulse = {
  opacity: [0.5, 0.8, 0.5],
  transition: {
    duration: 1.5,
    ease: 'easeInOut' as const,
    repeat: Infinity,
  },
};
