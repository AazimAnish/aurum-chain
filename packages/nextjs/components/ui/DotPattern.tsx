"use client";

import React, { useEffect, useId, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to combine class names with tailwind-merge
const cn = (...inputs: (string | undefined)[]) => {
  return twMerge(clsx(inputs));
};

/**
 *  DotPattern Component Props
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
  densityFactor?: number; // Added density factor to control dot density
  [key: string]: unknown;
}

/**
 * DotPattern Component
 *
 * A React component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 * Optimized for performance with reduced dot density and memoization.
 */
export function DotPattern({
  width = 16,
  height = 16,
  x: xOffset = 0,
  y: yOffset = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  densityFactor = 0.5, // Default density factor (higher = fewer dots)
  ...props
}: DotPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side rendering
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    // Run once on mount
    updateDimensions();
    
    // Debounce resize handler for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 200); // Increased debounce time for better performance
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoize dots to prevent unnecessary recalculations
  const dots = useMemo(() => {
    // Skip calculation if no dimensions yet
    if (dimensions.width === 0 || dimensions.height === 0) return [];
    
    // Calculate a reduced number of dots for better performance
    const adjustedWidth = width * densityFactor;
    const adjustedHeight = height * densityFactor;
    
    const maxDotCount = 350; // Reduced maximum dot count for better performance
    
    const cols = Math.ceil(dimensions.width / adjustedWidth);
    const rows = Math.ceil(dimensions.height / adjustedHeight);
    const totalDots = cols * rows;
    
    // If too many dots, increase the spacing to reduce count
    const scaleFactor = totalDots > maxDotCount ? Math.ceil(totalDots / maxDotCount) : 1;
    const finalCols = Math.ceil(cols / scaleFactor);
    const finalRows = Math.ceil(rows / scaleFactor);
    const finalWidth = adjustedWidth * scaleFactor;
    const finalHeight = adjustedHeight * scaleFactor;
    
    return Array.from(
      { length: finalCols * finalRows },
      (_, i) => {
        const col = i % finalCols;
        const row = Math.floor(i / finalCols);
        return {
          x: col * finalWidth + cx + xOffset,
          y: row * finalHeight + cy + yOffset,
          delay: Math.random() * 2, // Reduced delay range
          duration: Math.random() * 2 + 1.5, // Slightly reduced duration
        };
      },
    );
  }, [dimensions, width, height, cx, cy, xOffset, yOffset, densityFactor]);

  // Skip rendering if dimensions are not yet available
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <svg
        ref={containerRef}
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
        {...props}
      />
    );
  }
  
  // For better performance, don't animate too many dots
  const shouldAnimate = dots.length < 200;

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          className="text-neutral-400/80"
          initial={shouldAnimate && glow ? { opacity: 0.4, scale: 1 } : {}}
          animate={
            shouldAnimate && glow
              ? {
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.3, 1], // Reduced scale change for better performance
                }
              : {}
          }
          transition={
            shouldAnimate && glow
              ? {
                  duration: dot.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: dot.delay,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
    </svg>
  );
} 