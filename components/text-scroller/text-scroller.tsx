// src/components/TextScroller/TextScroller.tsx
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface TextScrollerProps {
  children: React.ReactNode; // Accepts any React nodes
  duration?: number; // Duration of the scroll animation in seconds
  gap?: number; // Gap below the content (if content is shorter than scroller)
}

/**
 * A React component that animates its children to scroll upwards once.
 * The animation starts on render, pauses on hover, and allows manual scrolling after completion.
 *
 * @param {TextScrollerProps} props - The props for the text scroller.
 * @returns {JSX.Element} The JSX element for the scrolling content.
 */
const TextScroller: React.FC<TextScrollerProps> = ({
  children,
  duration = 20,
  gap = 50,
}) => {
  const scrollerContainerRef = useRef<HTMLDivElement>(null); // Reference to the fixed viewport
  const contentWrapperRef = useRef<HTMLDivElement>(null); // Reference to the div that holds the content and gets animated
  const animationRef = useRef<gsap.core.Tween | null>(null); // Ref to store the GSAP animation instance

  // State to control overflow property after animation
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (!scrollerContainerRef.current || !contentWrapperRef.current) return;

    const scrollerHeight = scrollerContainerRef.current.offsetHeight;

    // Use requestAnimationFrame to ensure children are rendered and measured accurately
    const rafId = requestAnimationFrame(() => {
      if (!contentWrapperRef.current || !scrollerContainerRef.current) return;

      const totalContentHeight = contentWrapperRef.current.offsetHeight;

      // Kill any existing animation before creating a new one
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Initial position: start below the visible area
      gsap.set(contentWrapperRef.current, { y: scrollerHeight });

      // Determine target Y position:
      // If content is taller than scroller, scroll up until its top is at (scrollerHeight - totalContentHeight)
      // (i.e., last line is visible at the bottom of the container).
      // If content is shorter, just scroll until its top is at 0 (fully visible at the top).
      const targetY = Math.min(0, scrollerHeight - totalContentHeight - gap); // Account for gap at the bottom

      // Animate the content upwards to its final resting position
      animationRef.current = gsap.to(contentWrapperRef.current, {
        y: targetY,
        duration: duration,
        ease: 'power1.out', // Smooth ease for a single-pass animation
        onComplete: () => {
          setIsAnimationComplete(true); // Set state to enable scrolling
        },
      });
    });

    // Event handlers for pausing/resuming on hover
    const handleMouseEnter = () => {
      animationRef.current?.pause();
    };

    const handleMouseLeave = () => {
      animationRef.current?.play();
    };

    const containerElement = scrollerContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener('mouseenter', handleMouseEnter);
      containerElement.addEventListener('mouseleave', handleMouseLeave);
    }

    // Cleanup GSAP animation and event listeners on component unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      cancelAnimationFrame(rafId);
      if (containerElement) {
        containerElement.removeEventListener('mouseenter', handleMouseEnter);
        containerElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [children, duration, gap]); // Dependencies: re-run if children or animation props change

  // Basic structural styles for the scroller container and content wrapper
  const containerStyle: React.CSSProperties = {
    height: '400px', // Fixed height for the viewport
    overflow: isAnimationComplete ? 'auto' : 'hidden', // Auto scroll after animation
    position: 'relative', // For absolute positioning of content
  };

  const contentWrapperStyle: React.CSSProperties = {
    // This div directly contains the 'children' and will be animated
    // Its initial position is set by GSAP, then it moves.
    // No 'position: absolute' or 'top: 0' by default for contentWrapper in the render,
    // as GSAP will handle its 'y' transform.
    // It is important that contentWrapperRef is the direct target of GSAP's y animation.
    width: '100%',
    minHeight: '100%', // Ensure content can be at least as tall as container for initial measurements
    boxSizing: 'border-box', // Include padding in width/height calculation
  };

  return (
    <div ref={scrollerContainerRef} style={containerStyle} className="mb-4 p-4">
      <div ref={contentWrapperRef} style={contentWrapperStyle}>
        {children} {/* Render the children directly */}
        {/* Add a transparent block at the bottom for the gap, which contributes to totalContentHeight */}
        <div style={{ height: `${gap}px` }}></div>
      </div>
    </div>
  );
};

export default TextScroller;
