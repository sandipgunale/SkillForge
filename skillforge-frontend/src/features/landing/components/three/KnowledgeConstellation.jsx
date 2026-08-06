import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Knowledge Constellation — ambient 3D graph for the landing hero.           */
/*  A drifting field of skill-nodes connected by near-neighbor edges.          */
/*  Performance: ~650 nodes, low DPR cap, additive blending, motion-safe.      */
/* -------------------------------------------------------------------------- */

const NODE_COUNT = 650;
const EDGE_DISTANCE = 2.6;

const EMBER = new THREE.Color("#e89b3c");
const AURORA = new THREE.Color("#67c7e8");
const DIM = new THREE.Color("#8a94a6");

function softGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function buildField() {
  const positions = new Float32Array(NODE_COUNT * 3);
  const colors = new Float32Array(NODE_COUNT * 3);
  const color = new THREE.Color();

  for (let i = 0; i < NODE_COUNT; i++) {
    // Filled sphere with a soft radial falloff (denser core).
    const u = Math.random();
    const radius = 6.5 * Math.cbrt(u * 0.75 + 0.25) * (Math.random() > 0.85 ? 1.35 : 1);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;

    positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) * 0.8;
    positions[i * 3 + 2] = radius * Math.cos(theta) * 0.7;

    const t = Math.random();
    if (t < 0.45) {
      color.copy(EMBER);
    } else if (t < 0.75) {
      color.copy(AURORA);
    } else {
      color.copy(DIM);
    }
    const bright = 0.55 + Math.random() * 0.45;
    colors[i * 3] = color.r * bright;
    colors[i * 3 + 1] = color.g * bright;
    colors[i * 3 + 2] = color.b * bright;
  }

  // Near-neighbor edges — O(n^2) once at mount with distance culling.
  const edgePositionValues = [];
  const edgeColorValues = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < EDGE_DISTANCE) {
        edgePositionValues.push(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2],
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2],
        );
        const a = 0.08 + Math.random() * 0.1;
        edgeColorValues.push(a, a, a, a, a, a);
      }
    }
  }

  const edgePositions = new Float32Array(edgePositionValues);
  const edgeColors = new Float32Array(edgeColorValues);

  return { positions, colors, edgePositions, edgeColors };
}

function ConstellationField({ reducedMotion }) {
  const groupRef = useRef(null);
  const [rotationSpeed] = useState(() => 0.035 + Math.random() * 0.02);

  const { positions, colors, edgePositions, edgeColors } = useMemo(
    () => buildField(),
    [],
  );

  const [glowTexture] = useState(() => softGlowTexture());

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y += delta * rotationSpeed;
    groupRef.current.rotation.x =
      Math.sin(t * 0.08) * 0.12 + Math.cos(t * 0.05) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edgePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[edgeColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Soft ambient glows */}
      <sprite position={[-3.4, 1.6, -2]} scale={[3.2, 3.2, 1]}>
        <spriteMaterial
          map={glowTexture}
          color="#e89b3c"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite position={[3.6, -1.4, -3]} scale={[4.2, 4.2, 1]}>
        <spriteMaterial
          map={glowTexture}
          color="#67c7e8"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

export default function KnowledgeConstellation({ className }) {
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReducedMotion(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 11], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ConstellationField reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
