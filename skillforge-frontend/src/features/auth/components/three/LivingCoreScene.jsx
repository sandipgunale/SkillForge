import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useAuthSceneStore } from "../../store/authSceneStore";
import {
  buildDust,
  buildEdges,
  buildNodeField,
  buildTorus,
  softGlowTexture,
  useReducedMotion,
  useSceneBudget,
  useScenePalette,
  useTabHidden,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  Living Intelligence Core — the auth experience's neural energy field.      */
/*                                                                            */
/*  • Slow rotation + breathing (scale 0.98 -> 1.02)                          */
/*  • Energy pulses that travel along connection edges ("knowledge flowing")  */
/*  • Cursor repulsion — nearby nodes bulge away, connections stretch         */
/*  • Random node activation — one node ignites, brightens toward white,      */
/*    then settles back (knowledge spark, never repetitive)                   */
/*  • Idle wave every ~20s: contract -> expand -> orange ring -> settle       */
/*  • Sphere <-> torus morph every ~45s (16s organic transition)              */
/*  • Orbiting motes — small ember/aurora lights circling on tilted paths     */
/*  • Floating sparks — ignite near a node, drift outward, fade               */
/*  • Independent ambient knowledge dust                                      */
/*  • Volumetric progress ring that accelerates while forms submit            */
/*  • Warm key light (lower-left) + cool rim light (upper-right)              */
/*                                                                            */
/*  Composes the shared three-engine (tokens, builders, adaptive budget).     */
/*  Performance: adaptive node count, DPR cap, additive blending,             */
/*  paused frameloop while the tab is hidden, static under reduced motion.    */
/* -------------------------------------------------------------------------- */

const PULSE_POOL = 14;
const SPARK_POOL = 10;

function CoreField({ reducedMotion, nodeCount, palette, busy }) {
  const groupRef = useRef(null);
  const dustRef = useRef(null);
  const waveRingRef = useRef(null);

  const [glowTexture] = useState(() => softGlowTexture());

  const data = useMemo(
    () =>
      buildNodeField({
        nodeCount,
        radius: 5.6,
        palette: [palette.ember, palette.aurora, palette.dim],
        weights: [0.42, 0.72],
        flatten: [1, 0.82, 0.72],
        outlierChance: 0.86,
        outlierScale: 1.32,
      }),
    [nodeCount, palette],
  );
  const torus = useMemo(
    () => buildTorus(data.home, nodeCount, 3.3, 1.5),
    [data.home, nodeCount],
  );
  const { edgePositions, edgeColors, edgeList } = useMemo(
    () => buildEdges(data.home, nodeCount, 2.0, 820),
    [data.home, nodeCount],
  );
  const dustPositions = useMemo(() => buildDust(150, {}), []);

  const [positions] = useState(() => new Float32Array(data.home));
  const [baseColors] = useState(() => new Float32Array(data.colors));
  const positionAttrRef = useRef(null);
  const colorAttrRef = useRef(null);

  const glowRef = useRef({ nodeIndex: -1, progress: 0, nextAt: 3.5 });

  const pulsesRef = useRef(null);
  if (!pulsesRef.current) {
    pulsesRef.current = Array.from({ length: PULSE_POOL }, () => ({
      head: null,
      tail: null,
      active: false,
      a: null,
      b: null,
      prog: 0,
      speed: 0.4,
    }));
  }
  const [pulses] = useState(() => pulsesRef.current);
  const spawnTimer = useRef(1.5);

  const orbitersRef = useRef(null);
  if (!orbitersRef.current) {
    orbitersRef.current = [
      { sprite: null, angle: Math.random() * Math.PI * 2, radius: 4.9, speed: 0.14, bob: 1.1, phase: 0, scale: 0.22, color: palette.ember },
      { sprite: null, angle: Math.random() * Math.PI * 2, radius: 5.6, speed: -0.1, bob: 0.9, phase: 2.1, scale: 0.16, color: palette.aurora },
      { sprite: null, angle: Math.random() * Math.PI * 2, radius: 4.3, speed: 0.19, bob: 0.7, phase: 4.2, scale: 0.13, color: palette.ember },
    ];
  }
  const [orbiters] = useState(() => orbitersRef.current);

  const sparksRef = useRef(null);
  if (!sparksRef.current) {
    sparksRef.current = Array.from({ length: SPARK_POOL }, () => ({
      sprite: null,
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 2,
      scale: 0.12 + Math.random() * 0.1,
    }));
  }
  const [sparks] = useState(() => sparksRef.current);
  const sparkTimer = useRef(0.8);
  const sparkDir = useMemo(() => new THREE.Vector3(), []);

  const morph = useRef({ progress: 0, towardTorus: true, idleUntil: 26 });
  const wave = useRef({ active: false, startedAt: -100 });
  const nextWaveAt = useRef(14);
  const pointerVec = useMemo(() => new THREE.Vector3(), []);
  const baseRotation = useRef(0.05 + Math.random() * 0.015);
  const ringRef = useRef(null);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    /* ---- Morph machine: sphere <-> torus, one slow transition at a time ---- */
    if (t >= morph.current.idleUntil) {
      morph.current.towardTorus = !morph.current.towardTorus;
      morph.current.idleUntil = t + 46;
    }
    const morphTarget = morph.current.towardTorus ? 1 : 0;
    morph.current.progress = THREE.MathUtils.damp(
      morph.current.progress,
      morphTarget,
      0.028,
      dt,
    );
    const morphVal = morph.current.progress;

    /* ---- Idle wave: contract -> expand -> ring ripple, every ~20s ---------- */
    if (!wave.current.active && t >= nextWaveAt.current) {
      wave.current.active = true;
      wave.current.startedAt = t;
      nextWaveAt.current = t + 20 + Math.random() * 10;
    }

    let waveProgress = 0;
    if (wave.current.active) {
      waveProgress = (t - wave.current.startedAt) / 2.6;
      if (waveProgress >= 1) {
        wave.current.active = false;
        waveProgress = 0;
      }
    }

    const breathe = 0.02 * Math.sin(t * 0.55);
    const wavePulse = wave.current.active
      ? 0.07 * Math.sin(waveProgress * Math.PI)
      : 0;

    groupRef.current.scale.setScalar(1 + breathe + wavePulse);

    /* ---- Expanding ember ring during the wave ------------------------------ */
    if (waveRingRef.current) {
      if (wave.current.active) {
        const ringScale = 0.7 + waveProgress * 2.1;
        waveRingRef.current.scale.setScalar(ringScale);
        waveRingRef.current.lookAt(state.camera.position);
        waveRingRef.current.material.opacity = (1 - waveProgress) * 0.5;
        waveRingRef.current.visible = true;
      } else {
        waveRingRef.current.visible = false;
      }
    }

    /* ---- Cursor: tilt toward pointer + repulse nearby nodes ---------------- */
    pointerVec.set(state.pointer.x * 0.9, state.pointer.y * 0.6, 1).normalize();

    groupRef.current.rotation.y += dt * baseRotation.current;
    groupRef.current.rotation.x =
      Math.sin(t * 0.09) * 0.1 +
      Math.cos(t * 0.05) * 0.06 +
      state.pointer.y * 0.1;
    groupRef.current.rotation.z = state.pointer.x * 0.04;

    /* ---- Node field: blend home -> torus, bulge away from cursor ----------- */
    const pos = positions;
    const n = nodeCount;
    const push = 0.9;

    for (let i = 0; i < n; i++) {
      const ix = i * 3;

      const hx = data.home[ix];
      const hy = data.home[ix + 1];
      const hz = data.home[ix + 2];

      let x = hx + (torus[ix] - hx) * morphVal;
      let y = hy + (torus[ix + 1] - hy) * morphVal;
      let z = hz + (torus[ix + 2] - hz) * morphVal;

      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const dot = (x / len) * pointerVec.x + (y / len) * pointerVec.y + (z / len) * pointerVec.z;
      const attract = Math.max(0, dot);

      const scale = 1 + attract * attract * push;
      x *= scale;
      y *= scale;
      z *= scale;

      pos[ix] += (x - pos[ix]) * 0.14;
      pos[ix + 1] += (y - pos[ix + 1]) * 0.14;
      pos[ix + 2] += (z - pos[ix + 2]) * 0.14;
    }
    positionAttrRef.current.needsUpdate = true;

    /* ---- Random node activation: one node ignites toward white, settles ---- */
    const g = glowRef.current;
    if (g.nodeIndex < 0 && t >= g.nextAt) {
      g.nodeIndex = Math.floor(Math.random() * nodeCount);
      g.progress = 0;
      g.nextAt = t + 3 + Math.random() * 4.5;
    }
    if (g.nodeIndex >= 0 && colorAttrRef.current) {
      g.progress += dt / 1.5;
      if (g.progress >= 1) {
        g.nodeIndex = -1;
      } else {
        const env = Math.sin(g.progress * Math.PI);
        const ix = g.nodeIndex * 3;
        data.colors[ix] = baseColors[ix] + (1 - baseColors[ix]) * env;
        data.colors[ix + 1] = baseColors[ix + 1] + (1 - baseColors[ix + 1]) * env;
        data.colors[ix + 2] = baseColors[ix + 2] + (1 - baseColors[ix + 2]) * env;
        colorAttrRef.current.needsUpdate = true;
      }
    }

    /* ---- Orbiting motes — small lights circling on tilted paths ------------ */
    for (const orbiter of orbitersRef.current) {
      if (!orbiter.sprite) continue;
      orbiter.angle += dt * orbiter.speed;
      orbiter.sprite.position.set(
        Math.cos(orbiter.angle) * orbiter.radius,
        Math.sin(orbiter.angle * 0.5 + orbiter.phase) * orbiter.bob,
        Math.sin(orbiter.angle) * orbiter.radius,
      );
      orbiter.sprite.material.opacity = 0.3 + 0.22 * Math.sin(t * 0.9 + orbiter.phase);
    }

    /* ---- Floating sparks — ignite near a node, drift outward, fade -------- */
    sparkTimer.current -= dt;
    if (sparkTimer.current <= 0) {
      const free = sparksRef.current.find((s) => !s.active);
      if (free && free.sprite) {
        sparkDir.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        const r = 4.2 + Math.random() * 1.4;
        free.pos.set(sparkDir.x * r, sparkDir.y * r * 0.82, sparkDir.z * r * 0.72);
        free.vel.set(sparkDir.x * 0.22, sparkDir.y * 0.22 + 0.05, sparkDir.z * 0.22);
        free.life = 0;
        free.maxLife = 1.6 + Math.random() * 1.6;
        free.active = true;
        free.sprite.visible = true;
        free.sprite.material.color.set(Math.random() > 0.72 ? palette.aurora : palette.ember);
      }
      sparkTimer.current = 0.9 + Math.random() * 1.6;
    }

    for (const spark of sparksRef.current) {
      if (!spark.active || !spark.sprite) continue;
      spark.life += dt;
      const lifeRatio = spark.life / spark.maxLife;
      if (lifeRatio >= 1) {
        spark.active = false;
        spark.sprite.visible = false;
        continue;
      }
      spark.pos.addScaledVector(spark.vel, dt);
      spark.sprite.position.copy(spark.pos);
      spark.sprite.material.opacity = (1 - lifeRatio) * 0.75;
    }

    /* ---- Ambient dust drifts independently ---------------------------------- */
    if (dustRef.current) {
      dustRef.current.rotation.y += dt * 0.012;
      dustRef.current.position.y = Math.sin(t * 0.05) * 0.4;
    }

    /* ---- Progress ring: accelerates while the form is submitting ----------- */
    if (ringRef.current) {
      const ringSpeed = busy ? 1.6 : 0.22;
      ringRef.current.rotation.z += dt * ringSpeed;
      const targetOpacity = busy ? 0.55 : 0.22;
      ringRef.current.material.opacity = THREE.MathUtils.damp(
        ringRef.current.material.opacity,
        targetOpacity,
        0.08,
        dt,
      );
      const targetColor = busy ? palette.ember : palette.aurora;
      ringRef.current.material.color.lerp(targetColor, 0.05);
    }

    /* ---- Energy pulses travelling along edges ------------------------------ */
    spawnTimer.current -= dt;

    if (spawnTimer.current <= 0 && edgeList.length > 0) {
      const free = pulsesRef.current.find((p) => !p.active);
      if (free && free.head && free.tail) {
        const edge = edgeList[Math.floor(Math.random() * edgeList.length)];
        free.active = true;
        free.a = edge.a;
        free.b = edge.b;
        free.prog = 0;
        free.speed = 0.55 + Math.random() * 0.4;
        free.head.visible = true;
        free.tail.visible = true;
      }
      spawnTimer.current = 2.2 + Math.random() * 3.2;
    }

    for (const pulse of pulsesRef.current) {
      if (!pulse.active) continue;

      pulse.prog += dt * pulse.speed;
      if (pulse.prog >= 1) {
        pulse.active = false;
        pulse.head.visible = false;
        pulse.tail.visible = false;
        continue;
      }

      const x = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.prog;
      const y = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.prog;
      const z = pulse.a.z + (pulse.b.z - pulse.a.z) * pulse.prog;
      const alpha = Math.sin(pulse.prog * Math.PI);

      pulse.head.position.set(x, y, z);
      pulse.tail.position.set(x, y, z);
      pulse.head.material.opacity = alpha * 0.9;
      pulse.tail.material.opacity = alpha * 0.45;
    }
  });

  const group = (
    <group ref={groupRef}>
      {/* Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute ref={positionAttrRef} attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute ref={colorAttrRef} attach="attributes-color" args={[data.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.058}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connections */}
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

      {/* Volumetric progress ring — spins, accelerates on submit */}
      <mesh ref={ringRef} rotation={[1.15, 0.4, 0]}>
        <torusGeometry args={[4.4, 0.012, 8, 96]} />
        <meshBasicMaterial color={palette.aurora} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Ring-wave expanding ring */}
      <mesh ref={waveRingRef} visible={false}>
        <ringGeometry args={[0.96, 1.0, 64]} />
        <meshBasicMaterial color={palette.ember} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>

      {/* Energy pulses — bright head + dim tail travelling an edge */}
      {pulses.map((pulse, index) => (
        <group key={index}>
          <sprite
            ref={(node) => {
              pulse.head = node;
              if (node) node.visible = false;
            }}
            scale={[0.5, 0.5, 1]}
          >
            <spriteMaterial map={glowTexture} color={palette.ember} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <sprite
            ref={(node) => {
              pulse.tail = node;
              if (node) node.visible = false;
            }}
            scale={[0.26, 0.26, 1]}
          >
            <spriteMaterial map={glowTexture} color={palette.aurora} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}

      {/* Orbiting motes — small lights circling the core on tilted paths */}
      {orbiters.map((orbiter, index) => (
        <sprite
          key={`orbiter-${index}`}
          ref={(node) => {
            orbiter.sprite = node;
          }}
          scale={[orbiter.scale, orbiter.scale, 1]}
        >
          <spriteMaterial map={glowTexture} color={orbiter.color} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}

      {/* Floating sparks — ignite at a node, drift outward, fade away */}
      {sparks.map((spark, index) => (
        <sprite
          key={`spark-${index}`}
          ref={(node) => {
            spark.sprite = node;
            if (node) node.visible = false;
          }}
          scale={[spark.scale, spark.scale, 1]}
        >
          <spriteMaterial map={glowTexture} color={palette.ember} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}

      {/* Warm key light — lower left */}
      <sprite position={[-4.4, -2.8, -3]} scale={[5, 5, 1]}>
        <spriteMaterial map={glowTexture} color={palette.ember} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* Cool rim light — upper right */}
      <sprite position={[4.6, 3, -3.5]} scale={[5.2, 5.2, 1]}>
        <spriteMaterial map={glowTexture} color={palette.aurora} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* Core halo behind the sphere */}
      <sprite position={[0, 0, -4]} scale={[9, 9, 1]}>
        <spriteMaterial map={glowTexture} color={palette.ember} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );

  return (
    <>
      {group}

      {/* Ambient knowledge dust — independent, ultra-small */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={palette.dim}
          transparent
          opacity={0.4}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export default function LivingCoreScene({ className }) {
  const reducedMotion = useReducedMotion();
  const busy = useAuthSceneStore((state) => state.busy);
  const tabHidden = useTabHidden();
  const palette = useScenePalette();

  /* WebGL availability probe — the scene is decorative; on devices or
     browsers without WebGL it must vanish (null) so the auth UI below it
     keeps rendering, never throwing "Error creating WebGL context". */
  const webgl = useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(
        canvas.getContext("webgl2") || canvas.getContext("webgl"),
      );
    } catch {
      return false;
    }
  }, []);

  const { nodeCount, dpr } = useSceneBudget({
    high: 480,
    low: 240,
    baseDpr: 1.5,
  });

  if (!webgl) {
    return null;
  }

  return (
    <div className={className} aria-hidden="true" style={{ pointerEvents: "none" }}>
      <Canvas
        frameloop={reducedMotion || tabHidden ? "demand" : "always"}
        dpr={dpr}
        camera={{ position: [0, 0, 11], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <CoreField
          reducedMotion={reducedMotion}
          nodeCount={nodeCount}
          palette={palette}
          busy={busy}
        />
      </Canvas>
    </div>
  );
}