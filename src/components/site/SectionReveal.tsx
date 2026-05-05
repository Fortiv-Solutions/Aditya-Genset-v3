import React, { useRef, ElementType } from "react";
import { motion, useInView, Variants, HTMLMotionProps } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { useCMSState } from "../cms/CMSEditorProvider";

/* ─── Shared easing ────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Variants library ─────────────────────────────────── */
const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 100, scale: 0.95 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1.0, ease: EASE, delay: custom / 1000 },
    }),
  },
  fadeDown: {
    hidden: { opacity: 0, y: -100, scale: 0.95 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1.0, ease: EASE, delay: custom / 1000 },
    }),
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: { duration: 0.7, ease: EASE, delay: custom / 1000 },
    }),
  },
  slideLeft: {
    hidden: { opacity: 0, x: -100, scale: 0.95, rotate: -1 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.9, ease: EASE, delay: custom / 1000 },
    }),
  },
  slideRight: {
    hidden: { opacity: 0, x: 100, scale: 0.95, rotate: 1 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.9, ease: EASE, delay: custom / 1000 },
    }),
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
    visible: (custom: number) => ({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: EASE, delay: custom / 1000 },
    }),
  },
};

export type RevealVariant = keyof typeof variants;

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  as?: ElementType;
  threshold?: number;
}

/**
 * SectionReveal — wraps children in a Framer Motion whileInView reveal.
 * Respects prefers-reduced-motion automatically.
 */
export function SectionReveal({
  children,
  className,
  delay = 0,
  variant = "fadeUp",
  as: Tag = "div",
  threshold = 0.1,
}: SectionRevealProps) {
  const reduced = useReducedMotion();
  const { isEditMode } = useCMSState();
  const MotionTag = motion[Tag as keyof typeof motion] as React.ComponentType<HTMLMotionProps<"div">>;

  if (reduced) {
    return (
      <MotionTag className={className}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      style={{ willChange: "transform, opacity" }}
      variants={variants[variant]}
      initial={isEditMode ? "visible" : "hidden"}
      whileInView="visible"
      animate={isEditMode ? "visible" : undefined}
      viewport={isEditMode ? undefined : { once: false, amount: threshold }}
      custom={delay}
    >
      {children}
    </MotionTag>
  );
}

/* ─── StaggerReveal ─────────────────────────────────────── */
/**
 * StaggerReveal — wraps a list of children so each child reveals
 * one by one with a configurable stagger interval.
 * Children MUST be motion-aware (or plain elements — we wrap them).
 */

const containerVariants = (staggerMs: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerMs / 1000 },
  },
});

const childVariant: Variants = {
  hidden: { opacity: 0, y: 20, transition: { duration: 0.3, ease: EASE } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

interface StaggerRevealProps {
  children: React.ReactNode[];
  className?: string;
  staggerMs?: number;
  threshold?: number;
  as?: ElementType;
}

export function StaggerReveal({
  children,
  className,
  staggerMs = 80,
  threshold = 0.08,
  as: Tag = "div",
}: StaggerRevealProps) {
  const reduced = useReducedMotion();
  const { isEditMode } = useCMSState();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: threshold });

  const MotionTag = motion[Tag as keyof typeof motion] as React.ComponentType<HTMLMotionProps<"div">>;

  if (reduced) {
    return <MotionTag ref={ref} className={className}>{children}</MotionTag>;
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{ willChange: "transform, opacity" }}
      variants={containerVariants(staggerMs)}
      initial={isEditMode ? "visible" : "hidden"}
      animate={(inView || isEditMode) ? "visible" : "hidden"}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={childVariant}>
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
}
