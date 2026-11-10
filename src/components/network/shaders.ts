/**
 * Shaders de la red de la portada. Todo el movimiento (mezcla nube a capas,
 * deriva, empuje del cursor, pulsos, cometas) ocurre en la GPU: la CPU solo
 * actualiza unos cuantos numeros por cuadro.
 *
 * Los comentarios dentro del GLSL van en ASCII a proposito: algunos
 * controladores rechazan caracteres fuera de ASCII en el codigo del shader.
 * En `smoothstep` el primer borde siempre es menor que el segundo; con los
 * bordes al reves el resultado no esta definido en GLSL.
 */

/** Posicion de un nodo y su proyeccion, compartidas por puntos y lineas. */
const NETWORK_CLIP = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uAspect;
uniform float uPointerStrength;
uniform vec2 uPointer;
uniform float uRefDepth;

// Mixes the loose cloud with the ordered layers and adds a soft drift.
// Lines call this once per end node and interpolate, so a line always
// touches its two points exactly.
vec3 nodePos(vec3 cloudPos, vec3 orderedPos, float seed, float dust) {
  float m = clamp(uMorph * 1.5 - seed * 0.5, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m) * (1.0 - dust);
  vec3 p = mix(cloudPos, orderedPos, m);

  float amp = mix(0.09, 0.016, m);
  p += amp * vec3(
    sin(uTime * 0.7 + seed * 31.0),
    cos(uTime * 0.55 + seed * 17.0),
    sin(uTime * 0.45 + seed * 53.0)
  );
  return p;
}

// Projects a scene position, pushes it away from the cursor and reports:
// near  = how close the cursor is (0..1)
// depth = 1 for the nearest part of the network, 0 for the farthest
vec4 projectPos(vec3 p, out float near, out float depth) {
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  depth = 1.0 - smoothstep(uRefDepth - 1.3, uRefDepth + 1.3, clip.w);

  vec2 ndc = clip.xy / clip.w;
  vec2 delta = (ndc - uPointer) * vec2(uAspect, 1.0);
  float d = length(delta);
  near = (1.0 - smoothstep(0.0, 0.34, d)) * uPointerStrength;
  vec2 away = delta / (d + 0.0001);
  clip.xy += away * near * 0.05 * clip.w * vec2(1.0 / uAspect, 1.0);
  return clip;
}
`;

export const POINT_VERTEX = /* glsl */ `
${NETWORK_CLIP}
uniform float uPixelRatio;
uniform float uSizeScale;
uniform float uAlpha;
uniform float uOutput;
uniform float uWave;
uniform float uPing;
uniform float uPingPower;

attribute vec3 aOrdered;
attribute float aSeed;
attribute float aLayer;
attribute float aSize;
attribute float aPath;
attribute float aWinner;

varying float vGlow;
varying float vAlpha;

void main() {
  float dust = aLayer < 0.0 ? 1.0 : 0.0;
  float near;
  float depth;
  vec4 clip = projectPos(nodePos(position, aOrdered, aSeed, dust), near, depth);
  gl_Position = clip;

  float layer = max(aLayer, 0.0);
  // Wave front that runs through the layers, from input to output.
  float wave = (1.0 - dust) * exp(-pow((layer - uWave) / 0.5, 2.0));
  // A click or tap sends a faster, brighter front through the network.
  float ping = (1.0 - dust) * uPingPower * exp(-pow((layer - uPing) / 0.45, 2.0));
  // In the contact section the outputs light up; the winner the most.
  float outLit = step(2.5, aLayer) * uOutput * (0.35 + 0.65 * aWinner);
  float glow = clamp(aPath * 0.85 + wave * 0.5 + near * 0.9 + outLit + ping * 0.9, 0.0, 1.0);

  float twinkle = 0.25 + 0.2 * sin(uTime * 0.8 + aSeed * 40.0);
  vGlow = glow;
  // Far parts fade and shrink: it reads as a volume, not as a flat drawing.
  vAlpha = uAlpha * mix(1.0, twinkle, dust) * mix(0.6, 1.0, glow) * mix(0.35, 1.0, depth) * (1.0 + 0.3 * clamp(uMorph, 0.0, 1.0));

  float size = aSize * (1.0 + glow * 0.5 + near * 0.8 + outLit * 1.1 + ping * 0.6);
  size *= mix(0.72, 1.22, depth);
  // Once the layers are ordered, the points carry the structure: make them read.
  float ordered = clamp(uMorph, 0.0, 1.0);
  size *= 1.0 + ordered * 0.4;
  gl_PointSize = size * uPixelRatio * uSizeScale * (uRefDepth / clip.w);
}
`;

export const POINT_FRAGMENT = /* glsl */ `
varying float vGlow;
varying float vAlpha;

