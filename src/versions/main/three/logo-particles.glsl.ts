import { FIELD, LOGO_FOOT, LOGO_SIZE } from "@/versions/main/three/logo-particles";

const float = (value: number) => value.toFixed(4);

/**
 * One disc per instance, drawn on a square. Everything that moves is worked out
 * here from a handful of uniforms, so thousands of discs cost one draw call and
 * no JavaScript per disc:
 *
 * - its loose place: a spot in the view volume that drifts, rides the page's scroll
 *   (nearer discs faster) and leans away from the pointer;
 * - its place on the logo (aTarget), carried by the logo's own turn and lift;
 * - how far it has joined (uForm against its turn on the pen's path, uRelease
 *   against its height), which blends the two along a spiral;
 * - which way it faces: wobbling while loose, leaning on its neighbour like a coil
 *   of the brand pattern once on the line;
 * - depth of field: the further from the logo's plane, the larger and softer.
 */
export const DISC_VERTEX = /* glsl */ `
attribute vec4 aTarget; // xyz on the logo, radius
attribute vec4 aLine;   // line direction xy, pen order, kind (0 outer, 1 inner, 2 ambient)
attribute vec4 aSeed;   // 0-1: place across the view (xy), loose depth (z), and one to vary it by (w)

uniform float uTime;
uniform float uPage;
uniform float uForm;
uniform float uRelease;
uniform float uReveal;
uniform float uCalm;
uniform vec2 uFrustum;    // half width and half height of the view, one unit from the camera
uniform float uDistance;  // camera to the logo's plane
uniform float uPixels;    // device pixels per scene unit, one unit from the camera
uniform mat3 uLogo;       // the logo's turn and scale
uniform vec3 uLogoOrigin; // where its centre sits
uniform vec3 uPointer;    // xy: -1..1 across the view, z: how much it counts (0-1)
uniform float uBlur;

varying vec2 vDisc;   // position on the disc, in radii
varying vec3 vNormal;
varying vec3 vAxisX;
varying vec3 vAxisY;
varying vec3 vToEye;
varying vec4 vLook;   // edge softness (radii), opacity, how far it has joined, kind
varying vec3 vTone;   // a number to vary the metal by, whether it is one of the large discs, and its glow's reach (radii)
varying float vAbove; // height above the logo's baseline

const float NEAR = ${float(FIELD.near)};
const float FAR = ${float(FIELD.far)};
const float SPREAD = 1.3;        // the loose field overfills the view by this much, so discs wrap off screen
const float DRIFT = 0.03;
const float SCROLL = 0.55;       // how far the field rides the scroll at the logo's depth, in half screens per screen
const float LEAN = 0.035;        // pointer parallax
const float PUSH = 0.3;          // pointer nudge
const float ARRIVAL = 0.42;      // share of the forming scroll one disc's flight takes
const float DEPARTURE = 0.5;
const float SWIRL = 1.5;         // radians a disc turns around its place as it flies in
const float TILT = 0.5;          // how far a coil leans back from the line towards the viewer
const float GLOW = 0.55;         // how far the glow reaches past the disc, in radii
const float SOFT_MAX = 2.0;      // the most a disc blurs, in radii
const float HALF_HEIGHT = ${float(LOGO_SIZE.height / 2)};
const float FOOT = ${float(LOGO_FOOT)};

vec2 wrap(vec2 value, vec2 range) {
  return mod(value + range, 2.0 * range) - range;
}

void main() {
  float order = aLine.z;
  float kind = aLine.w;
  float ambient = step(1.5, kind);
  float large = ambient * smoothstep(0.25, 0.6, aTarget.w);
  // While the logo holds, the eye is on it: everything that is not part of it falls back.
  float held = uForm * (1.0 - uRelease);

  // How far this disc has joined the logo: it arrives when the pen reaches it (give or take), and leaves from the foot upwards.
  float arriveAt = clamp(order + (aSeed.w - 0.5) * 0.08, 0.0, 1.0) * (1.0 - ARRIVAL);
  float arrive = clamp((uForm - arriveAt) / ARRIVAL, 0.0, 1.0);
  arrive = arrive * arrive * (3.0 - 2.0 * arrive);
  arrive = 1.0 - pow(1.0 - arrive, 1.6);
  float leaveAt = (clamp(aTarget.y / HALF_HEIGHT * 0.5 + 0.5, 0.0, 1.0) * 0.65 + aSeed.w * 0.35) * (1.0 - DEPARTURE);
  float leave = clamp((uRelease - leaveAt) / DEPARTURE, 0.0, 1.0);
  leave = leave * leave * (3.0 - 2.0 * leave);
  float joined = arrive * (1.0 - leave) * (1.0 - ambient);

  // Loose: a spot in the view volume, given as a place on screen and a distance from the camera.
  // The logo's discs float smaller than they stand on the line, so the field reads as fine particles.
  float looseRadius = mix(max(aTarget.w * mix(0.5, 0.95, aSeed.w), 0.028), aTarget.w, ambient);
  float away = uDistance * mix(NEAR, FAR, aSeed.z);
  float parallax = uDistance / away;
  vec2 spot = aSeed.xy * 2.0 - 1.0;
  spot += DRIFT * parallax * vec2(sin(uTime * (0.10 + 0.12 * aSeed.w) + aSeed.y * 31.0), cos(uTime * (0.08 + 0.11 * aSeed.x) + aSeed.w * 47.0));
  spot.y += uPage * SCROLL * parallax;
  spot -= uPointer.xy * uPointer.z * LEAN * (parallax - 1.0);
  // Wrap only once the whole disc, blur and glow and all, is off screen.
  vec2 margin = (looseRadius * 1.7 + uBlur * abs(1.0 - 1.0 / parallax)) / (uFrustum * away);
  spot = wrap(spot, SPREAD + margin) * (1.0 + (1.0 - uReveal) * 0.45);
  vec3 loose = vec3(spot * uFrustum * away, uDistance - away);

  // Home: its place on the logo. It flies in on a spiral that tightens onto that place.
  vec3 home = uLogo * aTarget.xyz + uLogoOrigin;
  vec3 offset = loose - home;
  float swirl = SWIRL * joined * (0.7 + 0.6 * aSeed.x);
  float swirlCos = cos(swirl);
  float swirlSin = sin(swirl);
  offset.xy = vec2(swirlCos * offset.x - swirlSin * offset.y, swirlSin * offset.x + swirlCos * offset.y);
  vec3 centre = home + offset * (1.0 - joined);

  // The pointer nudges nearby discs aside, a little; the logo gives less than the loose discs do.
  float toEye = uDistance - centre.z;
  vec2 gap = (centre.xy / (uFrustum * toEye) - uPointer.xy) * vec2(uFrustum.x / uFrustum.y, 1.0);
  centre.xy += gap * exp(-dot(gap, gap) * 22.0) * PUSH * uPointer.z * uFrustum.y * toEye * (1.0 - 0.7 * large) * (1.0 - 0.5 * joined);

  // Facing. Loose, a disc tips away from the viewer and back as it turns (the scroll turns it too), never quite
  // edge-on; the large ones move slowly. On the line it is a coil, leaning back on the one before it.
  float spin = (uTime * 0.22 + uPage * 1.6) * mix(1.0, 0.4, large);
  float tip = mix(0.15, 1.05, 0.5 + 0.5 * sin(aSeed.x * 6.2832 + spin * (0.5 + aSeed.y)));
  float around = aSeed.w * 6.2832 + spin * (0.25 + 0.6 * aSeed.x);
  vec3 eye = normalize(vec3(0.0, 0.0, uDistance) - centre);
  vec3 eyeX = normalize(cross(vec3(0.0, 1.0, 0.0), eye));
  vec3 eyeY = cross(eye, eyeX);
  vec3 looseNormal = eye * cos(tip) + (eyeX * cos(around) + eyeY * sin(around)) * sin(tip);
  vec3 along = normalize(uLogo * vec3(aLine.xy, 0.0));
  vec3 outward = normalize(uLogo * vec3(0.0, 0.0, 1.0));
  // A slow wave runs down the line, so the formed logo keeps breathing.
  float tilt = TILT + 0.07 * sin(order * 34.0 - uTime * 0.9);
  vec3 homeNormal = along * cos(tilt) + outward * sin(tilt);
  if (dot(looseNormal, homeNormal) < 0.0) looseNormal = -looseNormal;
  vec3 normal = normalize(mix(looseNormal, homeNormal, smoothstep(0.2, 0.95, joined)));
  vec3 axisX = normalize(cross(abs(normal.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), normal));
  vec3 axisY = cross(normal, axisX);

  // Size, and depth of field around the logo's plane.
  float scale = length(uLogo[0]);
  float radius = mix(looseRadius, aTarget.w * scale, joined);
  float pixel = toEye / uPixels;
  float seen = max(radius, 0.75 * pixel); // never thinner than a pixel and a half: smaller discs fade instead of flickering
  float fade = radius / seen;
  // The large discs also step back behind the rest of the page, where there is text to read.
  float recede = max(held * ambient, uCalm * large);
  // The blur is capped: past a few radii a disc is only haze, and its square would cost far more than it shows.
  float soft = min(uBlur * abs(toEye / uDistance - 1.0) / seen + 0.5 * recede, SOFT_MAX);
  // The glow belongs to discs in focus, and most of all to the logo itself.
  float glow = GLOW * (1.0 - min(soft, 1.0)) * mix(0.45, 1.0, joined) * (1.0 - 0.6 * large);
  float reach = 1.0 + soft + glow + 1.5 * pixel / seen;
  vec3 corner = centre + (axisX * position.x + axisY * position.y) * seen * reach;

  float opacity = mix(mix(mix(0.35, 0.8, aSeed.w), 0.94, large) * mix(1.0, 0.6, uCalm), 1.0, joined);
  opacity *= pow(1.0 / (1.0 + soft), 1.15) * fade * fade * uReveal * mix(1.0, 0.55, recede);

  vec4 view = viewMatrix * vec4(corner, 1.0);
  mat3 look = mat3(viewMatrix);
  vDisc = position.xy * reach;
  vNormal = look * normal;
  vAxisX = look * axisX;
  vAxisY = look * axisY;
  vToEye = -view.xyz;
  vLook = vec4(soft, opacity, joined, kind);
  vTone = vec3(aSeed.w, large, glow);
  vAbove = dot(corner - uLogoOrigin, normalize(uLogo[1])) / scale - FOOT;
  // Too faint to see: not drawn at all.
  gl_Position = opacity < 0.02 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * view;
}
`;

