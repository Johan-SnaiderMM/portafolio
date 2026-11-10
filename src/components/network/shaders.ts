/**
 * Shaders de la red de la portada. Todo el movimiento (mezcla nube a capas,
 * deriva, empuje del cursor, pulsos) ocurre en la GPU: la CPU solo actualiza
 * unos cuantos numeros por cuadro.
 *
 * Los comentarios dentro del GLSL van en ASCII a proposito: algunos
 * controladores rechazan caracteres fuera de ASCII en el codigo del shader.
 * En `smoothstep` el primer borde siempre es menor que el segundo; con los
 * bordes al reves el resultado no esta definido en GLSL.
 */

/** Posicion en pantalla de un nodo, compartida por puntos y lineas. */
const NETWORK_CLIP = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uAspect;
uniform float uPointerStrength;
uniform vec2 uPointer;

attribute vec3 aOrdered;
attribute float aSeed;

// Mixes the loose cloud with the ordered layers, adds a soft drift and pushes
// away the nodes the cursor touches. "near" = how close the cursor is (0..1).
vec4 networkClip(vec3 cloudPos, vec3 orderedPos, float seed, float dust, out float near) {
  float m = clamp(uMorph * 1.5 - seed * 0.5, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m) * (1.0 - dust);
  vec3 p = mix(cloudPos, orderedPos, m);

  float amp = mix(0.09, 0.016, m);
  p += amp * vec3(
    sin(uTime * 0.7 + seed * 31.0),
    cos(uTime * 0.55 + seed * 17.0),
    sin(uTime * 0.45 + seed * 53.0)
  );

  vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
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
uniform float uRefDepth;
uniform float uAlpha;
uniform float uOutput;
uniform float uWave;

attribute float aLayer;
attribute float aSize;
attribute float aPath;
attribute float aWinner;

varying float vGlow;
varying float vAlpha;

void main() {
  float dust = aLayer < 0.0 ? 1.0 : 0.0;
  float near;
  vec4 clip = networkClip(position, aOrdered, aSeed, dust, near);
  gl_Position = clip;

  float layer = max(aLayer, 0.0);
  // Wave front that runs through the layers, from input to output.
  float wave = (1.0 - dust) * exp(-pow((layer - uWave) / 0.5, 2.0));
  // In the contact section the outputs light up; the winner the most.
  float outLit = step(2.5, aLayer) * uOutput * (0.35 + 0.65 * aWinner);
  float glow = clamp(aPath * 0.85 + wave * 0.5 + near * 0.9 + outLit, 0.0, 1.0);

  float twinkle = 0.25 + 0.2 * sin(uTime * 0.8 + aSeed * 40.0);
  vGlow = glow;
  vAlpha = uAlpha * mix(1.0, twinkle, dust) * mix(0.6, 1.0, glow);

  float size = aSize * (1.0 + glow * 0.5 + near * 0.8 + outLit * 1.1);
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
  vec3 color = mix(ash, amber, vGlow);

  float a = (core * 0.85 + halo * halo * 0.4 * (0.25 + vGlow)) * vAlpha;
  gl_FragColor = vec4(color, a);
}
`;

export const LINE_VERTEX = /* glsl */ `
${NETWORK_CLIP}
uniform float uAlpha;
uniform float uOutput;
uniform float uWave;
uniform float uLineBoost;

attribute float aT;
attribute float aFrom;
attribute float aPhase;
attribute float aPath;
attribute float aToOutput;

varying float vLit;
varying float vAlpha;

void main() {
  float near;
  vec4 clip = networkClip(position, aOrdered, aSeed, 0.0, near);
  gl_Position = clip;

  // Position along the network: 0 at the input, 3 at the output.
  float x = aFrom + aT;
  float front = exp(-pow((x - uWave) / 0.4, 2.0));
  // Each connection fires once per cycle, at its own time.
  float firing = fract(uTime * 0.17 + aPhase) * 4.4 - 0.7;
  float spark = exp(-pow((x - firing) / 0.3, 2.0));

  float lit = aPath * (0.5 + front * 0.9) + spark * 0.75 + near * 0.7 + aToOutput * uOutput * 0.55;
  vLit = clamp(lit, 0.0, 1.0);
  vAlpha = uAlpha * uLineBoost;
}
`;

export const LINE_FRAGMENT = /* glsl */ `
varying float vLit;
varying float vAlpha;

void main() {
  vec3 ash = vec3(0.62, 0.58, 0.50);
  vec3 amber = vec3(1.0, 0.69, 0.125);
  vec3 color = mix(ash, amber, vLit);
  float a = vAlpha * (0.13 + vLit * 0.62);
  gl_FragColor = vec4(color, a);
}
`;
