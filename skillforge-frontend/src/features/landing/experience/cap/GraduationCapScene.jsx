import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import CapEmblem from "./CapEmblem";
import {
  softGlowTexture,
  useReducedMotion,
  useSceneBudget,
  useScenePaletteLive,
  useTabHidden,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  GraduationCapScene — the hero's first visual.                             */
/*  A premium mortarboard: tapered board, skullcap, button and a swaying      */
/*  ember tassel. Slow Y rotation with subtle sinusoidal X/Z, floating lift,  */
/*  damped mouse parallax (desktop), a gentle hover response, and a springy   */
/*  entrance. Materials resolve the --cap-* / --ember tokens live, so the     */
/*  cap re-tints smoothly when the theme switches. Falls back to CapEmblem    */
/*  when WebGL is unavailable and freezes to a static pose under              */
/*  prefers-reduced-motion.                                                   */
/* -------------------------------------------------------------------------- */

const ROTATION_SPEED = 0.16;
const FLOAT_AMPLITUDE = 0.13;
const TASSEL_SWAY = 0.35;
const PARALLAX_Y = 0.26;
const PARALLAX_X = 0.18;
const HOVER_SCALE = 1.05;

/** Exponential damping factor per frame: ~4/s convergence. */
function damp(delta, rate = 4) {
  return 1 - Math.exp(-delta * rate);
}

/** Curves a THREE.Color toward `target` in place. */
function lerpColor(current, target, factor) {
  current.lerp(target, factor);
  return current;
}

function Tassel({ stringMat, tailMat, palette }) {
  const groupRef = useRef(null);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, -0.28, 0),
        new THREE.Vector3(1.05, -0.42, 0.05),
        new THREE.Vector3(1.5, -0.16, 0.08),
      ]),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.9 + 0.8) * TASSEL_SWAY;
    groupRef.current.rotation.z = Math.cos(t * 0.5 + 0.4) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0.1, 0.62, 0]}>
      <mesh geometry={new THREE.TubeGeometry(curve, 16, 0.024, 8)}>
        <meshStandardMaterial
          ref={stringMat}
          color={palette.fabric}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>
      <mesh position={[1.62, -0.44, 0.08]} rotation={[0, 0, -0.18]}>
        <capsuleGeometry args={[0.05, 0.3, 6, 10]} />
        <meshStandardMaterial
          ref={tailMat}
          color={palette.ember}
          emissive={palette.ember}
          roughness={0.45}
          metalness={0.05}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function CapRig({
  reduced,
  hidden,
  palette,
  boardMat,
  fabricMat,
  buttonMat,
  stringMat,
  tailMat,
}) {
  const groupRef = useRef(null);
  const innerRef = useRef(null);
  const scaleRef = useRef({ value: 0, target: 1 });
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const colorState = useRef(null);

  const [glowTexture] = useState(() => softGlowTexture());

  /* Material colors start at the current palette; the frame loop lerps them
     toward the live palette so theme switches blend instead of snapping. */
  useEffect(() => {
    colorState.current = {
      board: new THREE.Color(palette.board),
      fabric: new THREE.Color(palette.fabric),
      ember: new THREE.Color(palette.ember),
    };
  }, [palette]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduced) return undefined;
    const onMove = (event) => {
      pointerRef.current.x = event.clientX / window.innerWidth - 0.5;
      pointerRef.current.y = event.clientY / window.innerHeight - 0.5;
      pointerRef.current.active = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const group = groupRef.current;
    const inner = innerRef.current;
    const paletteColors = colorState.current;

    /* Theme-aware material transition (also applies in reduced-motion, where
       the demand frameloop renders a single frame after a palette change). */
    const boardMaterial = boardMat.current;
    const fabricMaterial = fabricMat.current;
    const stringMaterial = stringMat.current;
    const tailMaterial = tailMat.current;
    if (paletteColors && boardMaterial && fabricMaterial && tailMaterial) {
      const f = damp(delta, 4);
      lerpColor(boardMaterial.color, paletteColors.board, f);
      lerpColor(fabricMaterial.color, paletteColors.fabric, f);
      if (stringMaterial) lerpColor(stringMaterial.color, paletteColors.fabric, f);
      lerpColor(tailMaterial.color, paletteColors.ember, f);
      tailMaterial.emissive.lerp(paletteColors.ember, f);
    }

    if (reduced || hidden || !group || !inner) return;

    /* Entrance + hover scale (springy approach) */
    const s = scaleRef.current;
    s.value += (s.target - s.value) * Math.min(1, delta * 2.4);
    group.scale.setScalar(Math.max(0.0001, s.value));

    /* Slow rotation: primary Y spin, subtle sinusoidal X/Z drift */
    inner.rotation.y += delta * ROTATION_SPEED;
    inner.rotation.x = Math.sin(t * 0.2) * 0.05;
    inner.rotation.z = Math.cos(t * 0.13) * 0.04;

    /* Floating lift */
    inner.position.y = Math.sin(t * 0.8) * FLOAT_AMPLITUDE;

    /* Damped mouse parallax (desktop) */
    const px = pointerRef.current;
    const f = damp(delta, 3.2);
    if (px.active) {
      group.rotation.y += ((px.x * PARALLAX_X) - group.rotation.y) * f;
      group.rotation.x += ((px.y * PARALLAX_Y) - group.rotation.x) * f;
      group.position.x += (-px.x * 0.18 - group.position.x) * f;
    } else {
      group.rotation.y += -group.rotation.y * f;
      group.rotation.x += -group.rotation.x * f;
      group.position.x += -group.position.x * f;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => {
        scaleRef.current.target = HOVER_SCALE;
      }}
      onPointerOut={() => {
        scaleRef.current.target = 1;
      }}
    >
      <group ref={innerRef}>
        {/* Mortarboard — tapered cylinder, top slightly wider */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[1.52, 1.6, 0.1, 48]} />
          <meshStandardMaterial
            ref={boardMat}
            color={palette.board}
            roughness={0.72}
            metalness={0.08}
          />
        </mesh>

        {/* Skullcap — flattened hemisphere */}
        <mesh position={[0, 0, 0]} scale={[1, 0.92, 1]}>
          <sphereGeometry args={[1.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            ref={fabricMat}
            color={palette.fabric}
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>

        {/* Button */}
        <mesh position={[0, 0.68, 0]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial
            ref={buttonMat}
            color={palette.board}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>

        <Tassel stringMat={stringMat} tailMat={tailMat} palette={palette} />
      </group>

      {/* Soft contact shadow + ember under-glow */}
      <sprite position={[0, -1.42, 0]} scale={[3.8, 1.9, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.dim}
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </sprite>
      <sprite position={[0, -0.7, 1.5]} scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.ember}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function CapCanvas({ reduced, hidden }) {
  const palette = useScenePaletteLive();
  const { dpr } = useSceneBudget({ high: 480, low: 240, baseDpr: 1.75 });

  /* One ref per material, shared with the frame loop for theme lerping. */
  const boardMat = useRef(null);
  const fabricMat = useRef(null);
  const buttonMat = useRef(null);
  const stringMat = useRef(null);
  const tailMat = useRef(null);

  const lightPalette = useMemo(
    () => ({
      key: "#fff7ec",
      aurora: palette.aurora,
      ember: palette.ember,
    }),
    [palette],
  );

  return (
    <Canvas
      dpr={dpr}
      frameloop={reduced ? "demand" : "always"}
      camera={{ position: [0, 1.05, 5.3], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4.5, 5]} intensity={1.15} color={lightPalette.key} />
      <directionalLight position={[-4, 2, -3]} intensity={0.55} color={lightPalette.aurora} />
      <pointLight position={[0, -2.2, 2.4]} intensity={2.2} distance={6} color={lightPalette.ember} />

      <CapRig
        reduced={reduced}
        hidden={hidden}
        palette={palette}
        boardMat={boardMat}
        fabricMat={fabricMat}
        buttonMat={buttonMat}
        stringMat={stringMat}
        tailMat={tailMat}
      />
    </Canvas>
  );
}

export default function GraduationCapScene({ className }) {
  const reduced = useReducedMotion();
  const hidden = useTabHidden();

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

  if (!webgl) {
    return <CapEmblem className={className} />;
  }

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <CapCanvas reduced={reduced} hidden={hidden} />
    </div>
  );
}
