import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PANEL_META, glowTexture, makePanel, type PanelId } from "./heroPanels";

/* ------------------------------------------------------------------
   Hero 3D: an iridescent "system core" inside a geodesic shell, two
   crossing orbit rings carrying one node per service, and four UI
   panels (Web, CRM/GHL, AI & Automation, Funnels) floating at
   different depths. Panels lift on hover, link to their ring node
   and jump to their section on click. Pointer = parallax, scroll =
   the system opens up. The composition is laid out over an "anchor"
   element so it sits beside the copy on desktop and below it on mobile.
   ------------------------------------------------------------------ */

// R3F 9 still constructs THREE.Clock, which three r18x flags as deprecated.
// Filter only that one upstream message so real warnings stay visible.
const warn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock: This module has been deprecated")) return;
  warn(...args);
};

const ptr = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", e => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });
}

const ORDER: PanelId[] = ["web", "ai", "crm", "funnels"];
type Slot = { pos: [number, number, number]; rot: [number, number]; blur?: number };
const LAYOUT: Record<"wide" | "compact", Record<PanelId, Slot>> = {
  wide: {
    web: { pos: [-2.0, 1.22, 0.35], rot: [0.04, 0.3] },
    ai: { pos: [2.05, 1.38, -0.45], rot: [0.05, -0.3] },
    crm: { pos: [1.78, -1.32, 1.05], rot: [-0.03, -0.2] },
    funnels: { pos: [-1.95, -1.2, -1.05], rot: [-0.02, 0.32], blur: 1.1 },
  },
  compact: {
    web: { pos: [-1.35, 1.75, 0.2], rot: [0.04, 0.22] },
    ai: { pos: [1.45, 1.05, -0.5], rot: [0.05, -0.24] },
    crm: { pos: [1.05, -1.7, 1.0], rot: [-0.03, -0.16] },
    funnels: { pos: [-1.5, -1.0, -1.0], rot: [-0.02, 0.26], blur: 1.1 },
  },
};
const BOX = { wide: [6.4, 4.8], compact: [5.0, 5.9] } as const;
const CAM_Z = 12, FOV = 34;

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);

type SceneProps = {
  anchor: RefObject<HTMLElement | null>;
  hover: PanelId | null;
  onHover: (id: PanelId | null) => void;
  onSelect: (id: PanelId) => void;
  reduced: boolean;
  light: boolean;
};

/* ---------------- environment for the glossy core ---------------- */

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
}

/* ---------------- geodesic shell (slightly irregular, like a low-poly cage) ---------------- */

function useShellGeometry(radius: number) {
  return useMemo(() => {
    const base = new THREE.IcosahedronGeometry(radius, 1);
    const p = base.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // same jitter for coincident vertices (hash of the rounded position)
      const h = Math.sin(Math.round(v.x * 100) * 12.9898 + Math.round(v.y * 100) * 78.233 + Math.round(v.z * 100) * 37.719) * 43758.5453;
      const j = 1 + ((h - Math.floor(h)) - 0.5) * 0.16;
      v.multiplyScalar(j);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    const edges = new THREE.EdgesGeometry(base, 1);
    const verts = new THREE.BufferGeometry().setAttribute("position", p.clone());
    base.dispose();
    return { edges, verts };
  }, [radius]);
}

/* ---------------- particles with depth of field ---------------- */

