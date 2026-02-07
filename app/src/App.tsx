/**
 * Our Universe - Main App Component
 * 
 * A cinematic 3D love experience featuring:
 * - Scroll-driven animations with GSAP ScrollTrigger
 * - Three.js 3D scenes with React Three Fiber
 * - Growing rose, memory orbs, constellation heart
 * - Typewriter love letter hologram
 * - Ambient sound with toggle
 * - Interactive rose that blooms and explodes
 * 
 * Architecture:
 * - Fixed 3D canvas background
 * - Scrollable section containers with pinned triggers
 * - UI overlays for text and interactions
 */

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Import styles
import './styles/globals.css';

// Import data
import memoriesData from './data/memories.json';

// Import 3D Scene (lazy loaded for performance)
const Scene = lazy(() => import('./components/3d/Scene').then(m => ({ default: m.Scene })));

// Import sections
import { HeroSection } from './components/sections/HeroSection';
import { RoseSection } from './components/sections/RoseSection';
import { MemorySection } from './components/sections/MemorySection';
import { LetterSection } from './components/sections/LetterSection';
import { HeartSection } from './components/sections/HeartSection';
import { ClosingSection } from './components/sections/ClosingSection';
import { FooterSection } from './components/sections/FooterSection';

// Import UI components
import { MemoryModal } from './components/ui/MemoryModal';
import { SoundToggle } from './components/ui/SoundToggle';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function App() {
  // State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedMemory, setSelectedMemory] = useState<typeof memoriesData.memories[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Refs
  const mainRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  // Track scroll progress for 3D scene
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, scrollTop / docHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Initialize GSAP global snap after all sections are mounted
  useEffect(() => {
    // Small delay to ensure all ScrollTriggers are created
    const timer = setTimeout(() => {
      setIsLoaded(true);
      
      // Get all pinned ScrollTriggers and sort by start position
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      // Build ranges and snap targets from pinned sections
      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Create global snap
      const globalSnap = ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            // Check if within any pinned range (allow small buffer)
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            
            if (!inPinned) return value; // Flowing section: free scroll

            // Find nearest pinned center
            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );

            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });

      triggersRef.current.push(globalSnap);
    }, 500);

    return () => {
      clearTimeout(timer);
      triggersRef.current.forEach(st => st.kill());
      triggersRef.current = [];
    };
  }, []);

  // Handle memory orb click
  const handleMemoryClick = (memory: typeof memoriesData.memories[0]) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMemory(null), 300);
  };

  return (
    <div ref={mainRef} className="relative min-h-screen bg-[#0B0D17] overflow-x-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Persistent header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-4">
        <div className="font-heading text-xs md:text-sm text-[#F4F6FF] tracking-wider">
          Our Universe
        </div>
        <SoundToggle />
      </header>

      {/* 3D Scene Background */}
      <Suspense fallback={
        <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#0B0D17]">
          <div className="text-[#FF4D8D] text-sm">Loading universe...</div>
        </div>
      }>
        <Scene 
          scrollProgress={scrollProgress}
          memories={memoriesData.memories}
          onMemoryClick={handleMemoryClick}
        />
      </Suspense>

      {/* Scrollable Content Overlay */}
      <main className="relative z-10">
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Rose */}
        <RoseSection />

        {/* Section 3: Memory Orbs */}
        <MemorySection />

        {/* Section 4: Love Letter */}
        <LetterSection 
          greeting={memoriesData.loveLetter.greeting}
          body={memoriesData.loveLetter.body}
          closing={memoriesData.loveLetter.closing}
        />

        {/* Section 5: Constellation Heart */}
        <HeartSection 
          message={memoriesData.heartMessage}
        />

        {/* Section 6: Closing with Interactive Rose */}
        <ClosingSection 
          finalMessage={memoriesData.finalMessage}
        />

        {/* Section 7: Footer */}
        <FooterSection />
      </main>

      {/* Memory Modal - Fullscreen */}
      <MemoryModal 
        memory={selectedMemory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D17]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#A7B0C8] text-sm">Entering the universe...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
