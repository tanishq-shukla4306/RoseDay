/**
 * Rose Component
 * A procedurally generated 3D rose with growth animation stages
 * Uses scroll progress to control bloom state
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RoseProps {
  growthStage?: number; // 0-3: bud, stem, bloom, full
  glowIntensity?: number;
}

export function Rose({ growthStage = 0, glowIntensity = 1 }: RoseProps) {
  const roseRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Growth parameters
  const growth = Math.max(0, Math.min(3, growthStage));
  const bloomProgress = growth / 3;

  // Generate petal geometry
  const petalGeometries = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    
    // Inner petals (tighter spiral)
    const innerPetalCount = 5;
    for (let i = 0; i < innerPetalCount; i++) {
      const geometry = createPetalGeometry(0.8, 1.2, 0.3);
      geometries.push(geometry);
    }

    // Middle petals
    const middlePetalCount = 7;
    for (let i = 0; i < middlePetalCount; i++) {
      const geometry = createPetalGeometry(1.2, 1.8, 0.5);
      geometries.push(geometry);
    }

    // Outer petals
    const outerPetalCount = 9;
    for (let i = 0; i < outerPetalCount; i++) {
      const geometry = createPetalGeometry(1.8, 2.5, 0.7);
      geometries.push(geometry);
    }

    return geometries;
  }, []);

  // Animate glow pulse
  useFrame((state) => {
    if (glowRef.current) {
      const time = state.clock.elapsedTime;
      const pulse = 1 + Math.sin(time * 1.5) * 0.15;
      glowRef.current.intensity = 2 * glowIntensity * pulse;
    }

    if (roseRef.current) {
      // Gentle floating animation
      const time = state.clock.elapsedTime;
      roseRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      roseRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
    }
  });

  // Calculate petal positions and rotations based on growth stage
  const getPetalTransform = (index: number, totalInLayer: number, layer: number) => {
    const angle = (index / totalInLayer) * Math.PI * 2 + layer * 0.3;
    const radius = layer * 0.4 + 0.2;
    
    // Bloom opens petals outward as growth increases
    const baseOpenAngle = layer * 0.3;
    const bloomOpenAngle = bloomProgress * (0.5 + layer * 0.3);
    const openAngle = baseOpenAngle + bloomOpenAngle;

    const x = Math.cos(angle) * radius * (0.5 + bloomProgress * 0.5);
    const z = Math.sin(angle) * radius * (0.5 + bloomProgress * 0.5);
    const y = layer * 0.3 * (1 - bloomProgress * 0.3);

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [openAngle, angle, 0] as [number, number, number],
      scale: 0.3 + bloomProgress * 0.7
    };
  };

  let petalIndex = 0;

  return (
    <group ref={roseRef} position={[0, 0, 0]}>
      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color="#FF4D8D"
        intensity={2}
        distance={20}
        decay={2}
        position={[0, 1, 0]}
      />

      {/* Stem */}
      <mesh position={[0, -1.5 - (1 - bloomProgress) * 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 3, 8]} />
        <meshStandardMaterial
          color="#2D5016"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Leaves */}
      {[0, 1].map((i) => (
        <mesh
          key={`leaf-${i}`}
          position={[
            Math.cos(i * Math.PI) * 0.3,
            -1 - i * 0.5,
            Math.sin(i * Math.PI) * 0.1
          ]}
          rotation={[0.3, i * Math.PI, 0.5]}
          scale={bloomProgress}
        >
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial
            color="#3D6B26"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Inner petals */}
      {Array.from({ length: 5 }).map((_, i) => {
        const transform = getPetalTransform(i, 5, 0);
        return (
          <mesh
            key={`inner-${i}`}
            geometry={petalGeometries[petalIndex++]}
            position={transform.position}
            rotation={transform.rotation}
            scale={transform.scale}
          >
            <meshPhysicalMaterial
              color="#FF4D8D"
              emissive="#FF1A6C"
              emissiveIntensity={0.3 * glowIntensity}
              roughness={0.3}
              metalness={0.1}
              transmission={0.2}
              thickness={0.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Middle petals */}
      {Array.from({ length: 7 }).map((_, i) => {
        const transform = getPetalTransform(i, 7, 1);
        return (
          <mesh
            key={`middle-${i}`}
            geometry={petalGeometries[petalIndex++]}
            position={transform.position}
            rotation={transform.rotation}
            scale={transform.scale * 1.2}
          >
            <meshPhysicalMaterial
              color="#FF6B9D"
              emissive="#FF4D8D"
              emissiveIntensity={0.2 * glowIntensity}
              roughness={0.4}
              metalness={0.1}
              transmission={0.15}
              thickness={0.5}
              clearcoat={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Outer petals */}
      {Array.from({ length: 9 }).map((_, i) => {
        const transform = getPetalTransform(i, 9, 2);
        return (
          <mesh
            key={`outer-${i}`}
            geometry={petalGeometries[petalIndex++]}
            position={transform.position}
            rotation={transform.rotation}
            scale={transform.scale * 1.5}
          >
            <meshPhysicalMaterial
              color="#FF8FB3"
              emissive="#FF6B9D"
              emissiveIntensity={0.15 * glowIntensity}
              roughness={0.5}
              metalness={0.05}
              transmission={0.1}
              thickness={0.5}
              clearcoat={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Center bud (visible in early stages) */}
      <mesh scale={1 - bloomProgress * 0.5}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhysicalMaterial
          color="#FF1A6C"
          emissive="#FF0066"
          emissiveIntensity={0.5 * glowIntensity}
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// Helper function to create petal geometry
function createPetalGeometry(width: number, length: number, curvature: number): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, length, 4, 8);
  const positions = geometry.attributes.position.array as Float32Array;

  // Curve the petal
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // Create cup shape
    const distFromCenter = Math.sqrt(x * x + y * y);
    const curveAmount = curvature * Math.pow(distFromCenter / length, 2);
    
    positions[i + 2] = z + curveAmount;
  }

  geometry.computeVertexNormals();
  return geometry;
}
