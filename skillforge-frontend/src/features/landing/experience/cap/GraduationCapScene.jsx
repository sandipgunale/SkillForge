import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import CapEmblem from "./CapEmblem";
import { useMountAnimation } from "@/lib/motion-gsap";
import {
  attachContextLoss,
  softGlowTexture,
  useOffscreen,
  useReducedMotion,
  useSceneBudget,
  useScenePaletteLive,
  useTabHidden,
} from "@/lib/three-engine";

/* -------------------------------------------------------------------------- */
/*  GraduationCapScene — a rebuilt, realistic academic mortarboard.           */
/*  Structure (bottom to top): a tapered lathe crown with a real circular     */
/*  opening and dark inner cavity, gold trim ring + band around the opening,  */
/*  a diamond-oriented beveled square board, a center button, and a gold      */
/*  cord + multi-strand tassel whose yaw LAGS behind the cap's slow spin.     */
/*  Five distinct materials: blue-black board fabric, slightly lighter crown  */
/*  fabric, deep interior, polished ceremonial gold (trim/cord/strands), and  */
/*  a warm under-glow. Studio key/fill/rim lighting with a gold accent light. */
/*  The rig starts tilted forward (underside visible) with a diamond board    */
/*  presentation, then idles with an extremely slow Y spin + breathing X/Z    */
/*  and floating lift; damped mouse parallax (desktop) and a springy          */
/*  entrance. Decorative (pointer-events: none) backdrop for 00 ARRIVAL and   */
/*  13 MASTERY. Materials resolve the --cap-* / --ember tokens live, so the   */
/*  cap re-tints smoothly on theme switch. Falls back to CapEmblem when       */
/*  WebGL is unavailable and freezes to a static pose under reduced motion.   */
/* -------------------------------------------------------------------------- */

const ROTATION_SPEED = 0.055;
const ROTATION_BREATH = 0.3;
const BASE_TILT = -0.2;
const INITIAL_YAW = -0.55;
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

/** Curves a THREE.Color toward `target` in place. */
function lerpColor(current, target, factor) {
  current.lerp(target, factor);
  return current;
}

/**
 * Subtle woven-fabric bump map generated once on a tiny canvas — thread
 * diagonal warp/weft lines over speckled noise. Used as a bumpMap so the
 * board and crown read as premium fabric instead of flat plastic.
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

/**
 * Lathe profile of the crown: a slightly tapered, rounded-top fabric cap
 * with a circular opening at the bottom (the wearable underside). Not a
 * hemisphere, not a cylinder — the wall thins toward the rim and the top
 * domes gently, so it reads as cloth stretched over a head.
 */
function crownProfile() {
  return [
    new THREE.Vector2(1.0, 0.0),
    new THREE.Vector2(1.0, 0.035),
    new THREE.Vector2(0.965, 0.09),
    new THREE.Vector2(0.9, 0.18),
    new THREE.Vector2(0.8, 0.3),
    new THREE.Vector2(0.66, 0.42),
    new THREE.Vector2(0.48, 0.52),
    new THREE.Vector2(0.26, 0.585),
    new THREE.Vector2(0.09, 0.615),
    new THREE.Vector2(0.0, 0.625),
  ];
}

/**
 * The tassel's hanging strands, merged into ONE geometry (single draw call).
 * Fourteen fine capsules with tiny random splay and length variance — reads
 * as loose lightweight threads, not a rigid cylinder.
 */
function buildStrandGeometry() {
  const geoms = [];
  for (let i = 0; i < 14; i += 1) {
    const len = 0.38 + Math.random() * 0.1;
    const strand = new THREE.CapsuleGeometry(0.013, len, 3, 5);
    strand.rotateZ((Math.random() - 0.5) * 0.08);
    strand.rotateX((Math.random() - 0.5) * 0.08);
    strand.translate((Math.random() - 0.5) * 0.05, -(0.09 + len / 2), (Math.random() - 0.5) * 0.05);
    geoms.push(strand);
  }
  const merged = mergeGeometries(geoms);
  geoms.forEach((g) => g.dispose());
  return merged;
}

