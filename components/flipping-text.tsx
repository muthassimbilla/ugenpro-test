"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface FlippingTextProps {
  text: string
  words: string[]
  duration?: number
}

export function FlippingText({ text, words, duration = 3000 }: FlippingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (words.length <= 1) return

    const interval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        setIsVisible(true)
      }, 250)
    }, duration)

    return () => clearInterval(interval)
  }, [words.length, duration])

  const currentWord = words[currentWordIndex] || words[0]

  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-balance">
        <span>{text}</span>
      </h1>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            style={{
              willChange: "transform, opacity",
              transform: "translateZ(0)",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              backfaceVisibility: "hidden",
            }}
            className="gradient-text-rainbow inline-block"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </h1>
    </div>
  )
}
