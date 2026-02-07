/**
 * RoseSection Component
 * Shows the growing rose on asteroid
 * Caption appears and fades with scroll
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function RoseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const caption = captionRef.current;
    if (!section || !caption) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=140%',
        pin: true,
        scrub: 0.6,
      }
    });

    // ENTRANCE (0% - 30%): Caption fades in
    scrollTl.fromTo(caption,
      { opacity: 0, y: '6vh' },
      { opacity: 1, y: 0, ease: 'none' },
      0
    );

    // SETTLE (30% - 70%): Hold

    // EXIT (70% - 100%): Caption fades out
    scrollTl.fromTo(caption,
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
      className="section-pinned flex items-end justify-center pb-24 z-10 pointer-events-none"
    >
      {/* Caption at bottom */}
      <p 
        ref={captionRef}
        className="font-accent text-xl md:text-2xl text-[#F4F6FF] text-center max-w-lg px-6 opacity-0"
      >
        Even in the vastness, something beautiful grows.
      </p>
    </section>
  );
}
