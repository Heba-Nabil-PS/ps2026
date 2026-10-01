/**
 * The positioning frame as a sheet of cloth (after lusion.co's "bold ideas"): one image
 * drawn on a finely divided plane whose surface rides a wave in depth, seen in perspective,
 * with the slopes catching a little light. Rounded corners are cut in the fragment shader.
 *
 * It only stands in for the real frame while the wave is visible; flat, the DOM frame is shown
 * again (PositioningStage). Dependency-free WebGL 1; if it is unavailable, nothing is drawn.
 */

const VERTEX = `
attribute vec2 aUv;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform float uAmp;
uniform float uBend;
uniform float uPhase;
uniform float uFocal;
varying vec2 vUv;
varying float vShade;

float wave(vec2 uv) {
  return sin(uv.x * 3.4 + uPhase) * 0.6 + sin(uv.y * 2.6 - uPhase * 0.8 + uv.x * 1.4) * 0.4;
}

void main() {
  vec2 p = (aUv - 0.5) * uSize;
  float z = uAmp * wave(aUv);
  // The middle lags the scroll, like a sheet being pulled: down, and away from the eye.
  float arc = sin(3.14159 * aUv.x);
  p.y += uBend * arc * uSize.y;
  z -= abs(uBend) * arc * uSize.y * 0.8;
  vec2 screen = uCenter + p * (uFocal / (uFocal - z));
  vec2 clip = screen / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  float e = 0.01;
  vShade = clamp(uAmp * (wave(aUv + vec2(e, 0.0)) - wave(aUv)) / e / uSize.x * 0.9, -0.3, 0.3);
  vUv = aUv;
}`;

// highp, as in the vertex shader: uSize is shared, and a uniform must have the same precision in both.
const FRAGMENT = `
precision highp float;
uniform sampler2D uTex;
uniform vec4 uCrop;
uniform vec2 uSize;
uniform float uRadius;
varying vec2 vUv;
varying float vShade;

void main() {
  vec2 q = abs((vUv - 0.5) * uSize) - (uSize * 0.5 - uRadius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float a = 1.0 - smoothstep(-1.0, 0.5, d);
  if (a <= 0.0) discard;
  vec3 c = texture2D(uTex, mix(uCrop.xy, uCrop.zw, vUv)).rgb * (1.0 + vShade);
  gl_FragColor = vec4(c * a, a);
}`;

const COLS = 48;
const ROWS = 32;

export type WaveFrame = {
  /** The frame's centre, in the canvas's own px. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  radius: number;
  /** The part of the image the frame shows: u0, v0, u1, v1. */
  crop: [number, number, number, number];
  /** Depth of the wave and bend of the sheet, in px and fractions of the height. */
  amp: number;
  bend: number;
  phase: number;
};

type Uniform = "uRes" | "uCenter" | "uSize" | "uAmp" | "uBend" | "uPhase" | "uFocal" | "uCrop" | "uRadius";

export class WavePlane {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null;
  private u = {} as Record<Uniform, WebGLUniformLocation | null>;
  private image: HTMLImageElement | null = null;
  private count = 0;
  private width = 1;
  private height = 1;
  ok = false;

  constructor(parent: HTMLElement) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none", zIndex: "3", visibility: "hidden" });
    parent.appendChild(canvas);
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
    this.gl = gl;
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // The plane: a grid of (COLS + 1) × (ROWS + 1) points, in two triangles per cell.
    const uvs: number[] = [];
    for (let y = 0; y <= ROWS; y++) for (let x = 0; x <= COLS; x++) uvs.push(x / COLS, y / ROWS);
    const indices: number[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * (COLS + 1) + x;
        indices.push(i, i + 1, i + COLS + 1, i + 1, i + COLS + 2, i + COLS + 1);
      }
    }
    this.count = indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(program, "aUv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    for (const name of ["uRes", "uCenter", "uSize", "uAmp", "uBend", "uPhase", "uFocal", "uCrop", "uRadius"] as Uniform[]) {
      this.u[name] = gl.getUniformLocation(program, name);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    canvas.addEventListener("webglcontextlost", () => {
      this.ok = false;
      this.hide();
    });
    this.ok = true;
  }

  /** The canvas's place and size, in its parent's px. */
  place(left: number, top: number, width: number, height: number) {
    const style = this.canvas.style;
    style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    style.width = `${width}px`;
    style.height = `${height}px`;
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Draws the frame with `image`; false when it cannot (the caller then keeps the DOM frame). */
  draw(image: HTMLImageElement | null, frame: WaveFrame) {
    const gl = this.gl;
    if (!this.ok || !gl || !image || !image.complete || !image.naturalWidth) return false;
    if (image !== this.image) {
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      } catch {
        return false;
      }
      this.image = image;
    }
    const u = this.u;
    gl.uniform2f(u.uRes, this.width, this.height);
    gl.uniform2f(u.uCenter, frame.cx, frame.cy);
    gl.uniform2f(u.uSize, frame.w, frame.h);
    gl.uniform1f(u.uAmp, frame.amp);
    gl.uniform1f(u.uBend, frame.bend);
    gl.uniform1f(u.uPhase, frame.phase);
    gl.uniform1f(u.uFocal, this.height * 1.4);
    gl.uniform4f(u.uCrop, ...frame.crop);
    gl.uniform1f(u.uRadius, Math.min(frame.radius, frame.w / 2, frame.h / 2));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    this.canvas.style.visibility = "visible";
    return true;
  }

  hide() {
    this.canvas.style.visibility = "hidden";
  }

  destroy() {
    this.gl?.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.remove();
  }
}
