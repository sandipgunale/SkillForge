/* ==========================================================================
   Procedural Neural Field — GLSL
   All visuals are computed on the GPU from time + per-instance seeds.
   The `fieldChunk` is shared by the node and connection materials so the
   two stay perfectly in sync (single source of truth for the field math).
   ========================================================================== */

export const fieldChunk = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uBusy;

  float hash13(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash13(i);
    float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash13(i + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z
    );
  }

  /* Field sample: organic drift + breathing + sphere/torus morph +
     cursor repulsion + global rotation. Identical for nodes and edges. */
  vec3 sampleField(vec3 base, vec2 torusUV, float layer, float seed) {
    float t = uTime;
    vec3 drift;
    drift.x = noise3(base * 0.16 + vec3(t * 0.11, -t * 0.07, t * 0.05) + vec3(layer * 2.1));
    drift.y = noise3(base * 0.18 + vec3(-t * 0.06, t * 0.09, t * 0.04) + vec3(layer * 3.7));
    drift.z = noise3(base * 0.14 + vec3(t * 0.08, t * 0.05, -t * 0.10) + vec3(layer * 5.3));
    vec3 p = base + (drift - 0.5) * (0.28 + layer * 0.18);

    /* breathing + per-node phase shimmer — never a repeat of itself */
    p *= 1.0 + 0.035 * sin(t * 0.55 + seed * 6.28318)
           + 0.02 * sin(t * 0.83 + seed * 12.9898);

    /* sphere <-> torus morph, one slow organic transition */
    float morphPhase = fract(t * 0.0215 + fract(seed * 0.613) * 0.12);
    float morph = smoothstep(0.02, 0.35, morphPhase)
                * (1.0 - smoothstep(0.62, 0.97, morphPhase));
    float uu = torusUV.x * 6.28318;
    float vv = torusUV.y * 6.28318;
    vec3 torus;
    torus.x = (3.3 + 1.5 * cos(vv)) * cos(uu);
    torus.y = 1.35 * sin(vv);
    torus.z = (3.3 + 1.5 * cos(vv)) * sin(uu);
    p = mix(p, torus, morph);

    /* cursor repulsion — nodes bulge away, connections stretch with them */
    vec3 toMouse = p - uMouse;
    float dist = length(toMouse);
    float falloff = exp(-dist * dist * 0.12);
    p += normalize(toMouse + vec3(0.0001)) * falloff * (1.5 + uBusy * 0.5);

    /* global slow rotation */
    float c = cos(t * 0.045);
    float s = sin(t * 0.045);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  /* Random node ignition: each node has its own cycle -> a sharp spark
     that rises fast and dies; globally they never align. */
  float nodeSpark(vec3 base, float seed) {
    float cycle = fract(hash13(base * 1.7 + seed) * 17.0
                        + uTime * (0.05 + 0.13 * hash13(base + seed * 3.1)));
    float rise = smoothstep(0.955, 0.992, cycle);
    float fall = 1.0 - smoothstep(0.992, 0.998, cycle);
    return rise * fall;
  }
`;

export const nodeVertexShader = /* glsl */ `
  attribute vec3 aBase;
  attribute vec3 aColor;
  attribute float aScale;
  attribute float aLayer;
  attribute vec2 aTorusUV;
  attribute float aSeed;

  varying vec3 vColor;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying float vSpark;

  ${fieldChunk}

  void main() {
    vec3 p = sampleField(aBase, aTorusUV, aLayer, aSeed);
    float spark = nodeSpark(aBase, aSeed);
    float shimmer = 1.0 + 0.07 * sin(uTime * 0.8 + aSeed * 9.0);
    vec3 local = position * aScale * shimmer;
    vec4 mv = modelViewMatrix * vec4(p + local, 1.0);
    vViewDir = -mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    vColor = aColor * (0.55 + 0.45 * aLayer) + spark * vec3(1.2, 1.1, 1.0);
    vSpark = spark;
    gl_Position = projectionMatrix * mv;
  }
`;

export const nodeFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying float vSpark;

  void main() {
    vec3 n = normalize(vNormalV);
    vec3 v = normalize(vViewDir);
    float rim = pow(1.0 - abs(dot(n, v)), 2.0);
    vec3 col = vColor * (0.75 + 0.85 * rim) + vec3(0.6) * vSpark;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const edgeVertexShader = /* glsl */ `
  attribute vec3 aFromBase;
  attribute vec3 aToBase;
  attribute vec2 aFromTorus;
  attribute vec2 aToTorus;
  attribute float aFromLayer;
  attribute float aToLayer;
  attribute float aFromSeed;
  attribute float aToSeed;
  attribute float aDist;

  varying vec3 vColor;
  varying float vGlow;

  ${fieldChunk}

  void main() {
    vec3 from = sampleField(aFromBase, aFromTorus, aFromLayer, aFromSeed);
    vec3 to = sampleField(aToBase, aToTorus, aToLayer, aToSeed);
    vec3 p = mix(from, to, aDist);

    /* energy pocket travelling each connection */
    float segSeed = hash13(aFromBase * 3.7 + 0.5);
    float speed = 0.32 + 0.3 * hash13(aFromBase + vec3(7.1));
    float posAlong = fract(uTime * speed + segSeed);
    float pulse = exp(-pow((aDist - posAlong) * 10.0, 2.0));

    /* connections breathe in and out, organically */
    float fade = 0.5 + 0.5 * noise3(aFromBase * 0.35 + vec3(0.0, uTime * 0.05, uTime * 0.03));

    /* connections near the cursor brighten */
    float mDist = distance(mix(from, to, 0.5), uMouse);
    float proximity = exp(-mDist * mDist * 0.08);

    vGlow = (0.3 + 0.7 * fade) * (0.3 + 0.7 * proximity)
          + pulse * (1.6 + uBusy * 1.2);
    vColor = mix(vec3(0.35, 0.55, 0.85), vec3(0.91, 0.61, 0.24), segSeed);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const edgeFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;

  void main() {
    gl_FragColor = vec4(vColor * vGlow * 0.85, 1.0);
  }
`;

export const ringVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBusy;

  void main() {
    float ang = uTime * (0.2 + uBusy * 1.5);
    float c = cos(ang);
    float s = sin(ang);
    vec3 p = vec3(c * position.x - s * position.y, s * position.x + c * position.y, position.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const ringFragmentShader = /* glsl */ `
  uniform float uBusy;

  void main() {
    float b = smoothstep(0.25, 0.75, uBusy);
    vec3 col = mix(vec3(0.35, 0.55, 0.85), vec3(0.91, 0.61, 0.24), b);
    gl_FragColor = vec4(col, mix(0.18, 0.5, b));
  }
`;

export const waveVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCameraPos;

  varying float vEnv;

  void main() {
    /* irregular period 20-29s — never the same twice */
    float period = 0.042 + 0.008 * sin(uTime * 0.013);
    float wavePhase = fract(uTime * period + 0.37);
    float env = sin(wavePhase * 3.14159);
    float scale = 0.7 + wavePhase * 2.4;

    vec3 toCam = normalize(uCameraPos);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCam));
    vec3 up = cross(toCam, right);
    vec3 p = (right * position.x + up * position.y) * scale;

    vEnv = env;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const waveFragmentShader = /* glsl */ `
  uniform float uTime;

  varying float vEnv;

  void main() {
    float flicker = 0.75
      + 0.2 * sin(uTime * 5.3)
      + 0.3 * sin(uTime * 1.7 + 2.0);
    gl_FragColor = vec4(vec3(0.91, 0.61, 0.24), vEnv * 0.45 * flicker);
  }
`;
