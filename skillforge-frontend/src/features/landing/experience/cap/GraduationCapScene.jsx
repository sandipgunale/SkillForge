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
/*  GraduationCapScene — a realistic academic mortarboard, built to real       */
/*  proportions.                                                               */
/*  Structure (bottom to top): a skull-cap crown (LatheGeometry, 0.68          */
/*  diameter x 0.32 high — a rounded fabric cap, NOT a hemisphere) with a      */
/*  dark inner cavity, a thin gold trim ring around its base, a square         */
/*  beveled board (1.0 wide, 0.026 thick, subtle 0.012 edge radius) held       */
/*  diamond-oriented on top, a small gold center button, and a thin gold       */
/*  cord running from the button to the front corner where the tassel hangs    */
/*  (knot + head + one merged 14-strand geometry). Gold is ceremonial and      */
/*  restrained — fine trims, not rings.                                        */
/*  Five materials: charcoal board fabric, slightly lighter crown fabric,      */
/*  deep interior, polished gold (trims/cord/tassel), warm under-glow.          */
/*  Studio key/fill/rim lighting with a gold accent light. The rig starts      */
/*  tilted forward (underside + trim visible) with a diamond board, idles      */
/*  with an extremely slow Y spin + breathing X/Z + floating lift, and damped  */
/*  mouse parallax (desktop) and a springy entrance. Decorative (pointer-      */
/*  events: none) backdrop for 00 ARRIVAL and 13 MASTERY. Materials resolve    */
/*  the --cap-* / --ember tokens live, so the cap re-tints on theme switch.    */
/*  Falls back to CapEmblem when WebGL is unavailable and freezes to a static  */
/*  pose under reduced motion. The camera frames the cap comfortably (it      */
/*  occupies ~70% of the slot) — never filling the viewport.                   */
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

/* Real mortarboard proportions (board width = 1.0) */
const BOARD = 1.0; /* board width (square) */
const BOARD_THICKNESS = 0.03; /* subtle, believable physical thickness */
const BOARD_BEVEL = 0.006; /* crisp board with a soft, non-CG edge */
const CROWN_RADIUS = 0.34; /* crown diameter 0.68 */
const CROWN_HEIGHT = 0.26; /* shallow skullcap — not a tall dome/helmet */
const BUTTON_RADIUS = 0.045;
const CORD_RADIUS = 0.012;
const BOARD_TOP = CROWN_HEIGHT + BOARD_THICKNESS / 2; /* 0.275 */
const BOARD_CORNER = (BOARD / 2) * Math.SQRT2; /* 0.707 — diamond corner reach */
/* Tassel hang point: just past the front corner, below the board edge */
const TASSEL_HANG = [0.66, 0.16, 0];

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
 * Lathe profile of the skull cap: a shallow, structured fabric cap, 0.68
 * diameter, ~0.275 tall, with a circular opening at the bottom (the wearable
 * underside). A short straight side-band then a gentle taper to a flattened
 * top — the contour of cloth stretched over a head, NOT a hemisphere/helmet.
 */
function crownProfile() {
  return [
    new THREE.Vector2(0.34, 0.0),
    new THREE.Vector2(0.34, 0.05),
    new THREE.Vector2(0.334, 0.12),
    new THREE.Vector2(0.318, 0.19),
    new THREE.Vector2(0.275, 0.24),
    new THREE.Vector2(0.19, 0.262),
    new THREE.Vector2(0.1, 0.27),
    new THREE.Vector2(0.0, 0.275),
  ];
}

/**
 * The tassel's hanging strands, merged into ONE geometry (single draw call).
 * Many fine capsules with tiny random splay and length variance — reads as
 * loose lightweight woven threads hanging from the collar, never a rigid
 * cylinder or a single extruded mesh.
 */
function buildStrandGeometry() {
  const geoms = [];
  for (let i = 0; i < 24; i += 1) {
    const len = 0.24 + Math.random() * 0.1;
    const strand = new THREE.CapsuleGeometry(0.008, len, 3, 5);
    strand.rotateZ((Math.random() - 0.5) * 0.11);
    strand.rotateX((Math.random() - 0.5) * 0.11);
    strand.translate(
      (Math.random() - 0.5) * 0.05,
      -(0.07 + len / 2),
      (Math.random() - 0.5) * 0.05,
    );
    geoms.push(strand);
  }
  const merged = mergeGeometries(geoms);
  geoms.forEach((g) => g.dispose());
  return merged;
}

