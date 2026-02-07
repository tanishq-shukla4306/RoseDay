/**
 * HeroSection Component
 * Opening scene with title and cosmic intro
 * Fade out on scroll to reveal the 3D scene
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onEnterClick?: () => void;
}

export function HeroSection({ onEnterClick }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Entrance animation on mount
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.6'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(scrollHintRef.current,
      { opacity: 0 },
      { opacity: 0.7, duration: 0.5 },
      '-=0.2'
    );

    // Floating animation for scroll hint
    gsap.to(scrollHintRef.current, {
      y: 8,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  // Scroll-driven exit animation
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
        onLeaveBack: () => {
          // Reset elements when scrolling back to top
          gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
            opacity: 1,
            y: 0,
            x: 0
          });
        }
      }
    });

    // EXIT phase (70% - 100%)
    scrollTl.fromTo(titleRef.current,
      { opacity: 1, y: 0 },
      { opacity: 0, y: '-18vh', ease: 'power2.in' },
      0.70
    )
    .fromTo(subtitleRef.current,
      { opacity: 1, y: 0 },
      { opacity: 0, y: '-12vh', ease: 'power2.in' },
      0.72
    )
    .fromTo(ctaRef.current,
      { opacity: 1, y: 0 },
      { opacity: 0, y: '-10vh', ease: 'power2.in' },
      0.74
    )
    .fromTo(scrollHintRef.current,
      { opacity: 0.7 },
      { opacity: 0 },
      0.70
    );

    return () => {
      scrollTl.kill();
    };
  }, []);

  const handleEnterClick = () => {
    // Scroll to rose section (approximately 15% of total scroll)
    const maxScroll = ScrollTrigger.maxScroll(window);
    if (maxScroll) {
      gsap.to(window, {
        scrollTo: maxScroll * 0.15,
        duration: 1.5,
        ease: 'power2.inOut'
      });
    }
    onEnterClick?.();
  };

  return (
    <section 
      ref={sectionRef}
      className="section-pinned flex items-center justify-center z-10"
    >
      <div className="text-center px-4">
        {/* Main title */}
        <h1 
          ref={titleRef}
          className="font-heading text-5xl md:text-7xl lg:text-8xl text-[#F4F6FF] mb-6 tracking-wide"
        >
          Our <span className="text-[#FF4D8D] glow-text">Universe</span>
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="font-body text-lg md:text-xl text-[#A7B0C8] mb-10 max-w-md mx-auto"
        >
          A love story written in stars.
        </p>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          onClick={handleEnterClick}
          className="px-8 py-4 bg-transparent border-2 border-[#FF4D8D] text-[#FF4D8D] rounded-full font-heading text-sm uppercase tracking-widest hover:bg-[#FF4D8D] hover:text-white transition-all duration-300 glow-pink"
        >
          Begin the Journey
        </button>

        {/* Scroll hint */}
        <div 
          ref={scrollHintRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[#A7B0C8] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={20} className="text-[#A7B0C8]" />
        </div>
      </div>

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(11, 13, 23, 0.5) 100%)'
        }}
      />
    </section>
  );
}
