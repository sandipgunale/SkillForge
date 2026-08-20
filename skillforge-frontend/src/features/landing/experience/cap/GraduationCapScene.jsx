import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import CapEmblem from "./CapEmblem";
import { useMountAnimation } from "@/lib/motion-gsap";
import {
  softGlowTexture,
  useOffscreen,
  useReducedMotion,
  useSceneBudget,
  useScenePaletteLive,
  useTabHidden,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  GraduationCapScene — a giant realistic graduation cap.                    */
/*  A premium mortarboard: square beveled board, skullcap, center button,     */
/*  and a tassel whose yaw LAGS behind the cap's spin (damped secondary       */
/*  motion) with a gentle pendulum sway. Slow Y rotation with subtle          */
/*  sinusoidal X/Z, floating lift, damped mouse parallax (desktop), and a     */
/*  springy entrance. Mounted in the hero (00 ARRIVAL) and the finale         */
/*  (13 MASTERY) as a decorative backdrop (pointer-events: none). Materials   */
/*  resolve the --cap-* / --ember tokens live, so the cap re-tints smoothly   */
/*  when the theme switches. Falls back to CapEmblem when WebGL is            */
/*  unavailable and freezes to a static pose under prefers-reduced-motion.    */
/* -------------------------------------------------------------------------- */

const ROTATION_SPEED = 0.09;
const ROTATION_BREATH = 0.42;
const FLOAT_AMPLITUDE = 0.08;
const FLOAT_RATE = 0.55;
const TASSEL_SWAY = 0.1;
const PARALLAX_Y = 0.18;
const PARALLAX_X = 0.14;
const TASSEL_LAG_RATE = 2.8;

/** Exponential damping factor per frame: ~rate/s convergence. */
function damp(delta, rate) {
  return 1 - Math.exp(-delta * rate);
}

/**
 * Subtle woven-fabric bump map generated once on a tiny canvas — thread
 * diagonal warp/weft lines over speckled noise. Used as a bumpMap so the
 * board and skullcap read as premium fabric instead of flat plastic.
 * Greyscale (bump maps are never color-managed).
 */
function fabricBumpTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  for (let y = -size; y < size * 2; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y - size);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  for (let y = -size; y < size * 2; y += 4) {
    ctx.beginPath();
    ctx.moveTo(size, y);
    ctx.lineTo(0, y - size);
    ctx.stroke();
  }

  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    data[i] = 128 + n;
    data[i + 1] = 128 + n;
    data[i + 2] = 128 + n;
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/** Curves a THREE.Color toward `target` in place. */
function lerpColor(current, target, factor) {
  current.lerp(target, factor);
  return current;
}

function Tassel({ stringMat, tailMat, knotMat, palette, tasselRef, lagRef }) {
  /* Cord: from the center button, across the board top, over the front
     right edge, dangling beside the board. */
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.03, 0),
        new THREE.Vector3(0.85, 0.03, 0.1),
        new THREE.Vector3(1.45, 0.0, 0.16),
        new THREE.Vector3(1.62, -0.28, 0.15),
      ]),
    [],
  );

  useFrame((state) => {
    const group = tasselRef.current;
    if (!group) return;
    /* The pendulum is driven by the cap's lag error: when the cap changes
       direction the tassel whips briefly, then damps back to a whisper of
       idle drift. Clamped so it never swings theatrically. */
    const error = lagRef.current;
    const sway = Math.max(-TASSEL_SWAY, Math.min(TASSEL_SWAY, error * 0.55));
    const t = state.clock.elapsedTime;
    group.rotation.x = sway + Math.sin(t * 0.4 + 0.8) * 0.035;
    group.rotation.z = Math.cos(t * 0.3 + 0.4) * 0.03;
  });

  return (
    <group ref={tasselRef} position={[0, 0.62, 0]}>
      <mesh geometry={new THREE.TubeGeometry(curve, 24, 0.026, 8)}>
        <meshStandardMaterial
          ref={stringMat}
          color={palette.fabric}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>
      {/* Knot where the cord leaves the board edge */}
      <mesh position={[1.63, -0.3, 0.15]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial
          ref={knotMat}
          color={palette.ember}
          roughness={0.5}
          metalness={0.04}
        />
      </mesh>
      {/* Dangling tassel tail */}
      <mesh position={[1.62, -0.62, 0.15]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.05, 0.34, 6, 10]} />
        <meshStandardMaterial
          ref={tailMat}
          color={palette.ember}
          emissive={palette.ember}
          roughness={0.45}
          metalness={0.05}
          emissiveIntensity={0.18}
        />
      </mesh>
    </group>
  );
}