function Tassel({ gold, cordMat, knotMat, goldMat, tasselRef, lagRef }) {
  /* Cord: from the center button, across the board top, over the front-right
     edge, dropping beside the board to the tassel head. */
  const cordCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.84, 0),
        new THREE.Vector3(0.75, 0.85, 0.03),
        new THREE.Vector3(1.45, 0.82, 0.07),
        new THREE.Vector3(1.68, 0.6, 0.1),
        new THREE.Vector3(1.78, 0.25, 0.12),
        new THREE.Vector3(1.74, -0.12, 0.12),
        new THREE.Vector3(1.66, -0.34, 0.1),
      ]),
    [],
  );
  const cordGeometry = useMemo(
    () => new THREE.TubeGeometry(cordCurve, 32, 0.022, 8),
    [cordCurve],
  );
  const strandGeometry = useMemo(() => buildStrandGeometry(), []);

  useEffect(() => () => cordGeometry.dispose(), [cordGeometry]);
  useEffect(() => () => strandGeometry.dispose(), [strandGeometry]);

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
    <group ref={tasselRef} position={[1.66, -0.34, 0.1]}>
      {/* Cord — gold, natural curve over the board edge */}
      <mesh geometry={cordGeometry}>
        <meshStandardMaterial
          ref={cordMat}
          color={gold}
          roughness={0.32}
          metalness={0.8}
        />
      </mesh>
      {/* Knot where the cord leaves the board edge */}
      <mesh position={[1.68, 0.6, 0.1]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial
          ref={knotMat}
          color={gold}
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>
      {/* Tassel head — flattened knot + flared collar */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial
          ref={goldMat}
          color={gold}
          roughness={0.38}
          metalness={0.75}
        />
      </mesh>
      <mesh position={[0, -0.045, 0]}>
        <cylinderGeometry args={[0.075, 0.1, 0.09, 12]} />
        <meshStandardMaterial
          ref={goldMat}
          color={gold}
          roughness={0.38}
          metalness={0.75}
        />
      </mesh>
      {/* Hanging strands — one merged geometry */}
      <mesh geometry={strandGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          ref={goldMat}
          color={gold}
          roughness={0.4}
          metalness={0.7}
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
  crownMat,
  innerMat,
  trimMat,
  cordMat,
  knotMat,
  goldMat,
  buttonMat,
  tasselRef,
}) {
  const groupRef = useRef(null);
  const innerRef = useRef(null);
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
  const lagRef = useRef(INITIAL_YAW);
  const spinRef = useRef(INITIAL_YAW);
  const colorState = useRef(null);

  /* The addon class is CJS-interop wrapped by Vite, so it must be invoked
     explicitly with `new` (JSX construction fails in @react-three/fiber). */
  const boardGeometry = useMemo(
    () => new RoundedBoxGeometry(3.2, 0.16, 3.2, 6, 0.1),
    [],
  );
  const crownGeometry = useMemo(
    () => new THREE.LatheGeometry(crownProfile(), 48),
    [],
  );
  /* Inner cavity: a hemisphere facing INTO the crown — actual depth that
     reads darker through the opening, never a painted circle. */
  const innerGeometry = useMemo(
    () => new THREE.SphereGeometry(0.96, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    [],
  );
  const trimGeometry = useMemo(
    () => new THREE.TorusGeometry(1.07, 0.05, 16, 64),
    [],
  );
  const bandGeometry = useMemo(
    () => new THREE.CylinderGeometry(1.06, 1.06, 0.16, 48, 1, true),
    [],
  );

  const [glowTexture] = useState(() => softGlowTexture());

  /* Material colors start at the current palette; the frame loop lerps them
     toward the live palette so theme switches blend instead of snapping. */
  useEffect(() => {
    colorState.current = {
      board: new THREE.Color(palette.board),
      fabric: new THREE.Color(palette.fabric),
      gold: new THREE.Color(palette.gold),
      inner: new THREE.Color(palette.fabric).multiplyScalar(0.42),
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
    const crownMaterial = crownMat.current;
    const innerMaterial = innerMat.current;
    const trimMaterial = trimMat.current;
    const cordMaterial = cordMat.current;
    const knotMaterial = knotMat.current;
    const goldMaterial = goldMat.current;
    const buttonMaterial = buttonMat.current;
    if (paletteColors && boardMaterial && crownMaterial && trimMaterial) {
      const f = damp(delta, 4);
      lerpColor(boardMaterial.color, paletteColors.board, f);
      lerpColor(crownMaterial.color, paletteColors.fabric, f);
      if (innerMaterial) lerpColor(innerMaterial.color, paletteColors.inner, f);
      if (trimMaterial) lerpColor(trimMaterial.color, paletteColors.gold, f);
      if (cordMaterial) lerpColor(cordMaterial.color, paletteColors.gold, f);
      if (knotMaterial) lerpColor(knotMaterial.color, paletteColors.gold, f);
      if (goldMaterial) lerpColor(goldMaterial.color, paletteColors.gold, f);
      if (buttonMaterial) lerpColor(buttonMaterial.color, paletteColors.board, f);
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

    /* Extremely slow rotation with a long, organic breath: the spin speed
       swells and fades on a ~90s cycle so it never reads as a mechanical
       loop. The rig starts yawed (diamond presentation) and tilted forward
       so the underside + gold trim read from the very first frame. */
    const breath = 1 + ROTATION_BREATH * Math.sin(t * 0.07 + 1.3);
    spinRef.current += delta * ROTATION_SPEED * breath;
    inner.rotation.y = spinRef.current;
    inner.rotation.x = BASE_TILT + Math.sin(t * 0.11) * 0.032;
    inner.rotation.z = Math.cos(t * 0.083) * 0.026;

    /* Tassel secondary motion: its yaw lags behind the cap's spin, so it
       drags and catches up — damped, never rigid. */
    lagRef.current += (spinRef.current - lagRef.current) * damp(delta, TASSEL_LAG_RATE);
    if (tasselRef.current) {
      tasselRef.current.rotation.y = -(spinRef.current - lagRef.current);
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
        {/* Crown — tapered fabric cap with a real circular opening. The
            bottom rim is open, so the dark inner cavity is actual depth. */}
        <mesh geometry={crownGeometry} position={[0, 0, 0]}>
          <meshStandardMaterial
            ref={crownMat}
            color={palette.fabric}
            roughness={0.85}
            metalness={0.02}
            bumpMap={bump}
            bumpScale={0.014}
          />
        </mesh>

        {/* Inner cavity — inverted dome facing into the crown */}
        <mesh geometry={innerGeometry} position={[0, 0.02, 0]}>
          <meshStandardMaterial
            ref={innerMat}
            color={palette.fabric}
            roughness={0.95}
            metalness={0}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Gold trim — ring around the circular lower edge + band above it */}
        <mesh geometry={trimGeometry} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <meshStandardMaterial
            ref={trimMat}
            color={palette.gold}
            roughness={0.28}
            metalness={0.85}
          />
        </mesh>
        <mesh geometry={bandGeometry} position={[0, 0.11, 0]}>
          <meshStandardMaterial
            ref={trimMat}
            color={palette.gold}
            roughness={0.28}
            metalness={0.85}
          />
        </mesh>

        {/* Mortarboard — square, diamond-oriented, beveled, real thickness */}
        <mesh geometry={boardGeometry} position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]}>
          <meshStandardMaterial
            ref={boardMat}
            color={palette.board}
            roughness={0.72}
            metalness={0.08}
            bumpMap={bump}
            bumpScale={0.02}
          />
        </mesh>

        {/* Center button */}
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshStandardMaterial
            ref={buttonMat}
            color={palette.board}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>

        <Tassel
          gold={palette.gold}
          cordMat={cordMat}
          knotMat={knotMat}
          goldMat={goldMat}
          tasselRef={tasselRef}
          lagRef={lagRef}
        />
      </group>

      {/* Soft contact shadow + ember under-glow */}
      <sprite ref={shadowRef} position={[0, -1.5, 0]} scale={[3.8, 1.9, 1]}>
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

/* Studio environment: one PMREM-processed RoomEnvironment shared by all
   materials (set imperatively on Canvas mount, so metals reflect the soft
   studio walls instead of reading as dim plastic). Subtle intensity so the
   dark fabric keeps its character. Returns the texture so the owner can
   dispose it on unmount — an undisposed PMREM texture leaks GPU memory on
   every remount (dev HMR, route navigation, StrictMode double-mounting). */
function applyStudioEnvironment(state) {
  const pmrem = new THREE.PMREMGenerator(state.gl);
  const env = new RoomEnvironment(state.gl);
  const texture = pmrem.fromScene(env, 0.04).texture;
  state.scene.environment = texture;
  state.scene.environmentIntensity = 0.55;
  env.dispose();
  pmrem.dispose();
  return texture;
}

function CapCanvas({ reduced, hidden, entrance, onContextLost, onContextRestored }) {
  const containerRef = useRef(null);
  const palette = useScenePaletteLive(containerRef);
  const { dpr } = useSceneBudget({ high: 480, low: 240, baseDpr: 1.75 });

  /* Woven-fabric bump map, generated once and disposed with the scene. */
  const bump = useMemo(() => fabricBumpTexture(), []);
  useEffect(() => () => bump.dispose(), [bump]);

  /* The PMREM environment texture is created imperatively in onCreated, so it
     is NOT auto-disposed by R3F — dispose it explicitly on unmount. */
  const envTexture = useRef(null);
  useEffect(
    () => () => {
      if (envTexture.current) {
        envTexture.current.dispose();
        envTexture.current = null;
      }
    },
    [],
  );

  /* One ref per material, shared with the frame loop for theme lerping. */
  const boardMat = useRef(null);
  const crownMat = useRef(null);
  const innerMat = useRef(null);
  const trimMat = useRef(null);
  const cordMat = useRef(null);
  const knotMat = useRef(null);
  const goldMat = useRef(null);
  const buttonMat = useRef(null);
  const tasselRef = useRef(null);

  const lightPalette = useMemo(
    () => ({
      key: "#fff7ec",
      aurora: palette.aurora,
      gold: palette.gold,
      ember: palette.ember,
    }),
    [palette],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        dpr={dpr}
        frameloop={reduced || hidden ? "demand" : "always"}
        camera={{ position: [0, 0.95, 4.35], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={(state) => {
          envTexture.current = applyStudioEnvironment(state);
          attachContextLoss(
            state.gl.domElement,
            onContextLost,
            onContextRestored,
          );
        }}
      >
        {/* Studio lighting: warm key, cool fill, rim separation, gold accent */}
        <ambientLight intensity={0.32} />
        <hemisphereLight args={["#fff7ec", "#14101a", 0.5]} />
        <directionalLight position={[3.5, 5, 5]} intensity={1.35} color={lightPalette.key} />
        <directionalLight position={[-4.5, 1.5, 2.5]} intensity={0.45} color={lightPalette.aurora} />
        <directionalLight position={[-2.5, 3.5, -4.5]} intensity={0.65} color="#dfe8ff" />
        <pointLight position={[2.4, -1.2, 3.2]} intensity={1.6} distance={6} color={lightPalette.gold} />

        <CapRig
          reduced={reduced}
          hidden={hidden}
          entrance={entrance}
          palette={palette}
          bump={bump}
          boardMat={boardMat}
          crownMat={crownMat}
          innerMat={innerMat}
          trimMat={trimMat}
          cordMat={cordMat}
          knotMat={knotMat}
          goldMat={goldMat}
          buttonMat={buttonMat}
          tasselRef={tasselRef}
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

  /* WebGL context loss (GPU pressure, driver reset) — the Three.js canvas
     goes permanently dead and there is no R3F handling for it. Swap in the
     CapEmblem fallback until the context is restored, so the cap slot is
     never an empty/warm-glow dead canvas. */
  const [glLost, setGlLost] = useState(false);
  const handleContextLost = useCallback(() => setGlLost(true), []);
  const handleContextRestored = useCallback(() => setGlLost(false), []);

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

  if (!webgl || glLost) {
    return <CapEmblem className={className} />;
  }

  return (
    <div ref={viewRef} className={className} aria-hidden="true" style={{ pointerEvents: "none" }}>
      <CapCanvas
        reduced={reduced}
        hidden={hidden}
        entrance={entrance}
        onContextLost={handleContextLost}
        onContextRestored={handleContextRestored}
      />
    </div>
  );
}
