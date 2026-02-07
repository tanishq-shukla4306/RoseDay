/**
 * MemoryOrb Component
 * Floating glass spheres with memory photos inside
 * Orbital animation with hover and click interactions
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface MemoryOrbProps {
  position: [number, number, number];
  imageUrl: string;
  title: string;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitOffset?: number;
  onClick?: () => void;
}

export function MemoryOrb({
  position,
  imageUrl,
  title,
  orbitRadius = 5,
  orbitSpeed = 0.2,
  orbitOffset = 0,
  onClick
}: MemoryOrbProps) {
  const orbRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const originalPosition = useRef<THREE.Vector3>(new THREE.Vector3());

  // Load texture with error handling
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Orbit animation
  useFrame((state) => {
    if (orbRef.current) {
      const time = state.clock.elapsedTime;
      const angle = time * orbitSpeed + orbitOffset;
      
      if (!clicked) {
        // Orbital motion
        orbRef.current.position.x = Math.cos(angle) * orbitRadius;
        orbRef.current.position.z = Math.sin(angle) * orbitRadius;
        orbRef.current.position.y = position[1] + Math.sin(time * 0.5 + orbitOffset) * 0.3;
        
        // Store original position
        originalPosition.current.copy(orbRef.current.position);
        
        // Face the center
        orbRef.current.lookAt(0, position[1], 0);
      } else {
        // Move to front of camera when clicked
        const camera = state.camera;
        const targetPosition = new THREE.Vector3();
        camera.getWorldDirection(targetPosition);
        targetPosition.multiplyScalar(3); // Distance from camera
        targetPosition.add(camera.position);
        
        // Smooth transition to front
        orbRef.current.position.lerp(targetPosition, 0.1);
        
        // Face the camera
        orbRef.current.lookAt(camera.position);
      }
    }
  });

  // Hover and click scale animation
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = clicked ? 2.5 : (hovered ? 1.15 : 1);
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
    onClick?.();
  };

  return (
    <group ref={orbRef} position={position}>
      {/* Outer glass sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transparent
          opacity={0.1}
          roughness={0.05}
          metalness={0.1}
          transmission={0.95}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={0.95}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color="#FF4D8D"
          transparent
          opacity={hovered ? 0.15 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Photo sphere inside */}
      <mesh scale={0.7}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Rim light */}
      <mesh scale={1.02}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color="#FF4D8D"
          transparent
          opacity={hovered ? 0.3 : 0.15}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glow point light */}
      <pointLight
        color="#FF4D8D"
        intensity={hovered ? 1.5 : 0.8}
        distance={5}
        decay={2}
      />

      {/* Hover label */}
      {hovered && (
        <Html distanceFactor={10} center>
          <div className="glass px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none">
            <span className="text-xs text-white font-medium">{title}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Memory Orbit System Component
interface MemoryOrbitSystemProps {
  memories: Array<{
    id: number;
    title: string;
    date: string;
    image: string;
    message: string;
  }>;
  onOrbClick?: (memory: any) => void;
  visible?: boolean;
}

export function MemoryOrbitSystem({ memories, onOrbClick, visible = true }: MemoryOrbitSystemProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && visible) {
      // Slow rotation of entire orbit system
      groupRef.current.rotation.y += 0.002;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Orbit ring (subtle) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.5, 4.6, 64]} />
        <meshBasicMaterial
          color="#FF4D8D"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Memory orbs */}
      {memories.map((memory, index) => {
        const angle = (index / memories.length) * Math.PI * 2;
        const orbitOffset = angle;
        
        return (
          <MemoryOrb
            key={memory.id}
            position={[Math.cos(angle) * 5, 0, Math.sin(angle) * 5]}
            imageUrl={memory.image}
            title={memory.title}
            orbitRadius={5}
            orbitSpeed={0.15}
            orbitOffset={orbitOffset}
            onClick={() => onOrbClick?.(memory)}
          />
        );
      })}
    </group>
  );
}
