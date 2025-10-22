"use client"
import { useState, useEffect } from "react"

interface TextAnimationProps {
  words: string[]
  className?: string
  letterDelay?: number
  wordDelay?: number
}

export default function TextAnimation({
  words,
  className = "",
  letterDelay = 80,
  wordDelay = 1500,
}: TextAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentWord = words[currentWordIndex] || words[0]

  useEffect(() => {
    if (!isMounted || words.length <= 1) return

    console.log("Starting text animation with words:", words) // Debug log

    const interval = setInterval(() => {
      console.log("Changing word from index:", currentWordIndex) // Debug log
      
      // Fade out
      setIsVisible(false)
      
      setTimeout(() => {
        // Change word
        setCurrentWordIndex((prev) => {
          const nextIndex = (prev + 1) % words.length
          console.log("Next word index:", nextIndex, "Word:", words[nextIndex]) // Debug log
          return nextIndex
        })
        
        // Fade in
        setTimeout(() => {
          setIsVisible(true)
        }, 100)
      }, 200)
    }, wordDelay)

    return () => {
      console.log("Clearing interval") // Debug log
      clearInterval(interval)
    }
  }, [words, wordDelay, isMounted, currentWordIndex])

  if (!isMounted) {
    return (
      <div className={`inline-flex ${className}`}>
        {words[0]}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {currentWord}
    </div>
  )
}
