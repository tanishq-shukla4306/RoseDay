/**
 * Main 3D Scene Component
 * Orchestrates all 3D elements based on scroll progress
 * Manages camera movements and scene transitions
 */

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

import { StarField } from './StarField';
import { Rose } from './Rose';
import { Asteroid } from './Asteroid';
import { MemoryOrbitSystem } from './MemoryOrb';
import { ConstellationHeart } from './ConstellationHeart';

gsap.registerPlugin(ScrollTrigger);

interface SceneProps {
  scrollProgress: number;
  memories: Array<{
    id: number;
    title: string;
    date: string;
    image: string;
    message: string;
  }>;
  onMemoryClick: (memory: any) => void;
}

// Check if mobile
const isMobile = () => window.innerWidth < 768;

// Camera controller that responds to scroll
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const cameraRef = useRef(camera);
  const mobile = useMemo(() => isMobile(), []);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useFrame(() => {
    if (!cameraRef.current) return;

    // Define camera positions for each section
    // Section 1 (0-0.15): Wide view of space
    // Section 2 (0.15-0.30): Focus on rose/asteroid
    // Section 3 (0.30-0.50): Rose with orbiting memories
    // Section 4 (0.50-0.65): Close up for letter
    // Section 5 (0.65-0.80): Heart constellation
    // Section 6 (0.80-1.00): Wide view with CTA

    let targetPosition: THREE.Vector3;
    let targetLookAt: THREE.Vector3;

    // Mobile adjustments - closer camera
    const zOffset = mobile ? 3 : 0;

    if (scrollProgress < 0.15) {
      // Hero - wide cosmic view
      const t = scrollProgress / 0.15;
      targetPosition = new THREE.Vector3(
        0,
        2 + t * 2,
        15 - t * 5 + zOffset
      );
      targetLookAt = new THREE.Vector3(0, 0, 0);
    } else if (scrollProgress < 0.30) {
      // Rose reveal
      const t = (scrollProgress - 0.15) / 0.15;
      targetPosition = new THREE.Vector3(
        Math.sin(t * Math.PI) * (mobile ? 2 : 3),
        2 - t * 1,
        10 - t * 4 + zOffset
      );
      targetLookAt = new THREE.Vector3(0, -0.5, 0);
    } else if (scrollProgress < 0.50) {
      // Memory orbits
      const t = (scrollProgress - 0.30) / 0.20;
      targetPosition = new THREE.Vector3(
        Math.sin(t * Math.PI * 2) * (mobile ? 3 : 4),
        1 + Math.sin(t * Math.PI) * 0.5,
        6 + Math.cos(t * Math.PI * 2) * 2 + zOffset
      );
      targetLookAt = new THREE.Vector3(0, 0, 0);
    } else if (scrollProgress < 0.65) {
      // Letter view - closer
      const t = (scrollProgress - 0.50) / 0.15;
      targetPosition = new THREE.Vector3(
        0,
        1 + t * 0.5,
        5 - t * 2 + zOffset
      );
      targetLookAt = new THREE.Vector3(0, 0.5, 0);
    } else if (scrollProgress < 0.80) {
      // Heart constellation
      const t = (scrollProgress - 0.65) / 0.15;
      targetPosition = new THREE.Vector3(
        0,
        1 + t,
        6 - t * 2 + zOffset
      );
      targetLookAt = new THREE.Vector3(0, 1, 0);
    } else {
      // Final scene
      const t = (scrollProgress - 0.80) / 0.20;
      targetPosition = new THREE.Vector3(
        Math.sin(t * Math.PI) * (mobile ? 1.5 : 2),
        2 + t,
        8 + t * 2 + zOffset
      );
      targetLookAt = new THREE.Vector3(0, 1, 0);
    }

    // Smooth camera interpolation
    cameraRef.current.position.lerp(targetPosition, 0.05);
    
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    cameraRef.current.getWorldDirection(currentLookAt);
    const targetDirection = targetLookAt.clone().sub(cameraRef.current.position).normalize();
    const lerpedDirection = currentLookAt.lerp(targetDirection, 0.05);
    cameraRef.current.lookAt(
      cameraRef.current.position.clone().add(lerpedDirection)
    );
  });

  return null;
}

// Main scene content
function SceneContent({ scrollProgress, memories, onMemoryClick }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mobile = useMemo(() => isMobile(), []);

  // Calculate visibility and growth for each element
  const roseGrowth = Math.max(0, Math.min(3, 
    scrollProgress < 0.15 ? 0 :
    scrollProgress < 0.30 ? (scrollProgress - 0.15) / 0.15 * 3 :
    scrollProgress < 0.50 ? 3 :
    scrollProgress < 0.65 ? 3 - (scrollProgress - 0.50) / 0.15 * 1.5 :
    1.5
  ));

  const showAsteroid = scrollProgress > 0.10 && scrollProgress < 0.65;
  const showMemories = scrollProgress > 0.30 && scrollProgress < 0.55;
  const showHeart = scrollProgress > 0.60;
  const heartProgress = scrollProgress > 0.60 
    ? Math.min(1, (scrollProgress - 0.60) / 0.15) 
    : 0;

  // Reduce star count on mobile
  const starCount = mobile ? 800 : 2000;

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} color="#4A4A52" />
      <directionalLight
        position={[-5, 8, 3]}
        intensity={0.6}
        color="#FFF8E7"
      />

      {/* Starfield background */}
      <StarField count={starCount} speed={0.01} />

      {/* Asteroid with rose */}
      {showAsteroid && (
        <group 
          position={[0, -1, 0]}
          scale={1 - Math.abs(scrollProgress - 0.35) * 0.3}
        >
          <Asteroid scale={mobile ? 0.8 : 1} rotationSpeed={0.3} />
          <Rose 
            growthStage={roseGrowth} 
            glowIntensity={1 + Math.sin(scrollProgress * Math.PI) * 0.5}
          />
        </group>
      )}

      {/* Memory orbit system */}
      {showMemories && (
        <MemoryOrbitSystem 
          memories={memories}
          onOrbClick={onMemoryClick}
          visible={showMemories}
        />
      )}

      {/* Constellation heart */}
      {showHeart && (
        <group 
          position={[0, 0, -2]}
          scale={mobile ? 0.8 + scrollProgress * 0.15 : 1 + scrollProgress * 0.2}
        >
          <ConstellationHeart 
            progress={heartProgress}
          />
        </group>
      )}
    </group>
  );
}

// Main exported scene component
export function Scene({ scrollProgress, memories, onMemoryClick }: SceneProps) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 2, mobile ? 18 : 15], fov: mobile ? 70 : 60 }}
        gl={{ 
          antialias: !mobile, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={mobile ? [1, 1.5] : [1, 2]}
      >
        <CameraController scrollProgress={scrollProgress} />
        <SceneContent 
          scrollProgress={scrollProgress}
          memories={memories}
          onMemoryClick={onMemoryClick}
        />
        <EffectComposer>
          <Bloom
            intensity={mobile ? 1.2 : 1.5}
            width={mobile ? 200 : 300}
            height={mobile ? 200 : 300}
            kernelSize={mobile ? 3 : 5}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.4}
          />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
