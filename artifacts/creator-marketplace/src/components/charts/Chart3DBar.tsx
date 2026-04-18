import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

interface Bar3DProps {
  x: number;
  z: number;
  height: number;
  color: string;
  label: string;
  value: string;
  maxHeight: number;
}

function Bar3D({ x, z, height, color, label, value, maxHeight }: Bar3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scaledH = (height / maxHeight) * 3.5;

  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = hovered ? 1.06 : 1;
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, target, delta * 6);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, target, delta * 6);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        position={[0, scaledH / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[0.65, scaledH, 0.65]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.15}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Top glow cap */}
      <mesh position={[0, scaledH + 0.04, 0]}>
        <boxGeometry args={[0.68, 0.08, 0.68]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.22}
        color="#94a3b8"
        anchorX="center"
        anchorY="top"
        font={undefined}
      >
        {label}
      </Text>

      {/* Value on top when hovered */}
      {hovered && (
        <Text
          position={[0, scaledH + 0.4, 0]}
          fontSize={0.22}
          color="#f59e0b"
          anchorX="center"
          anchorY="bottom"
          font={undefined}
        >
          {value}
        </Text>
      )}
    </group>
  );
}

function GridFloor() {
  return (
    <group position={[0, -0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
      <gridHelper args={[20, 20, "#1e293b", "#1e293b"]} />
    </group>
  );
}

function FloatingTitle({ title }: { title: string }) {
  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
      <Text
        position={[0, 5.2, 0]}
        fontSize={0.38}
        color="#f1f5f9"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {title}
      </Text>
    </Float>
  );
}

export interface Chart3DDataItem {
  label: string;
  value: number;
  displayValue: string;
  color?: string;
}

const DEFAULT_COLORS = ["#f59e0b", "#34d399", "#a78bfa", "#60a5fa", "#f87171", "#fb923c", "#38bdf8", "#4ade80"];

interface Chart3DBarProps {
  data: Chart3DDataItem[];
  title?: string;
  height?: number;
}

export default function Chart3DBar({ data, title, height = 400 }: Chart3DBarProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const spacing = 1.3;
  const totalWidth = (data.length - 1) * spacing;
  const startX = -totalWidth / 2;

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 5, 9], fov: 52 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "hsl(222, 26%, 8%)" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-5, 8, -5]} intensity={0.6} color="#a78bfa" />
          <pointLight position={[5, 3, -5]} intensity={0.4} color="#f59e0b" />

          <GridFloor />

          {title && <FloatingTitle title={title} />}

          {data.map((d, i) => (
            <Bar3D
              key={d.label}
              x={startX + i * spacing}
              z={0}
              height={d.value}
              maxHeight={maxVal}
              color={d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              label={d.label}
              value={d.displayValue}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={18}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
