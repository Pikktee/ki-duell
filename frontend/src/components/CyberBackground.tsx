import React, { useEffect, useRef } from 'react';
import { audioManager } from '../audio';

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
  uniform float u_bass;
  uniform float u_level;
  uniform vec2 u_mouse;
  uniform float u_distortionFade;

  // Basic noise for distortion
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
    // UV Warp / Domain Warp on beat
    float warp = noise(p * 2.0 + u_time * 0.5) * u_bass * 0.3 * u_distortionFade;
    vec2 warpP = p + vec2(warp, -warp);
    
    float t = u_time * 0.06;
    
    // Base colors mapping
    vec3 baseCyan = vec3(0.0, 1.0, 0.9);
    vec3 baseMagenta = vec3(1.0, 0.0, 0.8);
    
    // Hue shift guided by beat/level
    float hueShift = sin(u_level * 5.0 + t + warpP.x) * 0.5 + 0.5;
    vec3 colorA = mix(baseCyan, baseMagenta, hueShift);
    vec3 colorB = mix(baseMagenta, baseCyan, hueShift);

    // Dark background base
    vec3 col = vec3(0.01, 0.02, 0.04);
    
    // Add horizon glow to blend sky and ground smoothly
    float horizonGlow = exp(-abs(warpP.y - 0.2) * 5.0);
    col += mix(colorA, colorB, sin(warpP.x * 2.2 + t) * 0.5 + 0.5) * horizonGlow * 0.4;

    // Sky/Upper area
    float skyY = warpP.y - 0.2;
    if (skyY > -0.1) {
      float wave = sin(warpP.x * 2.0 + t) * cos(warpP.y * 1.5 - t * 0.5) * sin(warpP.x * warpP.y * 3.0 + t);
      float skyFade = smoothstep(-0.05, 0.1, skyY);
      col += mix(colorA, colorB, sin(warpP.x + t)*0.5+0.5) * max(0.0, wave) * 0.4 * (1.0 + u_level * 1.5 + u_bass * 3.0) * skyFade;

      // --- Flying Cruisers / Traffic in Sky ---
      // Adding animated streaks that act as flying ships across the grid
      for (int i = 0; i < 4; i++) {
         float fi = float(i);
         float trSpeed = 0.8 + hash(vec2(fi, 1.0)) * 2.0;
         float dir = mod(fi, 2.0) == 0.0 ? 1.0 : -1.0; 
         
         // Animate ships flying across a wider space to loop seamlessly
         float trX = fract(t * trSpeed * 0.15 + fi * 0.25) * 8.0 - 4.0;
         if (dir < 0.0) trX = -trX;
         
         // Lowered Y position so they fly closer to the horizon
         float trY = 0.02 + hash(vec2(fi, 2.0)) * 0.12;
         vec2 trPos = vec2(trX, trY);
         
         // Base coordinates used so they don't bounce via warpP
         vec2 diff = vec2(p.x, p.y - 0.2) - trPos;
         
         // Create a ship shape with a bright front and trailing tail
         float stretch = (diff.x * dir < 0.0) ? 3.0 : 8.0; // tail stretch vs front
         float distToTr = length(vec2(diff.x * stretch, diff.y * 30.0)); 
         float coreDist = length(vec2(diff.x * 6.0, diff.y * 50.0));
         
         float glow = exp(-distToTr * 15.0) * 0.8;
         float core = exp(-coreDist * 60.0) * 1.5;
         
         // Add engine thruster
         vec2 thrusterDiff = diff + vec2(dir * 0.02, 0.0);
         float thrusterDist = length(vec2(thrusterDiff.x * 12.0, thrusterDiff.y * 40.0));
         float thrusterGlow = exp(-thrusterDist * 80.0) * (1.5 + u_bass * 2.0);
         
         // Colors react to music (u_bass)
         vec3 baseTrColor = mix(colorB, colorA, fract(fi * 0.3 + u_bass * 1.5));
         vec3 trColor = mix(baseTrColor, vec3(1.0), hash(vec2(fi, 3.0)) * 0.5);
         
         // Mix all parts together
         col += trColor * glow * 1.2;
         col += vec3(1.0) * core;
         col += mix(vec3(1.0, 0.4, 0.1), colorA, fract(fi * 0.7)) * thrusterGlow;
      }
    }

    // Cyberpunk ground grid
    if (warpP.y < 0.2) {
      float y = warpP.y - 0.2; 
      float z = 1.0 / abs(y);
      
      vec2 grid_uv = vec2(warpP.x * z, z - t * 1.5);
      vec2 grid = abs(fract(grid_uv) - 0.5);
      
      // Dynamic procedural anti-aliasing
      // Soften lines based on distance to prevent harsh pixelation
      float blur = min(0.45, z * 0.02);
      float line = smoothstep(0.40 - blur, 0.5, grid.x) + smoothstep(0.40 - blur, 0.5, grid.y);
      
      // Exponentially fade out ONLY the crisp lines before they reach the Nyquist limit (z > ~25) 
      // where aliasing fundamentally occurs. 
      float lineFade = exp(-z * 0.12);
      line *= lineFade;
      
      vec3 gridCol = mix(colorA, colorB, sin(warpP.x*2.0 + t)*0.5+0.5) * line;
      
      // Intense glow & brightness on beats
      gridCol *= 1.0 + (u_bass * 12.0) + (u_level * 1.5);
      
      // Solid floor base color (ensures there is matter between the grid lines)
      vec3 floorCol = mix(colorB, colorA, sin(z*0.2 - t)*0.5+0.5) * (0.2 + u_bass * 1.0);
      
      vec3 finalGroundCol = floorCol + gridCol;
      
      // Smoothly blend the entire ground into the sky/horizon color as z approaches infinity
      // This exponential blend ensures NO hard black horizon bar ever appears.
      float horizonFade = exp(-z * 0.05);
      
      col = mix(col, finalGroundCol, horizonFade);
    }
    return col;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Stronger parallax on X-axis from mouse, subtle on Y
    p.x -= u_mouse.x * 0.12;
    p.y -= u_mouse.y * 0.04;
    
    // Zoom punch on beats
    p *= 1.0 - (u_bass * 0.08 * u_distortionFade);
    
    // Radial shockwave on beats
    float d = length(p);
    float shock = sin(d * 15.0 - u_time * 2.0) * exp(-d * 2.0) * u_bass * 0.07 * u_distortionFade;
    p += normalize(p) * shock;
    
    // Chromatic Aberration based on beat
    float ca = u_bass * 0.04 * u_distortionFade; // strength of RGB split
    vec3 col;
    if (ca > 0.005) {
      col.r = getSceneColor(p - vec2(ca, 0.0)).r;
      col.g = getSceneColor(p).g;
      col.b = getSceneColor(p + vec2(ca, 0.0)).b;
    } else {
      col = getSceneColor(p);
    }
    
    // Vignetting (darken edges)
    float vignette = smoothstep(2.5, 0.2, length(p));
    col *= vignette * 0.4; // Even darker overall

    // Dithering to eliminate color banding
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
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function CyberBackground({ isActiveGame = false }: { isActiveGame?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio uniforms state placeholders
  const uniformsRef = useRef({
    bass: 0,
    level: 0,
    mouseX: 0,
    mouseY: 0
  });

  // Reference to isActiveGame so it can be used in the render loop without rebuilding the effect
  const isActiveGameRef = useRef(isActiveGame);
  useEffect(() => {
    isActiveGameRef.current = isActiveGame;
  }, [isActiveGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: false, 
      depth: false, 
      antialias: false, 
      premultipliedAlpha: false 
    });
    if (!gl) return;

    // Setup shaders
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full screen quad geometry
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const bassLoc = gl.getUniformLocation(program, "u_bass");
    const levelLoc = gl.getUniformLocation(program, "u_level");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const distortionFadeLoc = gl.getUniformLocation(program, "u_distortionFade");

    // Reduced motion & visibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    let animationFrameId: number;
    let startTime = performance.now();
    let timeOffset = 0;
    let lastTime = startTime;
    let isPaused = false;

    const resize = () => {
      // Capped devicePixelRatio for performance
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2); 
      const displayWidth = Math.floor(window.innerWidth * pixelRatio);
      const displayHeight = Math.floor(window.innerHeight * pixelRatio);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse and Touch tracking for parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Visibility change pauses animation
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      
      if (isPaused) {
        return;
      }

      const delta = now - lastTime;
      lastTime = now;
      
      let bass = 0;
      let level = 0;
      if (!prefersReducedMotion.matches) {
        const audioData = audioManager.getAudioReactivity();
        const multiplier = isActiveGameRef.current ? 0.25 : 1.0;
        bass = audioData.bass * multiplier;
        level = audioData.level * multiplier;
        
        // Accumulate time based on level and transient pulse to increase speed smoothly
        timeOffset += delta * (1.0 + level * 1.5 + bass * 2.0);
      }

      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, timeOffset * 0.001); // Seconds
      
      // Pass from audioManager
      gl.uniform1f(bassLoc, bass);
      gl.uniform1f(levelLoc, level);
      
      const timeElapsed = now - startTime;
      const distortionFade = Math.max(0, Math.min(1, (timeElapsed - 4000) / 2000));
      gl.uniform1f(distortionFadeLoc, distortionFade);
      
      // Smoothly interpolate mouse (spring-like effect)
      if (!prefersReducedMotion.matches) {
        uniformsRef.current.mouseX += (targetMouseX - uniformsRef.current.mouseX) * 0.05;
        uniformsRef.current.mouseY += (targetMouseY - uniformsRef.current.mouseY) * 0.05;
      } else {
        uniformsRef.current.mouseX += (0 - uniformsRef.current.mouseX) * 0.05;
        uniformsRef.current.mouseY += (0 - uniformsRef.current.mouseY) * 0.05;
      }
      gl.uniform2f(mouseLoc, uniformsRef.current.mouseX, uniformsRef.current.mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-50 animate-slow-fade-in"
      style={{
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    />
  );
}
