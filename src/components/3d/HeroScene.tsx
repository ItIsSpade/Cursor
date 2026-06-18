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
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Keys - Simplified abstract representation */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => {
          // Add some randomness to key heights for a dynamic look
          const height = 0.1 + Math.random() * 0.05;
          const isAccent = Math.random() > 0.95; // Less frequent accents for cleaner look

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
                color={isAccent ? "#8B5CF6" : "#F4F4F5"}
                roughness={0.2}
                metalness={0.1}
                emissive={isAccent ? "#8B5CF6" : "#000000"}
                emissiveIntensity={isAccent ? 0.5 : 0}
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
        <meshStandardMaterial color="#FFFFFF" roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Scroll wheel */}
      <mesh position={[0, 0.3, -0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 bg-background overflow-hidden pointer-events-none">
      {/* Clean ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 45 }}>
        <color attach="background" args={['#FAFAFA']} />

        <ambientLight intensity={1.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow shadow-bias={-0.0001} />
        <directionalLight position={[-10, 10, 5]} intensity={1} color="#8B5CF6" />

        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <Float rotationIntensity={0.2} floatIntensity={1.5} speed={2}>
            <KeyboardMesh />
            <MouseMesh />

            {/* Abstract floating elements - refined */}
            <mesh position={[-3, 1.5, -2]}>
              <icosahedronGeometry args={[0.4, 0]} />
              <meshStandardMaterial color="#10B981" roughness={0.1} metalness={0.5} wireframe />
            </mesh>

            <mesh position={[2, 2.5, -3]}>
              <torusGeometry args={[0.3, 0.08, 16, 32]} />
              <meshStandardMaterial color="#8B5CF6" roughness={0.1} metalness={0.8} />
            </mesh>

          </Float>
        </PresentationControls>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.15} scale={20} blur={2.5} far={4} color="#000000" />

        {/* Dynamic clean environment lighting */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={1} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
            <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
            <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} color="#FFFFFF" intensity={2} />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}
