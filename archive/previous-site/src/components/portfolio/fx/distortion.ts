/**
 * One shared, dependency-free WebGL canvas that renders a soft liquid displacement
 * over whichever card image is hovered. It is attached to a single card at a time,
 * renders only while active, caps DPR at 1.5 and removes itself when idle.
 */

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform float uStrength;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float dist = distance(uv, uMouse);
  float falloff = smoothstep(0.6, 0.0, dist);
  vec2 dir = normalize(uv - uMouse + 0.0001);
  float ripple = sin(dist * 26.0 - uTime * 3.5);
  vec2 flow = vec2(sin(uv.y * 9.0 + uTime * 1.7), cos(uv.x * 7.0 + uTime * 1.3));
  vec2 disp = dir * ripple * 0.016 * falloff * uStrength + flow * 0.0035 * uStrength;

  vec2 tuv = (uv + disp) * uScale + uOffset;
  float shift = 0.005 * uStrength * falloff;
  float r = texture2D(uTex, tuv + vec2(shift, 0.0)).r;
  float g = texture2D(uTex, tuv).g;
  float b = texture2D(uTex, tuv - vec2(shift, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

type Uniforms = Record<"uMouse" | "uScale" | "uOffset" | "uStrength" | "uTime", WebGLUniformLocation | null>;

class Distortion {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private uniforms: Uniforms | null = null;
  private texture: WebGLTexture | null = null;
  private supported: boolean | null = null;
  private container: HTMLElement | null = null;
  private image: HTMLImageElement | null = null;
  private frame = 0;
  private hovering = false;
  private strength = 0;
  private target = 0;
  private mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  private lastMove = { x: 0, y: 0 };
  private start = 0;

  private init() {
    if (this.supported !== null) return this.supported;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return (this.supported = false);

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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return (this.supported = false);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.uniforms = {
      uMouse: gl.getUniformLocation(program, "uMouse"),
      uScale: gl.getUniformLocation(program, "uScale"),
      uOffset: gl.getUniformLocation(program, "uOffset"),
      uStrength: gl.getUniformLocation(program, "uStrength"),
      uTime: gl.getUniformLocation(program, "uTime"),
    };

    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      opacity: "0",
      transition: "opacity 400ms ease",
      pointerEvents: "none",
    });
    canvas.addEventListener("webglcontextlost", () => {
      this.supported = false;
      this.detach(true);
    });

    this.canvas = canvas;
    this.gl = gl;
    return (this.supported = true);
  }

  attach(container: HTMLElement, image: HTMLImageElement | null) {
    if (!image || !this.init() || !this.canvas || !this.gl) return;
    if (this.container !== container) this.detach(true);
    this.container = container;
    this.image = image;
    this.hovering = true;
    this.target = 1;

    const upload = () => {
      if (this.image !== image || !this.gl) return;
      try {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, image);
      } catch {
        this.detach(true);
        return;
      }
      this.resize();
      container.appendChild(this.canvas!);
      requestAnimationFrame(() => this.canvas && (this.canvas.style.opacity = "1"));
      if (!this.frame) this.frame = requestAnimationFrame(this.loop);
    };

    if (image.complete && image.naturalWidth) upload();
    else image.addEventListener("load", upload, { once: true });
  }

  move(nx: number, ny: number) {
    const velocity = Math.hypot(nx - this.lastMove.x, ny - this.lastMove.y);
    this.lastMove = { x: nx, y: ny };
    this.mouse.tx = nx;
    this.mouse.ty = 1 - ny;
    this.target = Math.min(1.4, 0.35 + velocity * 12);
  }

  leave() {
    this.hovering = false;
    this.target = 0;
  }

  detach(immediate = false) {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (this.canvas) {
      this.canvas.style.opacity = "0";
      if (immediate) this.canvas.remove();
    }
    this.container = null;
    this.image = null;
    this.strength = 0;
  }

  private resize() {
    const { canvas, gl, image, container, uniforms } = this;
    if (!canvas || !gl || !image || !container || !uniforms) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);

    // object-fit: cover mapping
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const boxAspect = width / height;
    const scale = boxAspect > imageAspect ? [1, imageAspect / boxAspect] : [boxAspect / imageAspect, 1];
    gl.uniform2f(uniforms.uScale, scale[0], scale[1]);
    gl.uniform2f(uniforms.uOffset, (1 - scale[0]) / 2, (1 - scale[1]) / 2);
  }

  private loop = () => {
    if (!this.start) this.start = performance.now();
    const { gl, uniforms } = this;
    if (!gl || !uniforms) return;

    // Ease toward the target; the hover pulse settles to a gentle idle ripple.
    this.strength += (this.target - this.strength) * 0.08;
    if (this.hovering) this.target += (0.25 - this.target) * 0.04;
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.1;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.1;

    gl.uniform2f(uniforms.uMouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(uniforms.uStrength, this.strength);
    gl.uniform1f(uniforms.uTime, (performance.now() - this.start) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!this.hovering && this.strength < 0.01) {
      this.detach(true);
      return;
    }
    this.frame = requestAnimationFrame(this.loop);
  };
}

export const distortion = typeof window === "undefined" ? null : new Distortion();
