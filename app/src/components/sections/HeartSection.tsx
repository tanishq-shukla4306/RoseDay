/**
 * HeartSection Component
 * Constellation heart reveal with promise message
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeartSectionProps {
  message: string;
}

export function HeartSection({ message }: HeartSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const messageEl = messageRef.current;
    if (!section || !messageEl) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=140%',
        pin: true,
        scrub: 0.6,
      }
    });

    // ENTRANCE (0% - 30%)
    scrollTl.fromTo(messageEl,
      { opacity: 0, scale: 0.92, y: 20 },
      { opacity: 1, scale: 1, y: 0, ease: 'none' },
      0
    );

    // SETTLE (30% - 70%): Hold with subtle breathing handled by 3D component

    // EXIT (70% - 100%)
    scrollTl.fromTo(messageEl,
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in' },
      0.70
    );

    return () => {
      scrollTl.kill();
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned flex flex-col items-center justify-center z-10 pointer-events-none px-6"
    >
      <p 
        ref={messageRef}
        className="font-accent text-2xl md:text-4xl lg:text-5xl text-[#F4F6FF] text-center max-w-4xl leading-relaxed opacity-0"
      >
        <span className="text-[#FF4D8D] glow-text">{message}</span>
      </p>
    </section>
  );
}
