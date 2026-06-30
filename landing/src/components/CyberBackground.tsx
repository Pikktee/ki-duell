import { useEffect, useRef } from "react";

// Audio-free port of the game's CyberBackground. Same shader, but the
// audio uniforms idle at low values so the visual is calm — no music required.
// Mouse parallax stays on; reduced-motion is respected.

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_idleBeat;
  uniform vec2 u_mouse;
  uniform float u_distortionFade;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  vec3 getSceneColor(vec2 p) {
    float warp = noise(p * 2.0 + u_time * 0.5) * u_idleBeat * 0.2 * u_distortionFade;
    vec2 warpP = p + vec2(warp, -warp);
    float t = u_time * 0.06;

    vec3 baseCyan = vec3(0.0, 1.0, 0.9);
    vec3 baseMagenta = vec3(1.0, 0.0, 0.8);

    float hueShift = sin(t + warpP.x) * 0.5 + 0.5;
    vec3 colorA = mix(baseCyan, baseMagenta, hueShift);
    vec3 colorB = mix(baseMagenta, baseCyan, hueShift);

    vec3 col = vec3(0.01, 0.02, 0.04);

    float horizonGlow = exp(-abs(warpP.y - 0.2) * 5.0);
    col += mix(colorA, colorB, sin(warpP.x * 2.2 + t) * 0.5 + 0.5) * horizonGlow * 0.4;

    float skyY = warpP.y - 0.2;
    if (skyY > -0.1) {
      float wave = sin(warpP.x * 2.0 + t) * cos(warpP.y * 1.5 - t * 0.5) * sin(warpP.x * warpP.y * 3.0 + t);
      float skyFade = smoothstep(-0.05, 0.1, skyY);
      col += mix(colorA, colorB, sin(warpP.x + t) * 0.5 + 0.5) * max(0.0, wave) * 0.3 * skyFade;

      for (int i = 0; i < 3; i++) {
         float fi = float(i);
         float trSpeed = 0.6 + hash(vec2(fi, 1.0)) * 1.6;
         float dir = mod(fi, 2.0) == 0.0 ? 1.0 : -1.0;
         float trX = fract(t * trSpeed * 0.15 + fi * 0.33) * 8.0 - 4.0;
         if (dir < 0.0) trX = -trX;
         float trY = 0.02 + hash(vec2(fi, 2.0)) * 0.12;
         vec2 trPos = vec2(trX, trY);
         vec2 diff = vec2(p.x, p.y - 0.2) - trPos;
         float stretch = (diff.x * dir < 0.0) ? 3.0 : 8.0;
         float distToTr = length(vec2(diff.x * stretch, diff.y * 30.0));
         float coreDist = length(vec2(diff.x * 6.0, diff.y * 50.0));
         float glow = exp(-distToTr * 15.0) * 0.7;
         float core = exp(-coreDist * 60.0) * 1.4;
         vec3 trColor = mix(colorA, colorB, fract(fi * 0.3));
         col += trColor * glow;
         col += vec3(1.0) * core;
      }
    }

    if (warpP.y < 0.2) {
      float y = warpP.y - 0.2;
      float z = 1.0 / abs(y);
      vec2 grid_uv = vec2(warpP.x * z, z - t * 1.5);
      vec2 grid = abs(fract(grid_uv) - 0.5);
      float blur = min(0.45, z * 0.02);
      float line = smoothstep(0.40 - blur, 0.5, grid.x) + smoothstep(0.40 - blur, 0.5, grid.y);
      float lineFade = exp(-z * 0.12);
      line *= lineFade;
      vec3 gridCol = mix(colorA, colorB, sin(warpP.x * 2.0 + t) * 0.5 + 0.5) * line;
      gridCol *= 1.0 + u_idleBeat * 1.5;
      vec3 floorCol = mix(colorB, colorA, sin(z * 0.2 - t) * 0.5 + 0.5) * (0.18 + u_idleBeat * 0.4);
      vec3 finalGroundCol = floorCol + gridCol;
      float horizonFade = exp(-z * 0.05);
      col = mix(col, finalGroundCol, horizonFade);
    }
    return col;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    p.x -= u_mouse.x * 0.12;
    p.y -= u_mouse.y * 0.04;

    vec3 col = getSceneColor(p);

    float vignette = smoothstep(2.5, 0.2, length(p));
    col *= vignette * 0.45;

    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.02 - 0.01;
    col += dither;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      depth: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const idleBeatLoc = gl.getUniformLocation(program, "u_idleBeat");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const distortionFadeLoc = gl.getUniformLocation(program, "u_distortionFade");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let animationFrameId = 0;
    let startTime = performance.now();
    let timeOffset = 0;
    let lastTime = startTime;
    let isPaused = false;

    const resize = () => {
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * pr);
      const h = Math.floor(window.innerHeight * pr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    let targetMouseX = 0;
    let targetMouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        lastTime = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (isPaused) return;
      const delta = now - lastTime;
      lastTime = now;

      const reduced = prefersReducedMotion.matches;
      // Idle "beat": gentle sinusoidal pulse since there's no audio here.
      const idleBeat = reduced ? 0 : 0.06 + 0.04 * Math.sin(now * 0.0009);

      if (!reduced) timeOffset += delta * (1.0 + idleBeat * 0.6);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, timeOffset * 0.001);
      gl.uniform1f(idleBeatLoc, idleBeat);
      const timeElapsed = now - startTime;
      const distortionFade = Math.max(0, Math.min(1, (timeElapsed - 1500) / 2000));
      gl.uniform1f(distortionFadeLoc, distortionFade);

      if (!reduced) {
        mouseRef.current.x += (targetMouseX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (targetMouseY - mouseRef.current.y) * 0.05;
      } else {
        mouseRef.current.x = 0;
        mouseRef.current.y = 0;
      }
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-50 h-full w-full pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}
