/**
 * MemorySection Component
 * Title and instruction for the memory orbit scene
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function MemorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const instructionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const instruction = instructionRef.current;
    if (!section || !title || !instruction) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 0.6,
      }
    });

    // ENTRANCE (0% - 30%)
    scrollTl.fromTo(title,
      { opacity: 0, y: '-10vh' },
      { opacity: 1, y: 0, ease: 'none' },
      0
    )
    .fromTo(instruction,
      { opacity: 0, y: '-4vh' },
      { opacity: 1, y: 0, ease: 'none' },
      0.05
    );

    // SETTLE (30% - 70%): Hold

    // EXIT (70% - 100%)
    scrollTl.fromTo([title, instruction],
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
      className="section-pinned flex flex-col items-center pt-20 z-10 pointer-events-none"
    >
      <h2 
        ref={titleRef}
        className="font-heading text-3xl md:text-5xl text-[#F4F6FF] mb-4 opacity-0"
      >
        Our <span className="text-[#FF4D8D]">Moments</span>
      </h2>
      
      <p 
        ref={instructionRef}
        className="font-body text-sm md:text-base text-[#A7B0C8] opacity-0"
      >
        Click an orb to remember.
      </p>
    </section>
  );
}
