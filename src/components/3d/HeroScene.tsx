"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Lightformer, Environment, ContactShadows, PresentationControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function KeyboardMesh() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Base */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.2, 1.5]} />
        <meshStandardMaterial color="#12121A" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Keys - Simplified abstract representation */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => {
          // Add some randomness to key heights for a dynamic look
          const height = 0.1 + Math.random() * 0.05;
          const isAccent = Math.random() > 0.9;

          return (
            <mesh
              key={`key-${row}-${col}`}
              position={[
                -1.65 + col * 0.3,
                height / 2,
                -0.45 + row * 0.3
              ]}
              castShadow
            >
              <boxGeometry args={[0.25, height, 0.25]} />
              <meshStandardMaterial
                color={isAccent ? "#00F0FF" : "#2A2A35"}
                roughness={0.4}
                metalness={0.1}
                emissive={isAccent ? "#00F0FF" : "#000000"}
                emissiveIntensity={isAccent ? 2 : 0}
              />
            </mesh>
          )
        })
      )}
    </group>
  );
}

function MouseMesh() {
  return (
    <group position={[3, 0, 0.5]} rotation={[0, -0.2, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.4, 0.6, 4, 16]} />
        <meshStandardMaterial color="#12121A" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Scroll wheel */}
      <mesh position={[0, 0.3, -0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 bg-background overflow-hidden pointer-events-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]" />

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 45 }}>
        <color attach="background" args={['#08080C']} />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <Float rotationIntensity={0.4} floatIntensity={2} speed={1.5}>
            <KeyboardMesh />
            <MouseMesh />

            {/* Abstract floating elements */}
            <mesh position={[-3, 1, -2]}>
              <octahedronGeometry args={[0.5]} />
              <meshStandardMaterial color="#FF0055" wireframe />
            </mesh>

            <mesh position={[2, 2, -3]}>
              <torusGeometry args={[0.4, 0.05, 16, 32]} />
              <meshStandardMaterial color="#00F0FF" roughness={0} metalness={1} />
            </mesh>

          </Float>
        </PresentationControls>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />

        {/* Dynamic environment lighting */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
            <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
            <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} color="#00F0FF" intensity={5} />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}
