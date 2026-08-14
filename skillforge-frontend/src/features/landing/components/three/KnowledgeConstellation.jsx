import { useEffect, useMemo, useRef, useState } from "react";
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
/*  budget). Static geometry + motion-safe frame loop.                         */
/*                                                                             */
/*  Pointer response: hovering the section highlights the nearest node with   */
/*  a pulsing ember halo (screen-space nearest-node search — cheap, and it    */
/*  works through the fold's transforms because the canvas rect is measured   */
/*  live). Ambient rotation pauses under prefers-reduced-motion; the halo     */
/*  still responds to the pointer (input response, not ambient motion).        */
/* -------------------------------------------------------------------------- */

const EDGE_DISTANCE = 2.6;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

const scratch = new THREE.Vector3();

function ConstellationField({ reducedMotion, nodeCount, palette, containerRef }) {
  const groupRef = useRef(null);
  const hoverSpriteRef = useRef(null);
  const [rotationSpeed] = useState(() => 0.018 + Math.random() * 0.012);
  const slotTopRef = useRef(0);

  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const hoverPos = useRef(new THREE.Vector3());

  /* The section's slot top (where the knowledge page comes to rest) drives
     the camera: a slow orbital + dolly that sweeps across the section's
     window, so the tree glides as the user scrolls — and holds at rest.
     Re-measured on resize and font load (the fold may shift the markers). */
  useEffect(() => {
    const measureSlot = () => {
      const marker = document.querySelector('[data-anchor="knowledge"]');
      slotTopRef.current = marker ? marker.offsetTop : 0;
    };
    measureSlot();
    window.addEventListener("resize", measureSlot);
    document.fonts?.ready.then(measureSlot).catch(() => {});
    return () => window.removeEventListener("resize", measureSlot);
  }, []);

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

  /* Document-level pointer tracking: the constellation is a backdrop that
     must never intercept input, so we listen on document and convert into
     the canvas's own coordinate space using its live rect. */
  useEffect(() => {
    const onMove = (e) => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (!canvas) {
        pointerRef.current.active = false;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) {
        pointerRef.current.active = false;
        return;
      }
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.active = true;
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [containerRef]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      group.rotation.y += delta * rotationSpeed;
      group.rotation.x =
        Math.sin(t * 0.08) * 0.12 + Math.cos(t * 0.05) * 0.06;

      /* Scroll-driven camera: one slow sweep across the section's window —
         pulled back and left before the page arrives, eased in and slightly
         right while it rests, receding as it turns away. Deterministic and
         reversible. */
      const vh = window.innerHeight || 800;
      const progress = clamp01((window.scrollY - (slotTopRef.current - vh)) / (vh * 2));
      const camera = state.camera;
      camera.position.x = Math.sin(progress * Math.PI) * 0.5;
      camera.position.y = Math.cos(progress * Math.PI * 0.5) * 0.22;
      camera.position.z = 11.6 - 0.55 * progress;
      camera.lookAt(0, 0, 0);
    }

    /* Hover: find the node nearest the pointer in screen space (radius
       check), then ease a pulsing halo onto it. */
    const p = pointerRef.current;
    const hoverSprite = hoverSpriteRef.current;
    if (!p.active || !hoverSprite) return;

    const rect = state.gl.domElement.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      hoverSprite.material.opacity = 0;
      return;
    }
    const aspect = rect.width / rect.height;
    const k = Math.tan((state.camera.fov * Math.PI) / 360);
    const camZ = state.camera.position.z;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < positions.length; i++) {
      scratch
        .set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
        .applyEuler(group.rotation);
      const dist = camZ - scratch.z;
      if (dist <= 0.1) continue;
      const ndcX = scratch.x / (dist * k * aspect);
      const ndcY = scratch.y / (dist * k);
      const dx = ndcX - p.x;
      const dy = ndcY - p.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }

    const t = state.clock.elapsedTime;
    if (best >= 0 && bestD < 0.0032) {
      scratch.set(positions[best * 3], positions[best * 3 + 1], positions[best * 3 + 2]);
      hoverPos.current.lerp(scratch, Math.min(1, delta * 8));
      hoverSprite.position.copy(hoverPos.current);
      hoverSprite.scale.setScalar(0.5 + Math.sin(t * 4) * 0.06);
      hoverSprite.material.opacity = Math.min(0.5, 0.34 + Math.sin(t * 4) * 0.08);
    } else {
      hoverSprite.material.opacity *= 1 - Math.min(1, delta * 8);
    }
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

      {/* Hover halo — eases onto the node under the pointer */}
      <sprite ref={hoverSpriteRef} scale={[0.5, 0.5, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.ember}
          transparent
          opacity={0}
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
  const containerRef = useRef(null);
  const { nodeCount, dpr } = useSceneBudget({
    high: 650,
    low: 320,
    baseDpr: 1.5,
  });

  return (
    <div
      ref={containerRef}
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
          containerRef={containerRef}
        />
      </Canvas>
    </div>
  );
}