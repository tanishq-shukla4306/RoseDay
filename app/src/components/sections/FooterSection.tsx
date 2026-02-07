/**
 * FooterSection Component
 * Flowing footer with contact info and credits
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function FooterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    // Reveal animation for flowing section
    gsap.fromTo(content.children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, []);

  return (
    <footer 
      ref={sectionRef}
      className="relative z-10 py-16 md:py-24 px-6"
    >
      <div 
        ref={contentRef}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        {/* CTA */}
        <div className="space-y-4">
          <h3 className="font-heading text-2xl md:text-3xl text-[#F4F6FF]">
            Want to create a universe for someone you love?
          </h3>
          <p className="font-body text-[#A7B0C8] max-w-lg mx-auto">
            This experience can be personalized with your photos, words, and stars.
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 border border-[#FF4D8D] text-[#FF4D8D] rounded-full font-heading text-sm uppercase tracking-widest hover:bg-[#FF4D8D] hover:text-white transition-colors mt-4">
            <Sparkles size={16} />
            Start Your Universe
          </button>
        </div>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent mx-auto opacity-50" />

        {/* Contact */}
        <div className="flex items-center justify-center gap-2 text-[#A7B0C8]">
          <Mail size={16} />
          <a 
            href="mailto:hello@ouruniverse.story" 
            className="hover:text-[#FF4D8D] transition-colors"
          >
            hello@ouruniverse.story
          </a>
        </div>

        {/* Copyright */}
        <p className="font-body text-sm text-[#A7B0C8] opacity-60">
          © 2026 Our Universe. Built with stardust.
        </p>
      </div>
    </footer>
  );
}
