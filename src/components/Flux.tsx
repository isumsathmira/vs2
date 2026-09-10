'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const N = 10_000;
const STOPS = 6;

const STATION_COLORS = [
  new THREE.Color('#2fe6c8'),
  new THREE.Color('#5ab8ff'),
  new THREE.Color('#8a6bff'),
  new THREE.Color('#c46bff'),
  new THREE.Color('#ff6bb0'),
  new THREE.Color('#ffb36b'),
];

/* ─────────────────────────────────────────────────────────────
   MATH HELPERS
───────────────────────────────────────────────────────────── */
function smootherstep(x: number): number {
  x = Math.min(1, Math.max(0, x));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function seededRandom(seed: number): number {
  let s = (seed * 1664525 + 1013904223) & 0xffffffff;
  s = (s >>> 0) / 4294967296;
  return s;
}

/* ─────────────────────────────────────────────────────────────
   WORDMARK SAMPLER
───────────────────────────────────────────────────────────── */
function sampleWordmark(): Float32Array {
  const CW = 1200, CH = 320;
  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = '#fff';
  ctx.font = `bold 230px "Sora", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FIXORA', CW / 2, CH / 2);
  const data = ctx.getImageData(0, 0, CW, CH).data;
  const pts: number[] = [];
  const step = 3;
  for (let y = 0; y < CH; y += step) {
    for (let x = 0; x < CW; x += step) {
      const idx = (y * CW + x) * 4;
      if (data[idx + 3] > 128) {
        pts.push(x, y);
      }
    }
  }
  const out = new Float32Array(pts.length / 2 * 3);
  const scaleX = 6 / CW;
  const scaleY = -(6 / CW);
  let wi = 0;
  for (let i = 0; i < pts.length; i += 2) {
    out[wi++] = (pts[i] - CW / 2) * scaleX;
    out[wi++] = (pts[i + 1] - CH / 2) * scaleY;
    out[wi++] = 0;
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────
   STATION BUFFERS
───────────────────────────────────────────────────────────── */
type StationType = 'static' | 'ring' | 'sphere' | 'wave';
type StationBuf = {
  pos: Float32Array;
  type: StationType;
};

function buildCloud(): StationBuf {
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = seededRandom(i * 3 + 0);
    const theta = seededRandom(i * 3 + 1) * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom(i * 3 + 2) - 1);
    const rad = 2.5 + r * 1.5;
    pos[i * 3 + 0] = rad * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta) * 0.45;
    pos[i * 3 + 2] = rad * Math.cos(phi) * 0.7;
  }
  return { pos, type: 'static' };
}

function buildRing(): StationBuf {
  const pos = new Float32Array(N * 3);
  const spread = 0.18;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + seededRandom(i) * 0.08;
    const radius = 2.6 + (seededRandom(i * 7 + 3) - 0.5) * spread;
    const tilt = 0.35;
    const x = Math.cos(angle) * radius;
    const yr = Math.sin(angle) * radius;
    pos[i * 3 + 0] = x;
    pos[i * 3 + 1] = yr * Math.cos(tilt) + (seededRandom(i * 5 + 1) - 0.5) * spread;
    pos[i * 3 + 2] = yr * Math.sin(tilt) + (seededRandom(i * 5 + 2) - 0.5) * spread;
  }
  return { pos, type: 'ring' };
}

function buildWordmark(wm: Float32Array): StationBuf {
  const M = wm.length / 3;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const src = i % M;
    pos[i * 3 + 0] = wm[src * 3 + 0] + (seededRandom(i * 11 + 0) - 0.5) * 0.01;
    pos[i * 3 + 1] = wm[src * 3 + 1] + (seededRandom(i * 11 + 1) - 0.5) * 0.01;
    pos[i * 3 + 2] = wm[src * 3 + 2] + (seededRandom(i * 11 + 2) - 0.5) * 0.04;
  }
  return { pos, type: 'static' };
}

function buildWave(): StationBuf {
  const cols = 140, rows = Math.ceil(N / cols);
  const pos = new Float32Array(N * 3);
  const spX = 5.5 / (cols - 1);
  const spY = 3.5 / (rows - 1);
  for (let i = 0; i < N; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    pos[i * 3 + 0] = -2.75 + c * spX;
    pos[i * 3 + 1] = -1.75 + r * spY;
    pos[i * 3 + 2] = 0;
  }
  return { pos, type: 'wave' };
}

function buildGrid(): StationBuf {
  const cols = 140, rows = Math.ceil(N / cols);
  const pos = new Float32Array(N * 3);
  const spX = 5.5 / (cols - 1);
  const spY = 3.5 / (rows - 1);
  for (let i = 0; i < N; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    pos[i * 3 + 0] = -2.75 + c * spX;
    pos[i * 3 + 1] = -1.75 + r * spY;
    pos[i * 3 + 2] = 0;
  }
  return { pos, type: 'static' };
}

function buildSphere(): StationBuf {
  const pos = new Float32Array(N * 3);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < N; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
    const r = 2.4;
    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  return { pos, type: 'sphere' };
}

/* ─────────────────────────────────────────────────────────────
   getPos — live position for station s, particle i, time t
───────────────────────────────────────────────────────────── */
function getPos(
  stations: StationBuf[],
  s: number,
  i: number,
  t: number,
  out: THREE.Vector3
): void {
  const st = stations[s];
  const bx = st.pos[i * 3 + 0];
  const by = st.pos[i * 3 + 1];
  const bz = st.pos[i * 3 + 2];

  if (st.type === 'ring') {
    const angle = t * 0.18;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    out.set(bx * cos + bz * sin, by, -bx * sin + bz * cos);
  } else if (st.type === 'sphere') {
    const angle = t * 0.12;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    out.set(bx * cos + bz * sin, by, -bx * sin + bz * cos);
  } else if (st.type === 'wave') {
    const waveY = Math.sin(bx * 1.8 + t * 0.7) * 0.45
      + Math.sin(bx * 3.2 + t * 1.1 + i * 0.001) * 0.18;
    out.set(bx, by + waveY, bz);
  } else {
    out.set(bx, by, bz);
  }
}

/* ─────────────────────────────────────────────────────────────
   SHADERS
───────────────────────────────────────────────────────────── */
const VERT = /* glsl */`
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uSize;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * aSize * 300.0 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */`
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float alpha = smoothstep(0.25, 0.01, d);
    gl_FragColor = vec4(vColor * 1.4, alpha * 0.85);
  }
`;

/* ─────────────────────────────────────────────────────────────
   STATION METADATA
───────────────────────────────────────────────────────────── */
const STATION_META = [
  { kicker: '001 / ORIGIN', headline: 'Born from noise', body: 'Ten thousand points of light drift into being.' },
  { kicker: '002 / ORBIT', headline: 'Finding form', body: 'A luminous ring traces its quiet ellipse.' },
  { kicker: '003 / IDENTITY', headline: 'FIXORA', body: 'The brand crystallises from pure light.' },
  { kicker: '004 / FLOW', headline: 'Currents of motion', body: 'Form dissolves into a living wave.' },
  { kicker: '005 / ORDER', headline: 'Precision arranged', body: 'Every particle snaps to its place.' },
  { kicker: '006 / INFINITY', headline: 'Complete', body: 'A sphere — the perfect return to beginning.' },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function Flux() {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !stageRef.current) return;
    const mount = mountRef.current;
    const stageEl = stageRef.current;

    // Declare variables here so the cleanup function can access them properly
    let rafId: number;
    let ro: ResizeObserver;
    let renderer: THREE.WebGLRenderer;
    let geometry: THREE.BufferGeometry;
    let material: THREE.ShaderMaterial;
    let onScroll: () => void;

    document.fonts.ready.then(() => {
      // Check if unmounted while waiting for fonts
      if (!mountRef.current) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ── Renderer ── */
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      /* ── Scene / Camera ── */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0, 8);

      /* ── Resize ── */
      function resize() {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      ro = new ResizeObserver(resize);
      ro.observe(mount);

      /* ── Build buffers ── */
      const wm = sampleWordmark();
      const stations: StationBuf[] = [
        buildCloud(),
        buildRing(),
        buildWordmark(wm),
        buildWave(),
        buildGrid(),
        buildSphere(),
      ];

      /* ── Curl vectors ── */
      const curlVecs = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const ax = seededRandom(i * 17 + 5) * 2 - 1;
        const ay = seededRandom(i * 17 + 6) * 2 - 1;
        const az = seededRandom(i * 17 + 7) * 2 - 1;
        const len = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
        curlVecs[i * 3 + 0] = ax / len;
        curlVecs[i * 3 + 1] = ay / len;
        curlVecs[i * 3 + 2] = az / len;
      }

      /* ── Wobble phases ── */
      const wobblePhase = new Float32Array(N);
      for (let i = 0; i < N; i++) wobblePhase[i] = seededRandom(i * 31) * Math.PI * 2;

      /* ── Geometry ── */
      const positions = new Float32Array(N * 3);
      const colors = new Float32Array(N * 3);
      const sizes = new Float32Array(N);
      for (let i = 0; i < N; i++) sizes[i] = 0.4 + seededRandom(i * 13) * 0.9;

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

      material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: { uSize: { value: 1.0 } },
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      /* ── Stagger offsets ── */
      const staggerOffset = new Float32Array(N);
      for (let i = 0; i < N; i++) staggerOffset[i] = seededRandom(i * 7 + 9);

      /* ── Temp objects ── */
      const posA = new THREE.Vector3();
      const posB = new THREE.Vector3();

      /* ── Scroll / autoplay state ── */
      let scrollP = 0;
      let smoothP = 0;
      let autoT = 0;
      let autoDelta = 0.00035;

      const urlParams = new URLSearchParams(window.location.search);
      const autoPlay = urlParams.has('card');

      /* ── Scroll listener ── */
      onScroll = () => {
        if (autoPlay || prefersReduced) return;
        const pageH = stageEl.scrollHeight;
        const pct = window.scrollY / (pageH - window.innerHeight);
        scrollP = Math.min(1, Math.max(0, pct));
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      /* ── rAF loop ── */
      let prevTime = performance.now();

      function tick() {
        rafId = requestAnimationFrame(tick);
        const now = performance.now();
        // Limit dt to prevent huge jumps if tab is inactive
        const dt = Math.min((now - prevTime) / 1000, 0.05);
        prevTime = now;

        // global progress p ∈ [0,1]
        let p: number;
        if (prefersReduced) {
          p = 2 / (STOPS - 1);
          smoothP = p;
        } else if (autoPlay) {
          autoT += autoDelta;
          if (autoT >= 1) { autoT = 1; autoDelta = -Math.abs(autoDelta); }
          if (autoT <= 0) { autoT = 0; autoDelta = Math.abs(autoDelta); }
          p = autoT;
          smoothP = lerp(smoothP, p, 0.035);
        } else {
          p = scrollP;
          smoothP = lerp(smoothP, p, 0.07);
        }

        const sp = smoothP * (STOPS - 1);
        const si = Math.min(Math.floor(sp), STOPS - 2);
        const frac = sp - si;
        const morphT = smootherstep((frac - 0.22) / 0.56);

        const t = now * 0.001;

        /* ── particles ── */
        for (let i = 0; i < N; i++) {
          const so = staggerOffset[i];
          const range = 0.72;
          const staggeredT = smootherstep(
            Math.min(1, Math.max(0, (morphT - so * range) / (1 - range + 0.001)))
          );

          getPos(stations, si, i, t, posA);
          getPos(stations, si + 1, i, t, posB);

          const swirlAmp = Math.sin(staggeredT * Math.PI) * 0.55;
          const cx = curlVecs[i * 3 + 0];
          const cy = curlVecs[i * 3 + 1];
          const cz = curlVecs[i * 3 + 2];
          const wob = prefersReduced ? 0 : Math.sin(t * 0.9 + wobblePhase[i]) * 0.015;

          positions[i * 3 + 0] = lerp(posA.x, posB.x, staggeredT) + cx * swirlAmp + wob;
          positions[i * 3 + 1] = lerp(posA.y, posB.y, staggeredT) + cy * swirlAmp * 0.5 + wob * 0.7;
          positions[i * 3 + 2] = lerp(posA.z, posB.z, staggeredT) + cz * swirlAmp * 0.4;

          // colour lerp
          const cA = STATION_COLORS[si];
          const cB = STATION_COLORS[si + 1];
          colors[i * 3 + 0] = lerp(cA.r, cB.r, morphT);
          colors[i * 3 + 1] = lerp(cA.g, cB.g, morphT);
          colors[i * 3 + 2] = lerp(cA.b, cB.b, morphT);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.aColor.needsUpdate = true;

        /* ── HTML overlays ── */
        if (!prefersReduced) {
          for (let s = 0; s < STOPS; s++) {
            const el = document.getElementById(`flux-section-${s}`);
            if (el) {
              const dist = Math.abs(smoothP * (STOPS - 1) - s);
              el.style.opacity = String(Math.max(0, 1 - dist * 2.2));
            }
            const dot = document.getElementById(`flux-dot-${s}`);
            if (dot) {
              const dist = Math.abs(smoothP * (STOPS - 1) - s);
              dot.classList.toggle('flux-dot--active', dist < 0.5);
            }
          }
        }

        renderer.render(scene, camera);
      }

      tick();
    });

    // ── cleanup ──
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.dispose();
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Spline+Sans+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --navy:#06070d;--navy-core:#11132e;
          --teal:#2fe6c8;--violet:#8a6bff;--pink:#ff6bb0;--amber:#ffb36b;
          --text:#e8eaf6;--muted:#7b82b0;
        }
        html{scroll-behavior:auto}
        body{background:var(--navy)}
        .flux-root{
          position:relative;
          background:var(--navy);
          font-family:'Sora',sans-serif;
          color:var(--text);
          overflow-x:hidden;
        }
        .flux-page{height:620svh;position:relative}
        .flux-stage{
          position:sticky;top:0;
          height:100svh;width:100%;overflow:hidden;
          background:radial-gradient(ellipse 70% 55% at 50% 48%,var(--navy-core) 0%,var(--navy) 100%);
        }
        .flux-canvas{position:absolute;inset:0;width:100%;height:100%}
        .flux-canvas canvas{width:100%!important;height:100%!important}
        .flux-chrome{
          position:absolute;inset:0;pointer-events:none;
          display:flex;flex-direction:column;justify-content:space-between;
          padding:2rem 2.5rem;z-index:10;
        }
        .flux-wordmark{
          font-family:'Sora',sans-serif;font-weight:800;
          font-size:1.05rem;letter-spacing:0.22em;text-transform:uppercase;
          color:rgba(232,234,246,0.82);display:flex;align-items:center;gap:1rem;
        }
        .flux-wordmark span{
          font-family:'Spline Sans Mono',monospace;font-size:0.7rem;
          color:var(--muted);letter-spacing:0.1em;font-weight:400;
        }
        .flux-hint{
          font-family:'Spline Sans Mono',monospace;font-size:0.7rem;
          letter-spacing:0.18em;color:var(--muted);text-align:center;
          animation:flux-blink 2.4s ease-in-out infinite;
        }
        @keyframes flux-blink{0%,100%{opacity:.35}50%{opacity:.9}}
        .flux-sections{
          position:absolute;inset:0;pointer-events:none;
          display:flex;align-items:center;justify-content:flex-start;
          padding-left:clamp(2rem,8vw,7rem);z-index:9;
        }
        .flux-section{position:absolute;width:min(460px,80vw);opacity:0;transition:none}
        .flux-section .kicker{
          font-family:'Spline Sans Mono',monospace;font-size:0.65rem;
          letter-spacing:0.22em;color:var(--teal);text-transform:uppercase;margin-bottom:0.6rem;
        }
        .flux-section .headline{
          font-family:'Sora',sans-serif;font-weight:800;
          font-size:clamp(1.8rem,4.5vw,3.2rem);line-height:1.08;letter-spacing:-0.02em;
          background:linear-gradient(135deg,#e8eaf6 30%,#9198cc 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;margin-bottom:0.8rem;
        }
        .flux-section .body{
          font-family:'Spline Sans Mono',monospace;font-size:0.8rem;
          color:var(--muted);line-height:1.7;letter-spacing:0.04em;
        }
        .flux-dot-rail{
          position:absolute;right:2.2rem;top:50%;transform:translateY(-50%);
          display:flex;flex-direction:column;gap:0.85rem;pointer-events:none;z-index:10;
        }
        .flux-dot{
          width:6px;height:6px;border-radius:50%;
          background:var(--muted);opacity:0.35;
          transition:opacity .3s,background .3s,box-shadow .3s,transform .3s;
        }
        .flux-dot--active{
          background:var(--teal);opacity:1;
          transform:scale(1.6);box-shadow:0 0 8px var(--teal);
        }
        @media(prefers-reduced-motion:reduce){
          .flux-hint{animation:none;opacity:.5}
          .flux-page{height:100svh}
          .flux-stage{position:relative}
          #flux-section-2{opacity:1!important}
        }
      `}</style>

      <div className="flux-root" ref={stageRef}>
        <div className="flux-page">
          <div className="flux-stage">
            <div className="flux-canvas" ref={mountRef} />

            <div className="flux-sections">
              {STATION_META.map((sm, s) => (
                <div key={s} id={`flux-section-${s}`} className="flux-section">
                  <p className="kicker">{sm.kicker}</p>
                  <h2 className="headline">{sm.headline}</h2>
                  <p className="body">{sm.body}</p>
                </div>
              ))}
            </div>

            <div className="flux-dot-rail">
              {STATION_META.map((_, s) => (
                <div
                  key={s}
                  id={`flux-dot-${s}`}
                  className={`flux-dot${s === 0 ? ' flux-dot--active' : ''}`}
                />
              ))}
            </div>

            <div className="flux-chrome">
              <div className="flux-wordmark">
                Fixora®
                <span>Flux · Journey</span>
              </div>
              <p className="flux-hint">Scroll to begin ↓</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}