/**
 * The disc itself, after the brand pattern: spun metal in the brand blues. The
 * grooves of a lathed disc run in circles, so its highlight is a fan opening
 * from the centre towards the light rather than a spot; the edge catches the
 * light as a thin bright rim; and the half that tucks under the next coil falls
 * into shadow. Output is premultiplied; the glow around the disc adds light only.
 */
export const DISC_FRAGMENT = /* glsl */ `
uniform vec3 uKey;  // towards the key light, in view space
uniform vec3 uFill; // towards the fill light

varying vec2 vDisc;
varying vec3 vNormal;
varying vec3 vAxisX;
varying vec3 vAxisY;
varying vec3 vToEye;
varying vec4 vLook;
varying vec3 vTone;
varying float vAbove;

const vec3 SHADE = vec3(0.067, 0.188, 0.349);  // metal turned away from the light: still lighter than the page
const vec3 BODY = vec3(0.157, 0.396, 0.667);   // the brand pattern's mid blue
const vec3 SKY = vec3(0.549, 0.769, 0.902);    // --color-sky
const vec3 LIGHT = vec3(0.855, 0.937, 0.988);  // the brightest the metal gets
const vec3 HAZE = vec3(0.314, 0.545, 0.761);   // what is left of a disc out of focus: between BODY and SKY

/** The fan a light throws across spun metal, on the side of the disc that leans towards it. */
float fan(vec3 light, vec3 toEye, vec3 normal, vec3 radial, float tightness) {
  vec3 halfway = normalize(light + toEye);
  float across = dot(cross(normal, radial), halfway);
  vec3 onDisc = halfway - normal * dot(halfway, normal);
  float lean = length(onDisc);
  // Facing the light squarely the whole disc flashes; otherwise only the near fan shows.
  float side = mix(1.0, smoothstep(-0.25, 0.6, dot(radial, onDisc) / max(lean, 0.001)), smoothstep(0.04, 0.3, lean));
  return pow(max(1.0 - across * across, 0.0), tightness) * side;
}

void main() {
  float r = length(vDisc);
  float soft = vLook.x;
  float joined = vLook.z;
  float large = vTone.y;
  float glowReach = vTone.z;
  // The square's corners, past the disc and its glow, cost nothing.
  if (r > 1.0 + soft + glowReach) discard;

  float inner = step(0.5, vLook.w) * (1.0 - step(1.5, vLook.w));
  float pixel = fwidth(r);
  float disc = 1.0 - smoothstep(1.0 - soft - pixel, 1.0 + soft, r);
  // The feet are cut flat in the artwork: once on the logo, nothing shows below its baseline.
  float cut = mix(1.0, smoothstep(-fwidth(vAbove), fwidth(vAbove), vAbove), smoothstep(0.9, 1.0, joined));
  float tone = mix(0.84, 1.1, vTone.x); // no two discs are quite the same metal

  vec3 colour = HAZE * tone;
  // Well out of focus only that tone is left; the metal is worked out for discs sharp enough to show it.
  if (soft < 1.2 || large > 0.5) {
    vec3 toEye = normalize(vToEye);
    vec3 normal = normalize(vNormal);
    float facing = dot(normal, toEye);
    normal *= sign(facing);
    facing = abs(facing);
    vec2 heading = vDisc / max(r, 0.0001);
    vec3 radial = vAxisX * heading.x + vAxisY * heading.y;

    // The bright side of the disc is the side that leans towards the key light.
    vec3 keyOnDisc = uKey - normal * dot(uKey, normal);
    float towardsKey = dot(radial, keyOnDisc) / max(length(keyOnDisc), 0.001);
    float brightSide = smoothstep(-0.8, 0.8, towardsKey);
    float lit = max(dot(normal, uKey), 0.0);

    vec3 metal = mix(SHADE, BODY, brightSide * (0.4 + 0.6 * lit));
    metal = mix(metal, SKY, fan(uFill, toEye, normal, radial, 3.0) * 0.4);
    // The key light's fan is sky blue, with a brighter streak down its middle.
    metal = mix(metal, SKY, fan(uKey, toEye, normal, radial, 3.5) * (0.45 + 0.5 * lit));
    metal = mix(metal, LIGHT, fan(uKey, toEye, normal, radial, 16.0) * (0.3 + 0.55 * lit));
    // A shallow dish: a little darker towards the centre. Close up, the lathe's grooves just show.
    metal *= tone * mix(0.78, 1.0, smoothstep(0.0, 0.8, r));
    metal *= 1.0 + sin(r * 84.0) * 0.02 * smoothstep(0.024, 0.006, pixel);
    // The far half of a tilted disc is the half under its neighbour: in its shadow.
    vec3 back = normal * facing - toEye;
    float under = dot(radial, back) / max(length(back), 0.001);
    metal *= mix(1.0, mix(0.5, 1.0, smoothstep(-0.6, 0.4, -under)), joined * (1.0 - facing * facing));
    // The rim: a thin bright edge (never thinner than a pixel and a half), brightest towards the key light,
    // with the metal falling away into shadow just inside it on the far side.
    float rimWidth = clamp(1.6 * pixel, 0.035, 0.13);
    float rim = smoothstep(1.0 - rimWidth - pixel, 1.0 - rimWidth, r);
    metal *= 1.0 - 0.3 * smoothstep(1.0 - rimWidth * 4.0, 1.0 - rimWidth, r) * (1.0 - brightSide) * large;
    metal = mix(metal, mix(BODY, LIGHT, brightSide), rim * 0.92);
    // The thin line is the accent: lighter and more even, as in the flat logo.
    metal = mix(metal, mix(SKY, LIGHT, 0.3 + 0.4 * brightSide), inner * 0.75);
    // The softer the focus, the less of the detail is left.
    colour = mix(metal, colour, clamp(soft / 1.2, 0.0, 1.0) * (1.0 - 0.6 * large));
  }

  float alpha = disc * vLook.y * cut;
  float glow = pow(max(1.0 - max(r - 1.0, 0.0) / max(glowReach, 0.001), 0.0), 2.4) * (1.0 - disc) * vLook.y * cut;
  gl_FragColor = vec4(colour * alpha + SKY * glow * (0.08 + 0.16 * joined), alpha);
}
`;

