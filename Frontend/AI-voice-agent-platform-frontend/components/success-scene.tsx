'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import { Vector3 } from 'three'

function Rocket() {
  const rocketRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2
      rocketRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={rocketRef} position={new Vector3(2, 0, 0)}>
        <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
        <meshStandardMaterial color="#FF6B6B" metalness={0.8} roughness={0.2} />
        <mesh position={[0, -1.2, 0]}>
          <coneGeometry args={[0.6, 0.8, 3]} />
          <meshStandardMaterial color="#FFE66D" emissive="#FFE66D" emissiveIntensity={0.5} />
        </mesh>
      </mesh>
    </Float>
  )
}

function Crystal() {
  const crystalRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.01
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={crystalRef} position={new Vector3(-2, 0, 0)}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial
          color="#4ECDC4"
          metalness={0.9}
          roughness={0.1}
          emissive="#4ECDC4"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  )
}

export function SuccessScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8] }}>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Rocket />
      <Crystal />
    </Canvas>
  )
}

