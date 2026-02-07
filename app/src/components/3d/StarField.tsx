/**
 * StarField Component
 * Creates a cosmic background with animated star particles
 * Uses Three.js Points for performance with thousands of stars
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
  speed?: number;
}

export function StarField({ count = 3000, speed = 0.02 }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const twinkleRef = useRef<THREE.Points>(null);

  // Generate star positions with depth layers
  const { positions, sizes, twinklePositions, twinkleSizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkleCount = Math.floor(count * 0.1); // 10% twinkling stars
    const twinklePositions = new Float32Array(twinkleCount * 3);
    const twinkleSizes = new Float32Array(twinkleCount);

    // Main starfield
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical distribution with depth
      const radius = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Size based on depth (closer = larger)
      const depth = radius / 200;
      sizes[i] = Math.random() * 2 * depth + 0.5;
    }

    // Twinkling stars (brighter, larger)
    for (let i = 0; i < twinkleCount; i++) {
      const i3 = i * 3;
      const radius = 30 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      twinklePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      twinklePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      twinklePositions[i3 + 2] = radius * Math.cos(phi);

      twinkleSizes[i] = Math.random() * 3 + 2;
    }

    return { positions, sizes, twinklePositions, twinkleSizes };
  }, [count]);

  // Create buffer attributes with proper args
  const positionAttribute = useMemo(() => {
    return new THREE.BufferAttribute(positions, 3);
  }, [positions]);

  const sizeAttribute = useMemo(() => {
    return new THREE.BufferAttribute(sizes, 1);
  }, [sizes]);

  const twinklePositionAttribute = useMemo(() => {
    return new THREE.BufferAttribute(twinklePositions, 3);
  }, [twinklePositions]);

  const twinkleSizeAttribute = useMemo(() => {
    return new THREE.BufferAttribute(twinkleSizes, 1);
  }, [twinkleSizes]);

  // Animate stars
  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation of starfield
      pointsRef.current.rotation.y += speed * 0.1;
      pointsRef.current.rotation.x += speed * 0.05;
    }

    if (twinkleRef.current) {
      twinkleRef.current.rotation.y += speed * 0.15;
      twinkleRef.current.rotation.x += speed * 0.08;

      // Twinkle effect using scale
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 2) * 0.1;
      twinkleRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Main starfield */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <primitive attach="attributes-position" object={positionAttribute} />
          <primitive attach="attributes-size" object={sizeAttribute} />
        </bufferGeometry>
        <pointsMaterial
          size={1}
          color="#FFF8E7"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Twinkling stars */}
      <points ref={twinkleRef}>
        <bufferGeometry>
          <primitive attach="attributes-position" object={twinklePositionAttribute} />
          <primitive attach="attributes-size" object={twinkleSizeAttribute} />
        </bufferGeometry>
        <pointsMaterial
          size={2.5}
          color="#FFFFFF"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Nebula fog effect */}
      <mesh position={[0, 0, -100]}>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial
          color="#FF4D8D"
          transparent
          opacity={0.03}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary nebula */}
      <mesh position={[-50, 30, -80]}>
        <sphereGeometry args={[60, 32, 32]} />
        <meshBasicMaterial
          color="#4A90D9"
          transparent
          opacity={0.02}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
