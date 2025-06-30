import React, { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per word
  className?: string;
  onComplete?: () => void;
  isActive?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 100, className = "", onComplete, isActive = true }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const originalTextRef = useRef("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setCurrentWordIndex(0);
      originalTextRef.current = "";
      return;
    }

    const words = text.split(" ");

    // If not active, show full text immediately
    if (!isActive) {
      setDisplayedText(text);
      setCurrentWordIndex(words.length);
      originalTextRef.current = text;
      return;
    }

    // Only reset if this is completely new text (not a streaming update)
    if (originalTextRef.current === "" || !text.startsWith(originalTextRef.current)) {
      setDisplayedText("");
      setCurrentWordIndex(0);
      originalTextRef.current = text;
    }

    // Only reset if text got shorter (which shouldn't happen during streaming)
    if (currentWordIndex > words.length) {
      setCurrentWordIndex(0);
      setDisplayedText("");
    }

    if (currentWordIndex < words.length) {
      timeoutRef.current = window.setTimeout(() => {
        const newText = words.slice(0, currentWordIndex + 1).join(" ");
        setDisplayedText(newText);
        setCurrentWordIndex((prev) => prev + 1);
      }, speed);
    } else if (onComplete && isActive) {
      onComplete();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentWordIndex, text, speed, isActive, onComplete]);

  return <span className={`${className} transition-opacity duration-200`}>{displayedText}</span>;
};

export default TypewriterText;
