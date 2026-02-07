/**
 * Asteroid Component
 * A low-poly floating rock for the rose to sit on
 * Creates the cosmic garden atmosphere
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidProps {
  scale?: number;
  rotationSpeed?: number;
}

export function Asteroid({ scale = 1, rotationSpeed = 0.05 }: AsteroidProps) {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const cratersRef = useRef<THREE.Group>(null);

  // Generate asteroid geometry with noise
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.5, 2);
    const positions = geo.attributes.position.array as Float32Array;

    // Apply noise to vertices for rocky surface
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Simple noise based on position
      const noise = Math.sin(x * 1.5) * Math.cos(y * 1.3) * Math.sin(z * 1.7) * 0.15;
      const noise2 = Math.sin(x * 3 + y) * Math.cos(z * 2) * 0.08;
      
      const displacement = 1 + noise + noise2;
      
      positions[i] = x * displacement;
      positions[i + 1] = y * displacement;
      positions[i + 2] = z * displacement;
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Generate crater positions
  const craters = useMemo(() => {
    const craterData = [];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const radius = 2.2 + Math.random() * 0.3;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(theta) * Math.sin(phi);
      
      craterData.push({
        position: [x, y, z] as [number, number, number],
        scale: 0.15 + Math.random() * 0.2,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number]
      });
    }
    
    return craterData;
  }, []);

  // Gentle floating animation
  useFrame((state) => {
    if (asteroidRef.current) {
      const time = state.clock.elapsedTime;
      asteroidRef.current.rotation.y += rotationSpeed * 0.01;
      asteroidRef.current.rotation.x = Math.sin(time * 0.1) * 0.02;
    }

    if (cratersRef.current) {
      cratersRef.current.rotation.y += rotationSpeed * 0.01;
      cratersRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group scale={scale}>
      {/* Main asteroid body */}
      <mesh ref={asteroidRef} geometry={geometry} position={[0, -2, 0]}>
        <meshStandardMaterial
          color="#4A4A52"
          roughness={0.9}
          metalness={0.1}
          flatShading={false}
        />
      </mesh>

      {/* Craters */}
      <group ref={cratersRef} position={[0, -2, 0]}>
        {craters.map((crater, index) => (
          <mesh
            key={index}
            position={crater.position}
            rotation={crater.rotation}
            scale={crater.scale}
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              color="#3A3A42"
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}
      </group>

      {/* Rim lighting from upper left */}
      <directionalLight
        position={[-5, 8, 3]}
        intensity={0.8}
        color="#FFF8E7"
        castShadow={false}
      />

      {/* Ambient fill */}
      <ambientLight intensity={0.2} color="#4A4A52" />

      {/* Bottom glow (subtle) */}
      <pointLight
        position={[0, -4, 0]}
        intensity={0.3}
        color="#FF4D8D"
        distance={8}
        decay={2}
      />
    </group>
  );
}
