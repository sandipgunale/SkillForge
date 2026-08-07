import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  buildEdges,
  buildNodeField,
  softGlowTexture,
  useReducedMotion,
  useSceneBudget,
  useScenePalette,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  Knowledge Constellation — ambient 3D graph for the landing hero.           */
/*  A drifting field of skill-nodes connected by near-neighbor edges.          */
/*  Composes the shared three-engine (tokens, field builders, adaptive         */
/*  budget). Static geometry + motion-safe frame loop.                          */
/* -------------------------------------------------------------------------- */

const EDGE_DISTANCE = 2.6;

function ConstellationField({ reducedMotion, nodeCount, palette }) {
  const groupRef = useRef(null);
  const [rotationSpeed] = useState(() => 0.035 + Math.random() * 0.02);

  const { home: positions, colors } = useMemo(
    () =>
      buildNodeField({
        nodeCount,
        radius: 6.5,
        palette: [palette.ember, palette.aurora, palette.dim],
        weights: [0.45, 0.75],
        flatten: [1, 0.8, 0.7],
        outlierChance: 0.85,
        outlierScale: 1.35,
      }),
    [nodeCount, palette],
  );
  const { edgePositions, edgeColors } = useMemo(
    () => buildEdges(positions, nodeCount, EDGE_DISTANCE, 9000),
    [positions, nodeCount],
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
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[edgeColors, 3]} />
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
          color={palette.ember}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite position={[3.6, -1.4, -3]} scale={[4.2, 4.2, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.aurora}
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
  const reducedMotion = useReducedMotion();
  const palette = useScenePalette();
  const { nodeCount, dpr } = useSceneBudget({
    high: 650,
    low: 320,
    baseDpr: 1.5,
  });

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 11], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ConstellationField
          reducedMotion={reducedMotion}
          nodeCount={nodeCount}
          palette={palette}
        />
      </Canvas>
    </div>
  );
}