function Tassel({ gold, knotMat, goldMat, tasselRef, lagRef, strandGeometry }) {
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
    <group ref={tasselRef} position={TASSEL_HANG}>
      {/* Knot where the cord leaves the board corner — meets the cord's endpoint */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.028, 12, 10]} />
        <meshStandardMaterial
          ref={knotMat}
          color={gold}
          roughness={0.55}
          metalness={0.18}
        />
      </mesh>
      {/* Tassel head — flattened knot + flared collar */}
      <mesh position={[0, -0.035, 0]}>
        <sphereGeometry args={[0.032, 12, 10]} />
        <meshStandardMaterial
          ref={goldMat}
          color={gold}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.05, 12]} />
        <meshStandardMaterial
          ref={goldMat}
          color={gold}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>
      {/* Hanging strands — one merged geometry */}
      <mesh geometry={strandGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          ref={goldMat}
          color={gold}
          roughness={0.62}
          metalness={0.12}
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
    () => new RoundedBoxGeometry(BOARD, BOARD_THICKNESS, BOARD, 4, BOARD_BEVEL),
    [],
  );
  useEffect(() => () => boardGeometry.dispose(), [boardGeometry]);
  const crownGeometry = useMemo(
    () => new THREE.LatheGeometry(crownProfile(), 48),
    [],
  );
  useEffect(() => () => crownGeometry.dispose(), [crownGeometry]);
  /* Inner cavity: a dome facing INTO the crown — actual depth that reads
      darker through the opening, never a painted circle. */
  const innerGeometry = useMemo(
    () => new THREE.SphereGeometry(0.33, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    [],
  );
  useEffect(() => () => innerGeometry.dispose(), [innerGeometry]);
  const trimGeometry = useMemo(
    () => new THREE.TorusGeometry(CROWN_RADIUS, 0.005, 12, 64),
    [],
  );
  useEffect(() => () => trimGeometry.dispose(), [trimGeometry]);
  const strandGeometry = useMemo(() => buildStrandGeometry(), []);
  useEffect(() => () => strandGeometry.dispose(), [strandGeometry]);
  const cordCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, BOARD_TOP + BOARD_THICKNESS / 2 + 0.02, 0),
        new THREE.Vector3(0.3, BOARD_TOP + 0.03, 0.02),
        new THREE.Vector3(0.58, BOARD_TOP + 0.015, 0.03),
        new THREE.Vector3(BOARD_CORNER, BOARD_TOP + BOARD_THICKNESS / 2 - 0.02, 0.02),
        new THREE.Vector3(TASSEL_HANG[0], TASSEL_HANG[1] + 0.14, 0.01),
        new THREE.Vector3(TASSEL_HANG[0], TASSEL_HANG[1], TASSEL_HANG[2]),
      ]),
    [],
  );
  const cordGeometry = useMemo(
    () => new THREE.TubeGeometry(cordCurve, 32, CORD_RADIUS, 8),
    [cordCurve],
  );
  useEffect(() => () => cordGeometry.dispose(), [cordGeometry]);

  const [glowTexture] = useState(() => softGlowTexture());
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

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
      if (buttonMaterial) lerpColor(buttonMaterial.color, paletteColors.gold, f);
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
      shadow.scale.set(1.0 * k, 0.5 * k, 1);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        {/* Crown — skull cap with a real circular opening. The bottom rim is
             open, so the dark inner cavity is actual depth. */}
        <mesh geometry={crownGeometry} position={[0, 0, 0]}>
          <meshStandardMaterial
            ref={crownMat}
            color={palette.fabric}
            roughness={0.92}
            metalness={0.0}
            bumpMap={bump}
            bumpScale={0.025}
            envMapIntensity={0.35}
          />
        </mesh>

        {/* Inner cavity — dome facing into the crown */}
        <mesh geometry={innerGeometry} position={[0, 0.06, 0]}>
          <meshStandardMaterial
            ref={innerMat}
            color={palette.fabric}
            roughness={0.95}
            metalness={0}
            envMapIntensity={0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Gold trim — very thin, elegant ring hugging the crown's base rim.
            Restrained accent: the lower edge still reads as dark fabric. */}
        <mesh geometry={trimGeometry} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <meshStandardMaterial
            ref={trimMat}
            color={palette.gold}
            roughness={0.5}
            metalness={0.55}
            envMapIntensity={0.6}
          />
        </mesh>

        {/* Mortarboard — square, diamond-oriented, beveled, real thickness */}
        <mesh
          geometry={boardGeometry}
          position={[0, BOARD_TOP, 0]}
          rotation={[0, Math.PI / 4, 0]}
        >
          <meshStandardMaterial
            ref={boardMat}
            color={palette.board}
            roughness={0.92}
            metalness={0.0}
            bumpMap={bump}
            bumpScale={0.03}
            envMapIntensity={0.35}
          />
        </mesh>

        {/* Center button — small, subtle gold disc sitting on the fabric */}
        <mesh position={[0, BOARD_TOP + BOARD_THICKNESS / 2 + 0.011, 0]}>
          <cylinderGeometry args={[BUTTON_RADIUS, BUTTON_RADIUS + 0.006, 0.02, 20]} />
          <meshStandardMaterial
            ref={buttonMat}
            color={palette.gold}
            roughness={0.45}
            metalness={0.55}
            envMapIntensity={0.6}
          />
        </mesh>

        {/* Cord — fine woven cord, runs from button to tassel hang point */}
        <mesh geometry={cordGeometry}>
          <meshStandardMaterial
            ref={cordMat}
            color={palette.gold}
            roughness={0.55}
            metalness={0.3}
            envMapIntensity={0.5}
          />
        </mesh>

        <Tassel
          gold={palette.gold}
          knotMat={knotMat}
          goldMat={goldMat}
          tasselRef={tasselRef}
          lagRef={lagRef}
          strandGeometry={strandGeometry}
        />
      </group>

      {/* Soft contact shadow + ember under-glow */}
      <sprite ref={shadowRef} position={[0, -0.22, 0]} scale={[1.0, 0.5, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={palette.dim}
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </sprite>
      <sprite position={[0, -0.1, 0.6]} scale={[0.8, 0.8, 1]}>
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
      is NOT auto-disposed by R3F — dispose it explicitly on unmount. The
      context-loss listeners are likewise detached here so a remount/route
      change never leaves stale WebGL listeners behind. */
  const envTexture = useRef(null);
  const contextLossDetach = useRef(null);
  useEffect(
    () => () => {
      if (envTexture.current) {
        envTexture.current.dispose();
        envTexture.current = null;
      }
      if (contextLossDetach.current) {
        contextLossDetach.current();
        contextLossDetach.current = null;
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
        camera={{ position: [0, 0.52, 2.6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={(state) => {
          envTexture.current = applyStudioEnvironment(state);
          contextLossDetach.current = attachContextLoss(
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