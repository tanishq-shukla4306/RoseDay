/**
 * TypingPanel Component
 * Holographic letter with typewriter animation
 * Displays the love letter with scanline effects
 */

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface TypingPanelProps {
  greeting: string;
  body: string;
  closing: string;
  isVisible: boolean;
}

export function TypingPanel({ greeting, body, closing, isVisible }: TypingPanelProps) {
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [displayedBody, setDisplayedBody] = useState('');
  const [displayedClosing, setDisplayedClosing] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset when visibility changes
  useEffect(() => {
    if (isVisible) {
      setDisplayedGreeting('');
      setDisplayedBody('');
      setDisplayedClosing('');
      setIsTypingComplete(false);
    }
  }, [isVisible]);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) return;

    const typeText = async () => {
      // Type greeting
      for (let i = 0; i <= greeting.length; i++) {
        setDisplayedGreeting(greeting.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Type body - faster for longer text
      for (let i = 0; i <= body.length; i++) {
        setDisplayedBody(body.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Type closing
      for (let i = 0; i <= closing.length; i++) {
        setDisplayedClosing(closing.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setIsTypingComplete(true);
    };

    typeText();
  }, [isVisible, greeting, body, closing]);

  // Entrance animation
  useEffect(() => {
    if (panelRef.current && isVisible) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      ref={panelRef}
      className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none p-4"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-strong rounded-2xl p-6 md:p-12 scanlines pointer-events-auto">
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 border-[#FF4D8D] opacity-60" />
        <div className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 border-[#FF4D8D] opacity-60" />
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-[#FF4D8D] opacity-60" />
        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-[#FF4D8D] opacity-60" />

        {/* Content */}
        <div className="space-y-4 md:space-y-6">
          {/* Greeting */}
          <h2 className="font-heading text-xl md:text-3xl lg:text-4xl text-[#FF4D8D] glow-text">
            {displayedGreeting}
            {!isTypingComplete && displayedGreeting === greeting && (
              <span className="typewriter-cursor" />
            )}
          </h2>

          {/* Body */}
          <p className="font-body text-sm md:text-base lg:text-lg text-[#F4F6FF] leading-relaxed whitespace-pre-wrap">
            {displayedBody}
            {displayedGreeting === greeting && displayedBody !== body && (
              <span className="typewriter-cursor" />
            )}
          </p>

          {/* Closing */}
          <p className="font-accent text-lg md:text-xl lg:text-2xl text-[#A7B0C8]">
            {displayedClosing}
            {displayedBody === body && displayedClosing !== closing && (
              <span className="typewriter-cursor" />
            )}
          </p>
        </div>

        {/* Glow border effect */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(255, 77, 141, 0.1), 0 0 40px rgba(255, 77, 141, 0.15)'
          }}
        />
      </div>
    </div>
  );
}
