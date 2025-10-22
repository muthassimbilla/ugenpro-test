"use client";

import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = false,
  duration = 0.5,
  repeatInterval = 0, // Default to 0 to disable repetition
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  repeatInterval?: number;
}) => {
  const [scope, animate] = useAnimate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  let wordsArray = words.split(" ");
  
  const startAnimation = () => {
    if (hasAnimated && repeatInterval === 0) return; // Don't repeat if already animated and repeat is disabled
    if (!scope.current) return; // Check if scope is available
    
    setIsAnimating(true);
    
    // Reset all words to initial state
    animate(
      "span",
      {
        opacity: 0,
        filter: filter ? "blur(10px)" : "none",
      },
      {
        duration: 0.1,
      }
    );
    
    // Animate words one by one
    setTimeout(() => {
      if (!scope.current) return; // Double check before animation
      
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.2),
        }
      );
      setHasAnimated(true);
    }, 100);
  };
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (!isMounted || !scope.current) return;
    
    // Start initial animation only once
    if (!hasAnimated) {
      startAnimation();
    }
    
    // Only set up interval if repeatInterval is greater than 0
    let interval: NodeJS.Timeout | null = null;
    if (repeatInterval > 0) {
      interval = setInterval(() => {
        startAnimation();
      }, repeatInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMounted, scope.current, repeatInterval, hasAnimated]);

  const renderWords = () => {
    if (!isMounted) {
      return (
        <div className="dark:text-white text-black text-2xl leading-snug tracking-wide">
          {words}
        </div>
      );
    }
    
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="dark:text-white text-black opacity-0"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="dark:text-white text-black text-2xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