const pVert = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime, uPR, uScroll;
  varying float vA; varying vec3 vC;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aSeed * 30.0) * 0.18 + uScroll * (1.5 + aSeed * 2.5);
    p.x += cos(uTime * 0.2 + aSeed * 20.0) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_Position = projectionMatrix * mv;
    float blur = clamp(abs(depth - ${CAM_Z.toFixed(1)}) / 7.0, 0.0, 1.0);
    gl_PointSize = (2.2 + fract(aSeed * 9.7) * 3.2) * uPR * (1.0 + blur * 3.2) * (12.0 / max(depth, 0.5));
    vA = mix(0.85, 0.16, blur) * (0.7 + 0.3 * sin(uTime * 1.1 + aSeed * 50.0));
    vC = aColor;
  }`;
const pFrag = /* glsl */ `
  varying float vA; varying vec3 vC;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vC, a * vA);
  }`;

function Particles({ count, reduced }: { count: number; reduced: boolean }) {
  const { gl } = useThree();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), seed = new Float32Array(count);
    const palette = ["#6d3ce6", "#8b5cf6", "#b5279e", "#d946ef", "#0f6fb8", "#38bdf8", "#0b9488"].map(c => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * 26, (Math.random() - 0.5) * 15, 4 - Math.random() * 14], i * 3);
      const c = palette[Math.floor(Math.random() * palette.length)];
      col.set([c.r, c.g, c.b], i * 3);
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  useEffect(() => () => geom.dispose(), [geom]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPR: { value: Math.min(gl.getPixelRatio(), 2) }, uScroll: { value: 0 } }), [gl]);
  const ref = useRef<THREE.Points>(null);
  useFrame(state => {
    uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    uniforms.uScroll.value = scrollProgress(gl.domElement);
    if (ref.current && !reduced) { ref.current.rotation.y += (ptr.x * 0.05 - ref.current.rotation.y) * 0.04; ref.current.rotation.x += (-ptr.y * 0.03 - ref.current.rotation.x) * 0.04; }
  });
  return (
    <points ref={ref} geometry={geom} frustumCulled={false}>
      <shaderMaterial vertexShader={pVert} fragmentShader={pFrag} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}

/** 0 → 1 as the hero (the canvas' parent) scrolls out of view. */
function scrollProgress(canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect();
  return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.85)));
}

/* ---------------- the composition ---------------- */

function System({ anchor, hover, onHover, onSelect, reduced, light }: SceneProps) {
  const { camera, gl, size, invalidate } = useThree();
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Mesh | null)[]>([]);
  const glows = useRef<(THREE.Sprite | null)[]>([]);
  const panels = useRef<(THREE.Mesh | null)[]>([]);
  const leaders = useRef<(THREE.Line | null)[]>([]);
  const t0 = useRef<number | null>(null);
  const hoverRef = useRef(hover);
  hoverRef.current = hover;
  useEffect(() => { invalidate(); }, [hover, invalidate]);
  // reduced motion renders on demand only: redraw once layout, fonts and the environment have settled, and on resize
  useEffect(() => {
    if (!reduced) return;
    const timers = [60, 400, 1200, 2500].map(ms => window.setTimeout(() => invalidate(), ms));
    const onResize = () => invalidate();
    window.addEventListener("resize", onResize);
    return () => { timers.forEach(clearTimeout); window.removeEventListener("resize", onResize); };
  }, [reduced, invalidate]);

  const compact = size.width / Math.max(1, size.height) < 1 || light;
  const layout = LAYOUT[compact ? "compact" : "wide"];

  const tex = useMemo(() => Object.fromEntries(ORDER.map(id => [id, makePanel(id, { blur: LAYOUT.wide[id].blur })])) as Record<PanelId, ReturnType<typeof makePanel>>, []);
  useEffect(() => () => ORDER.forEach(id => tex[id].tex.dispose()), [tex]);
  const glowTex = useMemo(() => ORDER.map(id => glowTexture(PANEL_META[id].color)), []);
  useEffect(() => () => glowTex.forEach(t => t.dispose()), [glowTex]);
  const shellGeo = useShellGeometry(2.08);
  useEffect(() => () => { shellGeo.edges.dispose(); shellGeo.verts.dispose(); }, [shellGeo]);
  const leaderGeos = useMemo(() => ORDER.map(() => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 24 }, () => new THREE.Vector3()))), []);
  useEffect(() => () => leaderGeos.forEach(g => g.dispose()), [leaderGeos]);

  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), curve: new THREE.QuadraticBezierCurve3() }), []);
  const smooth = useRef({ px: 0, py: 0, lift: ORDER.map(() => 0) });

  useFrame((state, dt) => {
    const R = root.current, el = anchor.current;
    if (!R || !el) return;
    const now = state.clock.elapsedTime;
    if (t0.current === null) t0.current = now;
    const t = reduced ? 1000 : now - t0.current;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);

    /* place the composition over the anchor element */
    const cr = gl.domElement.getBoundingClientRect(), ar = el.getBoundingClientRect();
    const unit = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / cr.height; // world units per css px at z=0
    const cx = (ar.left + ar.width / 2 - (cr.left + cr.width / 2)) * unit;
    const cy = -(ar.top + ar.height / 2 - (cr.top + cr.height / 2)) * unit;
    const [bw, bh] = BOX[compact ? "compact" : "wide"];
    const s = Math.min((ar.width * unit) / bw, (ar.height * unit) / bh);
    const intro = easeOut(t / 1.6);
    R.position.set(cx, cy, 0);
    R.scale.setScalar(s * (0.9 + 0.1 * intro));

    /* pointer parallax (whole system leans), scroll opens it up */
    const sp = smooth.current;
    sp.px += ((reduced ? 0 : ptr.x) - sp.px) * k;
    sp.py += ((reduced ? 0 : ptr.y) - sp.py) * k;
    // opens up as the composition itself leaves the top of the viewport (beside the copy on desktop, below it on mobile)
    const p = Math.min(1, Math.max(0, -(ar.top - 90) / Math.max(1, ar.height)));
    R.rotation.y = sp.px * 0.16 + p * 0.25;
    R.rotation.x = -sp.py * 0.1 + p * 0.12;

    if (core.current) {
      core.current.scale.setScalar((0.75 + 0.25 * easeOut(t / 1.2)) * (1 - p * 0.18));
      core.current.rotation.y = (reduced ? 0.4 : t * 0.12) + p * 1.4;
    }
    if (shell.current && !reduced) { shell.current.rotation.y = -t * 0.08; shell.current.rotation.x = Math.sin(t * 0.2) * 0.12; }
    if (ringA.current) ringA.current.rotation.z = reduced ? 0.6 : t * 0.16;
    if (ringB.current) ringB.current.rotation.z = reduced ? 1.2 : -t * 0.1;

    /* nodes glow; the hovered service's node flares */
    ORDER.forEach((id, i) => {
      const on = hoverRef.current === id;
      const g = glows.current[i];
      if (g) { const target = on ? 1.6 : 0.65 + (reduced ? 0 : Math.sin(t * 2 + i) * 0.08); g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, k)); }
      const n = nodes.current[i];
      if (n) n.scale.setScalar(THREE.MathUtils.lerp(n.scale.x, on ? 1.6 : 1, k));
    });

    /* panels: intro fly-in, idle float, depth parallax, hover lift, scroll spread */
    const anyHover = hoverRef.current !== null;
    ORDER.forEach((id, i) => {
      const m = panels.current[i];
      if (!m) return;
      const slot = layout[id];
      const e = easeOut((t - 0.35 - i * 0.14) / 1.3);
      const on = hoverRef.current === id;
      sp.lift[i] += ((on ? 1 : 0) - sp.lift[i]) * k;
      const L = sp.lift[i];
      const depth = slot.pos[2];
      const spread = 1 + p * 0.35;
      m.position.set(
        slot.pos[0] * spread + sp.px * (0.12 + depth * 0.12),
        slot.pos[1] + (reduced ? 0 : Math.sin(t * 0.7 + i * 1.7) * 0.06) + p * (0.6 + i * 0.25) * Math.sign(slot.pos[1]) + sp.py * (0.08 + depth * 0.08),
        depth - (1 - e) * 4 + L * 0.7,
      );
      m.rotation.set(slot.rot[0] * (1 - L), slot.rot[1] * (1 - L * 0.7) + (1 - e) * 0.5 * Math.sign(slot.rot[1]), 0);
      m.scale.setScalar((0.96 + 0.04 * e) * (1 + L * 0.05));
      // front panels skip the depth test so the cage never cuts across them; sort them back-to-front by hand
      if (id !== "funnels") m.renderOrder = 100 + Math.round(m.position.z * 10);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = e * (anyHover && !on ? 0.72 : 1);

      /* leader line from panel to its ring node */
      const line = leaders.current[i], node = nodes.current[i];
      if (line && node) {
        node.getWorldPosition(v.b); R.worldToLocal(v.b);
        v.a.copy(m.position);
        v.c.copy(v.a).lerp(v.b, 0.5); v.c.z += 0.9;
        v.curve.v0.copy(v.a); v.curve.v1.copy(v.c); v.curve.v2.copy(v.b);
        const pts = v.curve.getPoints(23);
        const attr = leaderGeos[i].attributes.position as THREE.BufferAttribute;
        pts.forEach((q, j) => attr.setXYZ(j, q.x, q.y, q.z));
        attr.needsUpdate = true;
        const lm = line.material as THREE.LineBasicMaterial;
        lm.opacity = THREE.MathUtils.lerp(lm.opacity, (on ? 0.85 : 0.14) * e, k);
      }
    });

    camera.position.set(0, 0, CAM_Z);
    camera.lookAt(0, 0, 0);
  });

  const over = (id: PanelId) => (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); gl.domElement.style.cursor = "pointer"; onHover(id); };
  const out = () => { gl.domElement.style.cursor = ""; onHover(null); };

  return (
    <group ref={root}>
      {/* core */}
      <group ref={core}>
        <mesh>
          <sphereGeometry args={[1.42, 96, 96]} />
          <meshPhysicalMaterial color="#e2d8ff" roughness={0.12} metalness={0} clearcoat={1} clearcoatRoughness={0.05} iridescence={0.55} iridescenceIOR={1.3} iridescenceThicknessRange={[150, 420]} sheen={1} sheenColor="#a78bfa" sheenRoughness={0.4} envMapIntensity={0.75} />
        </mesh>
        <group ref={shell}>
          <lineSegments geometry={shellGeo.edges}>
            <lineBasicMaterial color="#7c5cf0" transparent opacity={0.55} />
          </lineSegments>
          <points geometry={shellGeo.verts}>
            <pointsMaterial color="#6d3ce6" size={0.05} sizeAttenuation transparent opacity={0.8} />
          </points>
        </group>
      </group>

      {/* ring A — carries the four service nodes */}
      <group rotation={[Math.PI / 2 - 0.3, 0.12, 0]}>
        <mesh>
          <torusGeometry args={[2.75, 0.011, 8, 220]} />
          <meshBasicMaterial color="#25a99a" transparent opacity={0.8} />
        </mesh>
        <group ref={ringA}>
          {ORDER.map((id, i) => {
            const a = i * (Math.PI / 2) + 0.4;
            return (
              <group key={id} position={[Math.cos(a) * 2.75, Math.sin(a) * 2.75, 0]}>
                <mesh ref={el => { nodes.current[i] = el; }}>
                  <sphereGeometry args={[0.1, 24, 24]} />
                  <meshStandardMaterial color={PANEL_META[id].color} emissive={PANEL_META[id].color} emissiveIntensity={0.55} roughness={0.3} />
                </mesh>
                <sprite ref={el => { glows.current[i] = el; }} scale={0.65}>
                  <spriteMaterial map={glowTex[i]} transparent depthWrite={false} />
                </sprite>
              </group>
            );
          })}
        </group>
      </group>

      {/* ring B — crossing orbit for depth */}
      <group rotation={[Math.PI / 2 + 0.55, -0.65, 0.2]}>
        <mesh>
          <torusGeometry args={[2.35, 0.008, 8, 200]} />
          <meshBasicMaterial color="#8b6cf0" transparent opacity={0.45} />
        </mesh>
        <group ref={ringB}>
          {[0, 2.2].map(a => (
            <mesh key={a} position={[Math.cos(a) * 2.35, Math.sin(a) * 2.35, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color={a ? "#38bdf8" : "#d946ef"} />
            </mesh>
          ))}
        </group>
      </group>

      {/* leader lines */}
      {ORDER.map((id, i) => (
        <primitive key={id} object={leaderFor(leaderGeos[i], PANEL_META[id].color)} ref={(el: THREE.Line | null) => { leaders.current[i] = el; }} />
      ))}

      {/* service panels */}
      {ORDER.map((id, i) => (
        <mesh
          key={id}
          ref={el => { panels.current[i] = el; }}
          onPointerOver={over(id)}
          onPointerOut={out}
          onClick={e => { e.stopPropagation(); onSelect(id); }}
        >
          <planeGeometry args={[tex[id].width, tex[id].height]} />
          <meshBasicMaterial map={tex[id].tex} transparent depthWrite={false} depthTest={id === "funnels"} toneMapped={false} opacity={reduced ? 1 : 0} />
        </mesh>
      ))}
    </group>
  );
}

// one THREE.Line per leader (created once per geometry)
const leaderCache = new WeakMap<THREE.BufferGeometry, THREE.Line>();
function leaderFor(geo: THREE.BufferGeometry, color: string) {
  let l = leaderCache.get(geo);
  if (!l) {
    l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
    l.frustumCulled = false;
    leaderCache.set(geo, l);
  }
  return l;
}

export default function HeroScene(props: SceneProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // panel text is drawn into canvases, so wait for the brand fonts
  useEffect(() => { document.fonts.ready.then(() => setFontsReady(true)); }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      {fontsReady && (
        <Canvas
          frameloop={!visible ? "never" : props.reduced ? "demand" : "always"}
          dpr={[1, props.light ? 1.5 : 1.75]}
          camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => { gl.debug.checkShaderErrors = false; /* ANGLE prints harmless precision notes for the physical material */ }}
          onPointerMissed={() => props.onHover(null)}
          aria-hidden
        >
          <Env />
          <ambientLight intensity={0.5} />
          <directionalLight position={[-4, 6, 6]} intensity={1.6} />
          <pointLight position={[2.6, -2.2, 2.6]} intensity={55} color="#7c3aed" />
          <pointLight position={[-4, 2, -2]} intensity={14} color="#38bdf8" />
          <System {...props} />
          <Particles count={props.light ? 220 : 480} reduced={props.reduced} />
        </Canvas>
      )}
    </div>
  );
}
