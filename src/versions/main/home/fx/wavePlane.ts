/**
 * The positioning frame as a sheet of cloth (after lusion.co's "bold ideas"): the reel's picture
 * drawn on a finely divided plane whose surface rides a wave in depth, seen in perspective,
 * with the slopes catching a little light. Rounded corners are cut in the fragment shader.
 *
 * It only stands in for the real frame while the wave is visible, so it draws what the DOM frame
 * would show: the slide on top and, mid-crossfade, the one coming in over it, blended the same way.
 * Pictures are decoded off the main thread and uploaded once, ahead of time (`prepare`), so no
 * scroll frame ever waits on a decode; drawn through mipmaps, they stay crisp at any size.
 * Dependency-free WebGL (2 where available, else 1); if it is unavailable, nothing is drawn and
 * the DOM frame stays (PositioningStage).
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
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec4 uCropA;
uniform vec4 uCropB;
uniform float uMix;
uniform vec2 uSize;
uniform float uRadius;
varying vec2 vUv;
varying float vShade;

void main() {
  vec2 q = abs((vUv - 0.5) * uSize) - (uSize * 0.5 - uRadius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float a = 1.0 - smoothstep(-1.0, 0.5, d);
  if (a <= 0.0) discard;
  vec3 under = texture2D(uTexA, mix(uCropA.xy, uCropA.zw, vUv)).rgb;
  vec3 over = texture2D(uTexB, mix(uCropB.xy, uCropB.zw, vUv)).rgb;
  vec3 c = mix(under, over, uMix) * (1.0 + vShade);
  gl_FragColor = vec4(c * a, a);
}`;

const COLS = 48;
const ROWS = 32;

/** A picture to draw and the part of it (u0, v0, u1, v1) the frame shows. */
export type WaveLayer = {
  image: HTMLImageElement;
  crop: [number, number, number, number];
};

export type WaveFrame = {
  /** The frame's centre, in the canvas's own px. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  radius: number;
  /** Depth of the wave and bend of the sheet, in px and fractions of the height. */
  amp: number;
  bend: number;
  phase: number;
  /** The slide showing and, mid-crossfade, the one coming in over it, `mix` of the way in. */
  under: WaveLayer;
  over?: WaveLayer | null;
  mix: number;
};

type Uniform = "uRes" | "uCenter" | "uSize" | "uAmp" | "uBend" | "uPhase" | "uFocal" | "uCropA" | "uCropB" | "uMix" | "uRadius";

type Slot = { texture: WebGLTexture; src: string; ready: boolean };

const isPow2 = (n: number) => (n & (n - 1)) === 0;

export class WavePlane {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null;
  private webgl2 = false;
  private u = {} as Record<Uniform, WebGLUniformLocation | null>;
  private anisotropy: { ext: EXT_texture_filter_anisotropic; max: number } | null = null;
  private textures = new Map<HTMLImageElement, Slot>();
  private count = 0;
  private width = 1;
  private height = 1;
  private focal = 1;
  private placed = "";
  ok = false;

  constructor(parent: HTMLElement) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none", zIndex: "3", visibility: "hidden" });
    parent.appendChild(canvas);
    this.canvas = canvas;
    // No multisampling: the sheet's edges are already softened in the fragment shader, and its surface has no
    // inner edges to smooth, so multisampling only cost four times the fill (a frame or two per draw on an ordinary laptop).
    const attributes: WebGLContextAttributes = { alpha: true, premultipliedAlpha: true, antialias: false };
    const gl2 = canvas.getContext("webgl2", attributes);
    const gl = gl2 ?? canvas.getContext("webgl", attributes);
    this.gl = gl;
    this.webgl2 = !!gl2;
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

