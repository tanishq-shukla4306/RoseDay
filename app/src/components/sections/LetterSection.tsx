/**
 * LetterSection Component
 * Container for the typing panel hologram
 * Manages scroll-based visibility
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TypingPanel } from '../ui/TypingPanel';

gsap.registerPlugin(ScrollTrigger);

interface LetterSectionProps {
  greeting: string;
  body: string;
  closing: string;
}

export function LetterSection({ greeting, body, closing }: LetterSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          // Show panel during settle phase
          setIsVisible(self.progress > 0.25 && self.progress < 0.85);
        }
      }
    });

    return () => {
      scrollTl.kill();
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-10"
    >
      <TypingPanel 
        greeting={greeting}
        body={body}
        closing={closing}
        isVisible={isVisible}
      />
    </section>
  );
}
