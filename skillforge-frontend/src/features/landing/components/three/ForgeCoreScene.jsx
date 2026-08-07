import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  buildDust,
  buildEdges,
  buildNodeField,
  softGlowTexture,
  useReducedMotion,
  useSceneBudget,
  useScenePalette,
  useTabHidden,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  ForgeCoreScene — the living ember AI core.                                 */
/*  The product promise rendered as one organism: a pulsing ember heart with   */
/*  a tight knowledge-lattice orbiting it like sparks thrown from the forge.   */
/*  Composes the shared three-engine; pauses when the tab is hidden or motion  */
/*  is reduced.                                                                */
/* -------------------------------------------------------------------------- */

const EDGE_DISTANCE = 1.7;
const DISPLACE_DISTANCE = 1.1;

function ForgeCore({
  reducedMotion,
  hidden,
  nodeCount,
  detail,
  palette,
  sparkField,
}) {
  const groupRef = useRef(null);
  const displacement = useRef(null);

  const gl = useMemo(
    () => ({
      ember: new THREE.Color(palette.ember),
      aurora: new THREE.Color(palette.aurora),
      dim: new THREE.Color(palette.dim),
    }),
    [palette],
  );

  const { home, colors } = useMemo(
    () =>
      buildNodeField({
        nodeCount,
        radius: 3.2,
        palette: [gl.ember, gl.aurora, gl.dim],
        weights: [0.52, 0.8],
        flatten: [1, 0.7, 0.7],
        outlierChance: 0.85,
        outlierScale: 1.38,
      }),
    [nodeCount, gl],
  );

  const { edgePositions, edgeColors } = useMemo(
    () => buildEdges(home, nodeCount, EDGE_DISTANCE, 2400),
    [home, nodeCount],
  );

  const [glowTexture] = useState(() => softGlowTexture());

  useFrame((state, delta) => {
    if (reducedMotion || hidden || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y += delta * 0.1;
    groupRef.current.rotation.x =
      Math.sin(t * 0.1) * 0.06 + Math.cos(t * 0.06) * 0.05;

    if (!displacement.current) {
      const values = new Float32Array(nodeCount * 3);
      for (let i = 0; i < nodeCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        values[i * 3] =
          Math.sin(theta) * Math.cos(phi) * DISPLACE_DISTANCE;
        values[i * 3 + 1] =
          Math.sin(theta) * Math.sin(phi) * DISPLACE_DISTANCE;
        values[i * 3 + 2] = Math.cos(theta) * DISPLACE_DISTANCE;
      }
      displacement.current = values;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pulsing ember heart — the forge's fire */}
      <sprite position={[0, 0, 0]} scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.ember}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite position={[0, 0, 0]} scale={[4.6, 4.6, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.ember}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite position={[0, 0, 0]} scale={[8, 8, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.ember}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Aurora whisper in the depth */}
      <sprite position={[2.8, -2.4, -3]} scale={[5, 5, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.aurora}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Spark lattice — knowledge gathered into the orbit of the forge */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[home, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
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
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Ash sparks — faint dust keeping scale readable */}
      {detail && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[sparkField, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.03}
            color={gl.dim}
            transparent
            opacity={0.5}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

export default function ForgeCoreScene({ className }) {
  const reducedMotion = useReducedMotion();
  const hidden = useTabHidden();
  const palette = useScenePalette();
  const { nodeCount, dpr, detail } = useSceneBudget({
    high: 720,
    low: 340,
    baseDpr: 1.4,
  });

  const sparkField = useMemo(
    () => buildDust(140, { inner: 5.5, outer: 9, flatten: 0.85 }),
    [],
  );

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ForgeCore
          reducedMotion={reducedMotion}
          hidden={hidden}
          nodeCount={nodeCount}
          detail={detail}
          palette={palette}
          sparkField={sparkField}
        />
      </Canvas>
    </div>
  );
}