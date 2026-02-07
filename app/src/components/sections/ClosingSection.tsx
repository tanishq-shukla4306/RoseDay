/**
 * ClosingSection Component
 * Final scene with interactive rose
 * Rose blooms on tap, explodes on 6th tap with falling petals
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ClosingSectionProps {
  finalMessage: string;
}

export function ClosingSection({ finalMessage }: ClosingSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const roseContainerRef = useRef<HTMLDivElement>(null);
  const petalsContainerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  
  const [tapCount, setTapCount] = useState(0);
  const [hasExploded, setHasExploded] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 0.6,
      }
    });

    // ENTRANCE (0% - 30%)
    scrollTl.fromTo(roseContainerRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, ease: 'none' },
      0
    );

    // SETTLE (30% - 70%): Hold

    // EXIT (70% - 100%)
    scrollTl.fromTo(roseContainerRef.current,
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in' },
      0.70
    );

    return () => {
      scrollTl.kill();
    };
  }, []);

  const handleRoseTap = () => {
    if (hasExploded) return;

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    const rose = roseContainerRef.current?.querySelector('.interactive-rose');
    if (rose) {
      // Bloom animation on each tap
      gsap.to(rose, {
        scale: 1 + newTapCount * 0.15,
        rotation: newTapCount * 5,
        duration: 0.4,
        ease: 'back.out(1.7)'
      });

      // Add glow intensity
      gsap.to(rose, {
        filter: `drop-shadow(0 0 ${20 + newTapCount * 10}px rgba(255, 77, 141, 0.8))`,
        duration: 0.3
      });
    }

    // Explode on 6th tap
    if (newTapCount >= 6) {
      setHasExploded(true);
      explodeRose();
    }
  };

  const explodeRose = () => {
    const rose = roseContainerRef.current?.querySelector('.interactive-rose');
    const petalsContainer = petalsContainerRef.current;
    const messageEl = messageRef.current;

    if (!rose || !petalsContainer) return;

    // Hide the rose
    gsap.to(rose, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });

    // Create falling petals
    const petalCount = 30;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'absolute w-4 h-4 rounded-full';
      petal.style.background = `linear-gradient(135deg, #FF4D8D 0%, #FF8FB3 100%)`;
      petal.style.left = '50%';
      petal.style.top = '50%';
      petal.style.transform = 'translate(-50%, -50%)';
      petalsContainer.appendChild(petal);

      // Random explosion direction
      const angle = (Math.PI * 2 * i) / petalCount + Math.random() * 0.5;
      const distance = 100 + Math.random() * 200;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance + 300; // Fall down

      gsap.to(petal, {
        x: endX,
        y: endY,
        rotation: Math.random() * 720 - 360,
        opacity: 0,
        duration: 2 + Math.random(),
        ease: 'power2.out',
        delay: i * 0.02,
        onComplete: () => petal.remove()
      });
    }

    // Show final message
    if (messageEl) {
      gsap.fromTo(messageEl,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.5, ease: 'elastic.out(1, 0.5)' }
      );
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="section-pinned flex flex-col items-center justify-center z-10"
    >
      {/* Rose Container */}
      <div 
        ref={roseContainerRef}
        className="relative flex flex-col items-center opacity-0"
      >
        {/* Tap instruction */}
        {!hasExploded && (
          <p className="font-body text-sm text-[#A7B0C8] mb-6 text-center">
            Tap the rose {6 - tapCount} more {6 - tapCount === 1 ? 'time' : 'times'} to bloom it 🌹
          </p>
        )}

        {/* Interactive Rose */}
        <div 
          className="interactive-rose cursor-pointer select-none transition-transform"
          onClick={handleRoseTap}
          style={{
            fontSize: 'clamp(80px, 20vw, 150px)',
            filter: 'drop-shadow(0 0 20px rgba(255, 77, 141, 0.5))'
          }}
        >
          🌹
        </div>

        {/* Tap hint */}
        {!hasExploded && tapCount === 0 && (
          <p className="font-accent text-lg text-[#FF4D8D] mt-4 animate-pulse">
            Tap me!
          </p>
        )}
      </div>

      {/* Petals container for explosion effect */}
      <div 
        ref={petalsContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />

      {/* Final Message */}
      <div 
        ref={messageRef}
        className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none"
      >
        <div className="text-center px-6">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl text-[#FF4D8D] glow-text mb-4">
            {finalMessage}
          </h2>
          <div className="flex justify-center gap-2 mt-6">
            <span className="text-2xl">💖</span>
            <span className="text-2xl">🌹</span>
            <span className="text-2xl">💖</span>
          </div>
        </div>
      </div>
    </section>
  );
}