    for (const name of ["uRes", "uCenter", "uSize", "uAmp", "uBend", "uPhase", "uFocal", "uCropA", "uCropB", "uMix", "uRadius"] as Uniform[]) {
      this.u[name] = gl.getUniformLocation(program, name);
    }
    // The slide beneath on unit 0, the one coming in over it on unit 1.
    gl.uniform1i(gl.getUniformLocation(program, "uTexA"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "uTexB"), 1);
    const anisotropic = (gl.getExtension("EXT_texture_filter_anisotropic") ??
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")) as EXT_texture_filter_anisotropic | null;
    if (anisotropic) {
      const max = Number(gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) || 1;
      this.anisotropy = { ext: anisotropic, max: Math.min(4, max) };
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // One draw now, into the hidden canvas, so the driver compiles the shaders here rather than on the first frame of
    // the wave (on some GPUs that took a frame or three, right as the frame began to grow).
    gl.uniform2f(this.u.uRes, 1, 1);
    gl.uniform1f(this.u.uFocal, 1);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    gl.flush();
    canvas.addEventListener("webglcontextlost", () => {
      this.ok = false;
      this.textures.clear();
      this.hide();
    });
    this.ok = true;
  }

  /**
   * Decodes and uploads these pictures in the background, once each, so they are ready to draw
   * when the wave starts. Safe to call early: a picture still loading is taken when it lands.
   */
  prepare(images: Iterable<HTMLImageElement>) {
    for (const image of images) this.load(image);
  }

  /** Whether `image` has been uploaded and can be drawn without waiting. */
  ready(image: HTMLImageElement) {
    return this.textures.get(image)?.ready === true;
  }

  private load(image: HTMLImageElement) {
    const gl = this.gl;
    if (!gl || !this.ok) return;
    if (!image.complete || !image.naturalWidth) {
      image.addEventListener("load", () => this.load(image), { once: true });
      return;
    }
    const src = image.currentSrc || image.src;
    const current = this.textures.get(image);
    // Already taken from this file (the browser may pick a larger candidate after a resize).
    if (current?.src === src) return;
    const slot: Slot = { texture: current?.texture ?? gl.createTexture()!, src, ready: false };
    this.textures.set(image, slot);
    void this.decode(image).then((source) => {
      if (this.ok && this.textures.get(image) === slot) this.upload(slot, source);
      if (source !== image) (source as ImageBitmap).close();
    });
  }

  /** The picture's pixels, decoded off the main thread where the browser can. */
  private async decode(image: HTMLImageElement): Promise<HTMLImageElement | ImageBitmap> {
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(image);
      } catch {
        // Fall through to the element itself.
      }
    }
    try {
      await image.decode();
    } catch {
      // Still drawable; the upload decodes it.
    }
    return image;
  }

  private upload(slot: Slot, source: HTMLImageElement | ImageBitmap) {
    const gl = this.gl!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, slot.texture);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } catch {
      return;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Mipmaps keep the picture smooth when it is drawn smaller than it is (WebGL 1 only allows them on power-of-two sizes).
    const width = "naturalWidth" in source ? source.naturalWidth : source.width;
    const height = "naturalHeight" in source ? source.naturalHeight : source.height;
    if (this.webgl2 || (isPow2(width) && isPow2(height))) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    if (this.anisotropy) gl.texParameterf(gl.TEXTURE_2D, this.anisotropy.ext.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropy.max);
    slot.ready = true;
  }

  /**
   * The canvas's place and size, in its parent's px, and the depth of the eye (`focal`, px): the sheet's
   * perspective. The canvas need only be as big as the sheet with room for its waves: every px of it is
   * cleared and drawn on every frame.
   */
  place(left: number, top: number, width: number, height: number, focal = height * 1.4) {
    this.focal = focal;
    const style = this.canvas.style;
    const at = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    if (at !== this.placed) style.transform = this.placed = at;
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

  /** Draws the frame; false when it cannot (the caller then keeps the DOM frame). */
  draw(frame: WaveFrame) {
    const gl = this.gl;
    const under = this.textures.get(frame.under.image);
    if (!this.ok || !gl || !under?.ready) return false;
    // A slide still uploading simply waits its turn beneath, rather than flashing the DOM frame.
    const over = frame.over ? this.textures.get(frame.over.image) : null;
    const blending = !!(frame.over && over?.ready);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, under.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blending ? over!.texture : under.texture);
    const u = this.u;
    gl.uniform2f(u.uRes, this.width, this.height);
    gl.uniform2f(u.uCenter, frame.cx, frame.cy);
    gl.uniform2f(u.uSize, frame.w, frame.h);
    gl.uniform1f(u.uAmp, frame.amp);
    gl.uniform1f(u.uBend, frame.bend);
    gl.uniform1f(u.uPhase, frame.phase);
    gl.uniform1f(u.uFocal, this.focal);
    gl.uniform4f(u.uCropA, ...frame.under.crop);
    gl.uniform4f(u.uCropB, ...(blending ? frame.over!.crop : frame.under.crop));
    gl.uniform1f(u.uMix, blending ? frame.mix : 0);
    gl.uniform1f(u.uRadius, Math.min(frame.radius, frame.w / 2, frame.h / 2));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    if (this.canvas.style.visibility !== "visible") this.canvas.style.visibility = "visible";
    return true;
  }

  hide() {
    if (this.canvas.style.visibility !== "hidden") this.canvas.style.visibility = "hidden";
  }

  destroy() {
    this.ok = false;
    this.textures.clear();
    this.gl?.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.remove();
  }
}
