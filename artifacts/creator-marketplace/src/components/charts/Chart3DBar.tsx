import { useRef, useState, Suspense, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Error boundary to catch WebGL errors
class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.setState({ error: true }); }
  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}

// Detect WebGL support
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
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

interface Bar3DProps {
  x: number;
  height: number;
  color: string;
  label: string;
  value: string;
  maxHeight: number;
}

function Bar3D({ x, height, color, label, value, maxHeight }: Bar3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scaledH = Math.max((height / maxHeight) * 3.5, 0.15);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = hovered ? 1.08 : 1;
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, target, delta * 7);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, target, delta * 7);
    }
  });

  return (
    <group position={[x, 0, 0]}>
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
          emissiveIntensity={hovered ? 0.5 : 0.18}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      {/* Glow cap */}
      <mesh position={[0, scaledH + 0.04, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.85} />
      </mesh>
      {/* Label */}
      <Text position={[0, -0.4, 0]} fontSize={0.2} color="#94a3b8" anchorX="center" anchorY="top">
        {label}
      </Text>
      {hovered && (
        <Text position={[0, scaledH + 0.5, 0]} fontSize={0.2} color="#f59e0b" anchorX="center" anchorY="bottom">
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
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#0d1526" roughness={1} />
      </mesh>
      <gridHelper args={[24, 24, "#1e2a3a", "#1a2234"]} />
    </group>
  );
}

function Scene3D({ data, title }: { data: Chart3DDataItem[]; title?: string }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const spacing = 1.3;
  const totalWidth = (data.length - 1) * spacing;
  const startX = -totalWidth / 2;

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 7, -4]} intensity={0.7} color="#a78bfa" />
      <pointLight position={[4, 3, -4]} intensity={0.4} color="#f59e0b" />

      <GridFloor />

      {title && (
        <Float speed={0.8} rotationIntensity={0} floatIntensity={0.25}>
          <Text position={[0, 5.4, 0]} fontSize={0.35} color="#f1f5f9" anchorX="center">
            {title}
          </Text>
        </Float>
      )}

      {data.map((d, i) => (
        <Bar3D
          key={d.label}
          x={startX + i * spacing}
          height={d.value}
          maxHeight={maxVal}
          color={d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
          label={d.label}
          value={d.displayValue}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.7}
      />
    </>
  );
}

function Fallback2D({ data, height }: { data: Chart3DDataItem[]; height: number }) {
  return (
    <div style={{ height }} className="w-full flex flex-col items-center justify-center rounded-xl bg-background/40 border border-border/40">
      <div style={{ height: height - 40, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, _: string, entry: { payload: Chart3DDataItem }) => [entry.payload.displayValue, entry.payload.label]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-muted-foreground opacity-60">3D view requires WebGL</p>
    </div>
  );
}

export default function Chart3DBar({ data, title, height = 400 }: Chart3DBarProps) {
  const webglAvailable = isWebGLAvailable();

  if (!webglAvailable) {
    return <Fallback2D data={data} height={height} />;
  }

  const fallback = <Fallback2D data={data} height={height} />;

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <div style={{ height }} className="w-full rounded-xl overflow-hidden">
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 50 }}
          gl={{ antialias: true, alpha: false, failIfMajorPerformanceCaveat: false }}
          style={{ background: "hsl(222, 26%, 7%)" }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFShadowMap;
          }}
        >
          <Suspense fallback={null}>
            <Scene3D data={data} title={title} />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
