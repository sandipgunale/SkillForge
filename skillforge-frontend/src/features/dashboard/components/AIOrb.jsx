import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  buildNodeField,
  softGlowTexture,
  useReducedMotion,
  useSceneBudget,
  useScenePalette,
  useTabHidden,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  AIOrb — the Mission Control centerpiece.                                  */
/*  A living ember core ringed by a health arc (learning health as a halo)     */
/*  wrapped in slow knowledge dust. Composes the shared three-engine and       */
/*  pauses when the tab is hidden, off-screen, or motion is reduced.           */
/* -------------------------------------------------------------------------- */

const RING_RADIUS = 3.1;
const HEALTH_SEGMENTS = 96;

function buildRingGeometry(health) {
  const fraction = Math.max(0.04, Math.min(1, (health ?? 0) / 100));
  const arcCount = Math.max(2, Math.round(fraction * HEALTH_SEGMENTS));

  const full = new Float32Array(HEALTH_SEGMENTS * 3);
  const arc = new Float32Array(arcCount * 3);

  for (let i = 0; i < HEALTH_SEGMENTS; i++) {
    const theta = (i / HEALTH_SEGMENTS) * Math.PI * 2;
    const x = Math.cos(theta) * RING_RADIUS;
    const y = Math.sin(theta) * RING_RADIUS;
    full[i * 3] = x;
    full[i * 3 + 1] = y;
    full[i * 3 + 2] = 0;
    if (i < arcCount) {
      arc[i * 3] = x;
      arc[i * 3 + 1] = y;
      arc[i * 3 + 2] = 0;
    }
  }

  return { full: new Float32Array(full), arc: new Float32Array(arc) };
}

function Orb({ reducedMotion, hidden, inView, health, palette }) {
  const groupRef = useRef(null);

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
        nodeCount: 240,
        radius: 2.2,
        palette: [gl.ember, gl.aurora, gl.dim],
        weights: [0.55, 0.8],
        flatten: [0.9, 0.72, 0.72],
        outlierChance: 0.9,
        outlierScale: 1.5,
      }),
    [gl],
  );

  const [glowTexture] = useState(() => softGlowTexture());

  const ringGeometry = useMemo(() => buildRingGeometry(health), [health]);

  useFrame((state, delta) => {
    if (reducedMotion || hidden || !inView || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z += delta * 0.08;
    groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.18;
    groupRef.current.rotation.x = Math.cos(t * 0.1) * 0.06;
  });

  return (
    <group ref={groupRef}>
      {/* Ember core glow */}
      <sprite position={[0, 0, 0]} scale={[1.9, 1.9, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.ember}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite position={[0, 0, 0]} scale={[4.2, 4.2, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.ember}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Aurora whisper */}
      <sprite position={[1.6, 1.3, -1.2]} scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={gl.aurora}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Knowledge dust */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[home, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.75}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Full dim ring */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ringGeometry.full, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={gl.dim} transparent opacity={0.35} depthWrite={false} />
      </lineLoop>

      {/* Ember health arc */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ringGeometry.arc, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={gl.ember} transparent opacity={0.95} depthWrite={false} />
      </lineLoop>
    </group>
  );
}

export default function AIOrb({ className, health = 0 }) {
  const reducedMotion = useReducedMotion();
  const hidden = useTabHidden();
  const palette = useScenePalette();
  const { dpr } = useSceneBudget({ high: 1.4, low: 1 });
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const renderActive = inView && !reducedMotion && !hidden;

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {renderActive ? (
        <Canvas
          dpr={dpr}
          camera={{ position: [0, 0, 9], fov: 54 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <Orb
            reducedMotion={reducedMotion}
            hidden={hidden}
            inView={inView}
            health={health}
            palette={palette}
          />
        </Canvas>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="size-48 rounded-full border border-ember/20 bg-ember/5" />
        </div>
      )}
    </div>
  );
}