function CapRig({
  reduced,
  hidden,
  entrance,
  palette,
  bump,
  boardMat,
  fabricMat,
  buttonMat,
  stringMat,
  knotMat,
  tailMat,
}) {
  const groupRef = useRef(null);
  const innerRef = useRef(null);
  const tasselRef = useRef(null);
  const shadowRef = useRef(null);
  /* Entrance scale — underdamped spring with a slight overshoot, so the cap
     settles into place like it was set down, not dropped. `entrance="idle"`
     starts at rest (value 1): the hero beat timeline owns that appearance. */
  const springRef = useRef({
    value: entrance === "idle" ? 1 : 0.0001,
    target: 1,
    vel: 0,
  });
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const lagRef = useRef(0);
  const colorState = useRef(null);

  /* The addon class is CJS-interop wrapped by Vite, so it must be invoked
     explicitly with `new` (JSX construction fails in @react-three/fiber). */
  const boardGeometry = useMemo(
    () => new RoundedBoxGeometry(3.2, 0.12, 3.2, 6, 0.08),
    [],
  );

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
    const knotMaterial = knotMat.current;
    const tailMaterial = tailMat.current;
    if (paletteColors && boardMaterial && fabricMaterial && tailMaterial) {
      const f = damp(delta, 4);
      lerpColor(boardMaterial.color, paletteColors.board, f);
      lerpColor(fabricMaterial.color, paletteColors.fabric, f);
      if (stringMaterial) lerpColor(stringMaterial.color, paletteColors.fabric, f);
      if (knotMaterial) lerpColor(knotMaterial.color, paletteColors.ember, f);
      lerpColor(tailMaterial.color, paletteColors.ember, f);
      tailMaterial.emissive.lerp(paletteColors.ember, f);
    }

    if (reduced || !group || !inner) {
      /* Static pose under reduced motion: the demand frameloop only renders
         on invalidate (pointer events, resize), so the entrance spring would
         otherwise freeze at its scale-0.0001 start — an invisible cap until
         the user clicks. Settle the spring so the very first frame draws the
         cap at full size. */
      if (reduced && group) {
        const s = springRef.current;
        s.value = 1;
        s.vel = 0;
        group.scale.setScalar(1);
      }
      return;
    }
    if (hidden) return;

    /* Entrance spring (skipped when entrance="idle" — spring starts at rest) */
    const spring = springRef.current;
    spring.vel += (spring.target - spring.value) * 32 * delta;
    spring.vel *= Math.max(0, 1 - 9 * delta);
    spring.value += spring.vel * delta;
    group.scale.setScalar(Math.max(0.0001, spring.value));

    /* Slow rotation with a long, organic breath: the spin speed swells and
       fades on a ~90s cycle so it never reads as a mechanical loop. */
    const breath = 1 + ROTATION_BREATH * Math.sin(t * 0.07 + 1.3);
    inner.rotation.y += delta * ROTATION_SPEED * breath;
    inner.rotation.x = Math.sin(t * 0.11) * 0.032;
    inner.rotation.z = Math.cos(t * 0.083) * 0.026;

    /* Tassel secondary motion: its yaw lags behind the cap's spin, so it
       drags and catches up — damped, never rigid. */
    lagRef.current += (inner.rotation.y - lagRef.current) * damp(delta, TASSEL_LAG_RATE);
    if (tasselRef.current) {
      tasselRef.current.rotation.y = -(inner.rotation.y - lagRef.current);
    }

    /* Floating lift — a slow, barely-there hover */
    inner.position.y = Math.sin(t * FLOAT_RATE) * FLOAT_AMPLITUDE;

    /* Damped mouse parallax (desktop) */
    const px = pointerRef.current;
    const f = damp(delta, 3.2);
    if (px.active) {
      group.rotation.y += ((px.x * PARALLAX_X) - group.rotation.y) * f;
      group.rotation.x += ((px.y * PARALLAX_Y) - group.rotation.x) * f;
      group.position.x += (-px.x * 0.12 - group.position.x) * f;
    } else {
      group.rotation.y += -group.rotation.y * f;
      group.rotation.x += -group.rotation.x * f;
      group.position.x += -group.position.x * f;
    }

    /* Contact shadow follows the cap: it slides opposite the drift and
       deepens slightly as the cap tilts, grounding the float. */
    const shadow = shadowRef.current;
    if (shadow) {
      shadow.position.x = -group.position.x * 1.2;
      const tilt = Math.abs(group.rotation.x) * 0.5 + Math.abs(group.rotation.y) * 0.25;
      shadow.material.opacity = 0.24 + Math.min(0.09, tilt);
      const k = Math.max(0.86, 1 - tilt * 0.3);
      shadow.scale.set(3.8 * k, 1.9 * k, 1);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        {/* Mortarboard — square, beveled, with real thickness */}
        <mesh geometry={boardGeometry} position={[0, 0.58, 0]}>
          <meshStandardMaterial
            ref={boardMat}
            color={palette.board}
            roughness={0.72}
            metalness={0.08}
            bumpMap={bump}
            bumpScale={0.02}
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
            bumpMap={bump}
            bumpScale={0.014}
          />
        </mesh>

        {/* Center button */}
        <mesh position={[0, 0.66, 0]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial
            ref={buttonMat}
            color={palette.board}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>

        <Tassel
          stringMat={stringMat}
          tailMat={tailMat}
          knotMat={knotMat}
          palette={palette}
          tasselRef={tasselRef}
          lagRef={lagRef}
        />
      </group>

      {/* Soft contact shadow + ember under-glow */}
      <sprite ref={shadowRef} position={[0, -1.42, 0]} scale={[3.8, 1.9, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.dim}
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </sprite>
      <sprite position={[0, -0.7, 1.5]} scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.ember}
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function CapCanvas({ reduced, hidden, entrance }) {
  const containerRef = useRef(null);
  const palette = useScenePaletteLive(containerRef);
  const { dpr } = useSceneBudget({ high: 480, low: 240, baseDpr: 1.75 });

  /* Woven-fabric bump map, generated once and disposed with the scene. */
  const bump = useMemo(() => fabricBumpTexture(), []);
  useEffect(() => () => bump.dispose(), [bump]);

  /* One ref per material, shared with the frame loop for theme lerping. */
  const boardMat = useRef(null);
  const fabricMat = useRef(null);
  const buttonMat = useRef(null);
  const stringMat = useRef(null);
  const knotMat = useRef(null);
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
    <div ref={containerRef} className="h-full w-full">
      <Canvas
      dpr={dpr}
      frameloop={reduced || hidden ? "demand" : "always"}
      camera={{ position: [0, 1.05, 4.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#fff7ec", "#17131c", 0.45]} />
      <directionalLight position={[3, 4.5, 5]} intensity={1.15} color={lightPalette.key} />
      <directionalLight position={[-4, 2, -3]} intensity={0.55} color={lightPalette.aurora} />
      <directionalLight position={[4, 3, -4]} intensity={0.5} color={lightPalette.key} />
      <pointLight position={[0, -2.2, 2.4]} intensity={1.3} distance={7} color={lightPalette.ember} />

      <CapRig
        reduced={reduced}
        hidden={hidden}
        entrance={entrance}
        palette={palette}
        bump={bump}
        boardMat={boardMat}
        fabricMat={fabricMat}
        buttonMat={buttonMat}
        stringMat={stringMat}
        knotMat={knotMat}
        tailMat={tailMat}
      />
      </Canvas>
    </div>
  );
}

export default function GraduationCapScene({ className, entrance = "spring" }) {
  const reduced = useReducedMotion();
  const tabHidden = useTabHidden();
  const { ref: viewRef, off } = useOffscreen();
  const hidden = tabHidden || off;

  /* Self-fade on mount: parents swap this scene in under a Suspense boundary
     whose timing they cannot control, so the fade must live here — the scene
     guarantees it is visible no matter when the lazy chunk resolves. Reduced
     motion: no fade, immediately visible. */
  useMountAnimation(viewRef, [], {
    duration: 0.8,
    ease: "expo.out",
  });

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
    <div ref={viewRef} className={className} aria-hidden="true" style={{ pointerEvents: "none" }}>
      <CapCanvas reduced={reduced} hidden={hidden} entrance={entrance} />
    </div>
  );
}