void main() {
  float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (r > 1.0) discard;

  float core = 1.0 - smoothstep(0.0, 0.55, r);
  float halo = 1.0 - smoothstep(0.0, 1.0, r);

  vec3 ash = vec3(0.62, 0.58, 0.50);
  vec3 amber = vec3(1.0, 0.69, 0.125);
  vec3 hot = vec3(1.0, 0.93, 0.74);
  vec3 color = mix(ash, amber, vGlow);
  // Like a phosphor: the most excited points burn almost white in the middle.
  color = mix(color, hot, core * smoothstep(0.55, 1.0, vGlow) * 0.7);

  float a = (core * 0.85 + halo * halo * 0.5 * (0.25 + vGlow)) * vAlpha;
  gl_FragColor = vec4(color, a);
}
`;

export const LINE_VERTEX = /* glsl */ `
${NETWORK_CLIP}
uniform float uAlpha;
uniform float uOutput;
uniform float uWave;
uniform float uLineBoost;
uniform float uPing;
uniform float uPingPower;

// position = cloud position of the origin node
attribute vec3 aCloudB;
attribute vec3 aOrdA;
attribute vec3 aOrdB;
attribute float aSeedA;
attribute float aSeedB;
attribute float aT;
attribute float aFrom;
attribute float aPhase;
attribute float aPath;
attribute float aToOutput;

varying float vLit;
varying float vAlpha;

void main() {
  vec3 pA = nodePos(position, aOrdA, aSeedA, 0.0);
  vec3 pB = nodePos(aCloudB, aOrdB, aSeedB, 0.0);
  vec3 p = mix(pA, pB, aT);

  // Each connection bows a little, like a synapse; the bow relaxes when the
  // network crystallizes into layers.
  vec3 d = pB - pA;
  vec3 n = normalize(cross(d, vec3(0.31, 0.93, 0.19)) + vec3(0.0001));
  float bow = sin(3.14159 * aT) * length(d) * 0.16 * (aPhase * 2.0 - 1.0);
  p += n * bow * (1.0 - 0.65 * clamp(uMorph, 0.0, 1.0));

  float near;
  float depth;
  gl_Position = projectPos(p, near, depth);

  // Position along the network: 0 at the input, 3 at the output.
  float x = aFrom + aT;
  float front = exp(-pow((x - uWave) / 0.4, 2.0));
  float ping = uPingPower * exp(-pow((x - uPing) / 0.35, 2.0));
  // Each connection fires once per cycle, at its own time. The signal is a
  // comet: a sharp head and a tail that fades behind it.
  float firing = fract(uTime * 0.17 + aPhase) * 4.4 - 0.7;
  float behind = firing - x;
  float spark = behind >= 0.0 ? exp(-behind / 0.42) : exp(behind / 0.035);

  float lit = aPath * (0.5 + front * 0.9) + spark * 0.95 + near * 0.7
    + aToOutput * uOutput * 0.55 + ping * 0.9;
  vLit = clamp(lit, 0.0, 1.0);
  vAlpha = uAlpha * uLineBoost * mix(0.3, 1.0, depth);
}
`;

export const LINE_FRAGMENT = /* glsl */ `
varying float vLit;
varying float vAlpha;

void main() {
  vec3 ash = vec3(0.62, 0.58, 0.50);
  vec3 amber = vec3(1.0, 0.69, 0.125);
  vec3 hot = vec3(1.0, 0.93, 0.74);
  vec3 color = mix(ash, amber, vLit);
  color = mix(color, hot, smoothstep(0.8, 1.0, vLit) * 0.6);
  float a = vAlpha * (0.12 + vLit * 0.68);
  gl_FragColor = vec4(color, a);
}
`;