/**
 * The backdrop behind the discs: the page's own gradient (ink, with the navy glow
 * at the top), seen through a pane of liquid glass. Soft light drifts behind the
 * pane and is bent by its slow waves; a broad sheen slides across as the page
 * scrolls; a pool of light gathers where the logo forms. A faint static dither
 * keeps the gradients from banding (no visible grain).
 */
export const BACKDROP_VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const BACKDROP_FRAGMENT = /* glsl */ `
uniform vec2 uSize;  // device pixels
uniform float uForm;
uniform float uCalm;
uniform vec2 uPool;  // centre of the light, 0-1 across the view
uniform float uTime; // seconds
uniform float uPage; // how far the page has scrolled, in viewport heights

const vec3 INK_DEEP = vec3(0.039, 0.102, 0.180); // --color-ink-950
const vec3 INK = vec3(0.027, 0.071, 0.122);      // --color-ink-900
const vec3 NAVY = vec3(0.086, 0.188, 0.310);     // --color-navy-600
const vec3 NAVY_LIGHT = vec3(0.129, 0.259, 0.416); // --color-navy-500
const vec3 SKY = vec3(0.549, 0.769, 0.902);      // --color-sky
const vec3 SKY_SOFT = vec3(0.765, 0.882, 0.953); // --color-sky-200

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

/** A soft elliptical glow, 1 at the centre. */
float glow(vec2 p, vec2 centre, vec2 radius) {
  vec2 d = (p - centre) / radius;
  return exp(-dot(d, d));
}

void main() {
  vec2 at = gl_FragCoord.xy / uSize;
  float aspect = uSize.x / uSize.y;
  vec2 p = (at - 0.5) * vec2(aspect, 1.0);
  float t = uTime;
  float quiet = mix(1.0, 0.5, uCalm);

  // The body's CSS background: ink from top to bottom, and a navy glow from above the top edge.
  vec3 colour = mix(INK_DEEP, INK, at.y);
  float top = length((at - vec2(0.5, 1.1)) / vec2(1.2, 0.6));
  colour = mix(colour, NAVY, 0.55 * clamp(1.0 - top / 0.6, 0.0, 1.0));

  // The pane: broad, slow waves bend whatever lies behind it, and the scroll rolls them on.
  vec2 bend = vec2(
    sin(p.y * 2.6 + t * 0.21 + uPage * 0.9),
    cos(p.x * 2.2 - t * 0.17 + uPage * 0.7)
  ) * 0.045;
  vec2 q = p + bend;

  // Light behind the glass: two soft bodies that drift, and wander at their own rates as the page scrolls.
  vec2 c1 = vec2(aspect * (-0.28 + 0.1 * sin(uPage * 0.55)) + 0.05 * sin(t * 0.07), 0.22 - 0.2 * sin(uPage * 0.8) + 0.04 * cos(t * 0.09));
  vec2 c2 = vec2(aspect * (0.3 - 0.12 * sin(uPage * 0.45)) + 0.05 * cos(t * 0.06), -0.26 + 0.18 * sin(uPage * 0.65) + 0.04 * sin(t * 0.08));
  colour += NAVY_LIGHT * glow(q, c1, vec2(0.62, 0.42)) * 0.42 * quiet;
  colour += SKY * glow(q, c2, vec2(0.48, 0.32)) * 0.075 * quiet;

  // Light gathers behind the logo as it forms.
  vec2 fromPool = (at - uPool) * vec2(aspect, 1.0) + bend * 0.5;
  float pool = exp(-dot(fromPool, fromPool) * 3.2);
  colour += NAVY_LIGHT * pool * (0.10 + 0.34 * uForm) * quiet;

  // The sheen: a broad diagonal highlight on the glass with a fine bright edge beside it,
  // sliding across as the page scrolls. Bent a touch by the same waves, like real glass.
  float diag = dot(p + bend * 0.6, normalize(vec2(1.0, 0.6)));
  float sweep = 0.85 * sin(uPage * 0.6 + 0.5 + t * 0.025);
  float band = diag - sweep;
  colour += SKY_SOFT * exp(-band * band / 0.03) * 0.03 * quiet;
  colour += SKY_SOFT * exp(-pow((band - 0.2) / 0.012, 2.0)) * 0.022 * quiet;

  // Darker corners keep the eye in the middle.
  vec2 fromCentre = at - 0.5;
  colour *= 1.0 - 0.32 * smoothstep(0.35, 0.95, length(fromCentre * vec2(1.0, 1.15)));
  // A faint, still dither: enough to stop banding, too fine to read as grain.
  colour += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(colour, 1.0);
}
`;
