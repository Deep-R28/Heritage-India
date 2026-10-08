"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function Monument() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  const minaretAngles = [0, 1, 2, 3].map((i) => (i / 4) * Math.PI * 2 + Math.PI / 4);

  return (
    <group ref={group} position={[0, -0.3, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshPhongMaterial color="#C9A24B" shininess={100} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshPhongMaterial color="#C9A24B" shininess={100} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.6, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhongMaterial color="#C9A24B" shininess={100} />
      </mesh>
      {/* Minarets */}
      {minaretAngles.map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.9, 0.6, Math.sin(angle) * 0.9]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2]} />
          <meshPhongMaterial color="#C9A24B" shininess={100} />
        </mesh>
      ))}
    </group>
  );
}

/** Rotating low-poly monument hero, per DESIGN.md Section 1 "Visceral layer". */
export function MonumentScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 75 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <Monument />
    </Canvas>
  );
}
