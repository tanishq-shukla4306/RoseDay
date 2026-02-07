/**
 * MemoryModal Component
 * Fullscreen modal for displaying memory details
 * Shows photo fullscreen with overlay text
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Calendar, Heart } from 'lucide-react';

interface MemoryModalProps {
  memory: {
    id: number;
    title: string;
    date: string;
    image: string;
    message: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryModal({ memory, isOpen, onClose }: MemoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current && imageRef.current && contentRef.current) {
      // Entrance animation
      gsap.fromTo(modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(imageRef.current,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && imageRef.current && contentRef.current) {
      gsap.to([contentRef.current, imageRef.current], {
        opacity: 0,
        y: 20,
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  if (!isOpen || !memory) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[100]"
      style={{ backgroundColor: 'rgba(11, 13, 23, 0.95)' }}
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-[101] w-12 h-12 rounded-full glass flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Fullscreen Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          ref={imageRef}
          src={memory.image} 
          alt={memory.title}
          className="max-w-full max-h-full object-contain"
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Overlay Content */}
      <div 
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
        style={{
          background: 'linear-gradient(to top, rgba(11, 13, 23, 0.95) 0%, rgba(11, 13, 23, 0.7) 60%, transparent 100%)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto">
          {/* Title section */}
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-[#FF4D8D]" />
            <span className="text-[#FF4D8D] text-sm font-medium uppercase tracking-wider">
              Memory
            </span>
          </div>

          <h2 className="font-heading text-2xl md:text-4xl text-[#F4F6FF] mb-2">
            {memory.title}
          </h2>

          <div className="flex items-center gap-2 text-[#A7B0C8] text-sm mb-4">
            <Calendar size={14} />
            <span>{memory.date}</span>
          </div>

          {/* Message */}
          <div className="glass rounded-xl p-4 md:p-6">
            <p className="font-body text-[#F4F6FF] leading-relaxed text-base md:text-lg">
              "{memory.message}"
            </p>
          </div>
        </div>
      </div>

      {/* Tap to close hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[#A7B0C8] text-sm">
        Tap anywhere to close
      </div>
    </div>
  );
}
