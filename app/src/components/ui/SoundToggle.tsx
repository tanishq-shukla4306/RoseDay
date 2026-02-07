/**
 * SoundToggle Component
 * Toggle button for ambient background music
 * Uses Howler.js for audio playback
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Howl } from 'howler';

interface SoundToggleProps {
  audioUrl?: string;
}

export function SoundToggle({ audioUrl }: SoundToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Create ambient sound using Howler
    // Using a gentle ambient pad sound
    const sound = new Howl({
      src: [audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'],
      loop: true,
      volume: 0.3,
      html5: true,
      onload: () => setIsLoaded(true),
      onloaderror: () => {
        console.warn('Audio load failed - continuing without sound');
        setIsLoaded(false);
      }
    });

    soundRef.current = sound;

    return () => {
      sound.unload();
    };
  }, [audioUrl]);

  const toggleSound = () => {
    if (!soundRef.current || !isLoaded) return;

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
    } else {
      soundRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="flex items-center gap-2 text-[#A7B0C8] hover:text-[#F4F6FF] transition-colors text-sm"
      disabled={!isLoaded}
    >
      {isPlaying ? (
        <>
          <Volume2 size={16} />
          <span className="hidden sm:inline">Sound on</span>
        </>
      ) : (
        <>
          <VolumeX size={16} />
          <span className="hidden sm:inline">Sound off</span>
        </>
      )}
    </button>
  );
}
