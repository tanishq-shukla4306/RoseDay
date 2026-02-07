/**
 * ConstellationHeart Component
 * Animated heart made of connected stars
 * Draws on scroll and twinkles in place
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConstellationHeartProps {
  progress?: number; // 0-1 for draw animation
}

export function ConstellationHeart({ 
  progress = 1
}: ConstellationHeartProps) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Generate heart shape points
  const heartPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const numPoints = 40;
    
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2;
      
      // Heart parametric equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Scale and center
      points.push(new THREE.Vector3(x * 0.08, y * 0.08 + 1, 0));
    }
    
    return points;
  }, []);

  // Generate inner stars
  const innerStars = useMemo(() => {
    const stars: THREE.Vector3[] = [];
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.8;
      
      const x = 16 * Math.pow(Math.sin(t), 3) * r;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
      
      stars.push(new THREE.Vector3(x * 0.08, y * 0.08 + 1, (Math.random() - 0.5) * 0.5));
    }
    
    return stars;
  }, []);

  // Twinkle animation
  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime;
      const sizes = starsRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = 2 + Math.sin(time * 2 + i * 0.5) * 0.8;
      }
      
      starsRef.current.geometry.attributes.size.needsUpdate = true;
    }

    // Gentle breathing animation for the whole heart
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 0.8) * 0.015;
      groupRef.current.scale.setScalar(scale);
    }
  });

  // Create line geometry for heart outline using LineSegments
  const lineGeometry = useMemo(() => {
    const maxIndex = Math.floor(progress * heartPoints.length);
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i < maxIndex; i++) {
      const nextIndex = (i + 1) % heartPoints.length;
      points.push(heartPoints[i]);
      points.push(heartPoints[nextIndex]);
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [heartPoints, progress]);

  // Create star positions for outline
  const outlineStarPositions = useMemo(() => {
    const positions = new Float32Array(heartPoints.length * 3);
    const sizes = new Float32Array(heartPoints.length);
    
    heartPoints.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      sizes[i] = 3;
    });
    
    return { positions, sizes };
  }, [heartPoints]);

  // Create inner star positions
  const innerStarPositions = useMemo(() => {
    const positions = new Float32Array(innerStars.length * 3);
    const sizes = new Float32Array(innerStars.length);
    
    innerStars.forEach((star, i) => {
      positions[i * 3] = star.x;
      positions[i * 3 + 1] = star.y;
      positions[i * 3 + 2] = star.z;
      sizes[i] = 1.5;
    });
    
    return { positions, sizes };
  }, [innerStars]);

  // Create buffer attributes
  const outlinePosAttr = useMemo(() => {
    return new THREE.BufferAttribute(outlineStarPositions.positions, 3);
  }, [outlineStarPositions]);

  const outlineSizeAttr = useMemo(() => {
    return new THREE.BufferAttribute(outlineStarPositions.sizes, 1);
  }, [outlineStarPositions]);

  const innerPosAttr = useMemo(() => {
    return new THREE.BufferAttribute(innerStarPositions.positions, 3);
  }, [innerStarPositions]);

  const innerSizeAttr = useMemo(() => {
    return new THREE.BufferAttribute(innerStarPositions.sizes, 1);
  }, [innerStarPositions]);

  return (
    <group ref={groupRef}>
      {/* Heart outline lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#FFF8E7"
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </lineSegments>

      {/* Outline stars */}
      <points>
        <bufferGeometry>
          <primitive attach="attributes-position" object={outlinePosAttr} />
          <primitive attach="attributes-size" object={outlineSizeAttr} />
        </bufferGeometry>
        <pointsMaterial
          size={3}
          color="#FFF8E7"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Inner twinkling stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <primitive attach="attributes-position" object={innerPosAttr} />
          <primitive attach="attributes-size" object={innerSizeAttr} />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          color="#FF4D8D"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Glow effect */}
      <mesh position={[0, 1, -0.5]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial
          color="#FF4D8D"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Center glow light */}
      <pointLight
        position={[0, 1, 1]}
        color="#FF4D8D"
        intensity={1.5}
        distance={10}
        decay={2}
      />
    </group>
  );
}
