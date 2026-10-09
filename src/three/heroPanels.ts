import * as THREE from "three";

/* ------------------------------------------------------------------
   Canvas-drawn UI panels for the hero scene — one per service.
   Illustrative only: generic labels, no metrics or client data.
   Drawn at 2× for crispness; each includes its own soft shadow.
   ------------------------------------------------------------------ */

export type PanelId = "web" | "crm" | "ai" | "funnels";

export const PANEL_META: Record<PanelId, { label: string; section: string; color: string }> = {
  web: { label: "Web Development", section: "expertise", color: "#6d3ce6" },
  crm: { label: "CRM & GoHighLevel", section: "crm", color: "#0f6fb8" },
  ai: { label: "AI & Automation", section: "automation", color: "#b5279e" },
  funnels: { label: "Funnels", section: "funnel", color: "#0b7c74" },
};

const PAD = 30; // shadow margin (logical px)
export const PX_PER_UNIT = 200;

const INK = "#17151f", INK2 = "#4a4758", INK3 = "#8a8796", LINE = "rgba(23,21,31,0.08)", MIST = "#f4f3f8";
const MONO = "'JetBrains Mono Variable', ui-monospace, monospace";
const SANS = "'Plus Jakarta Sans Variable', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque Variable', 'Plus Jakarta Sans Variable', system-ui, sans-serif";

type G = CanvasRenderingContext2D;

function rr(g: G, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) {
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); }
}
const bar = (g: G, x: number, y: number, w: number, h: number, c: string) => rr(g, x, y, w, h, h / 2, c);
const text = (g: G, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") => {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y);
};

/** White card with shadow, header dot + title and a mono tag. Returns the content origin. */
function card(g: G, w: number, h: number, title: string, tag: string, color: string) {
  g.save();
  g.shadowColor = "rgba(48,27,120,0.20)"; g.shadowBlur = 28; g.shadowOffsetY = 12;
  rr(g, PAD, PAD, w, h, 18, "#ffffff");
  g.restore();
  rr(g, PAD, PAD, w, h, 18, undefined, LINE);
  g.beginPath(); g.arc(PAD + 24, PAD + 26, 5, 0, Math.PI * 2); g.fillStyle = color; g.fill();
  text(g, title, PAD + 38, PAD + 26, `700 17px ${DISPLAY}`, INK);
  g.font = `600 10.5px ${MONO}`;
  const tw = g.measureText(tag).width + 16;
  rr(g, PAD + w - tw - 16, PAD + 15, tw, 22, 11, MIST);
  text(g, tag, PAD + w - tw / 2 - 16, PAD + 26.5, `600 10.5px ${MONO}`, INK3, "center");
  g.fillStyle = LINE; g.fillRect(PAD + 1, PAD + 50, w - 2, 1);
  return { x: PAD + 18, y: PAD + 64, w: w - 36, h: h - 82 };
}

function webPanel(g: G, w: number, h: number, color: string) {
  const c = card(g, w, h, "Landing page", "WEB", color);
  // browser chrome
  rr(g, c.x, c.y, c.w, c.h, 12, MIST);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { g.beginPath(); g.arc(c.x + 16 + i * 13, c.y + 15, 4, 0, Math.PI * 2); g.fillStyle = col; g.fill(); });
  rr(g, c.x + 70, c.y + 7, c.w - 140, 16, 8, "#fff");
  text(g, "your-business.com", c.x + c.w / 2, c.y + 15.5, `500 9.5px ${MONO}`, INK3, "center");
  const px = c.x + 12, py = c.y + 34, pw = c.w - 24;
  rr(g, px, py, pw, c.h - 46, 10, "#fff");
  // nav
  bar(g, px + 14, py + 14, 40, 7, color);
  [0, 1, 2].forEach(i => bar(g, px + pw - 120 + i * 30, py + 14, 22, 6, "#e4e2ea"));
  // hero copy
  bar(g, px + 14, py + 38, pw * 0.42, 11, INK);
  bar(g, px + 14, py + 55, pw * 0.32, 11, INK);
  bar(g, px + 14, py + 75, pw * 0.4, 6, "#d9d7e0");
  bar(g, px + 14, py + 86, pw * 0.3, 6, "#d9d7e0");
  rr(g, px + 14, py + 102, 92, 24, 12, color);
  text(g, "Book a call", px + 60, py + 114.5, `700 10.5px ${SANS}`, "#fff", "center");
  // hero image
  const ix = px + pw * 0.55, iw = pw * 0.41;
  const grd = g.createLinearGradient(ix, py + 34, ix + iw, py + 128);
  grd.addColorStop(0, "#8b5cf6"); grd.addColorStop(0.6, "#b5279e"); grd.addColorStop(1, "#0f6fb8");
  rr(g, ix, py + 34, iw, 92, 10, undefined); g.fillStyle = grd; g.fill();
  rr(g, ix + 12, py + 92, iw * 0.55, 22, 7, "rgba(255,255,255,0.88)");
  bar(g, ix + 20, py + 100, iw * 0.3, 6, "#c4b5fd");
  // feature row
  const fy = py + 142, fw = (pw - 28 - 16) / 3;
  if (fy + 34 < c.y + c.h - 4) [0, 1, 2].forEach(i => { rr(g, px + 14 + i * (fw + 8), fy, fw, 34, 8, MIST); bar(g, px + 24 + i * (fw + 8), fy + 12, fw * 0.5, 6, "#d9d7e0"); });
}

function crmPanel(g: G, w: number, h: number, color: string) {
  const c = card(g, w, h, "Lead pipeline", "GHL", color);
  const cols = [
    { t: "New lead", col: "#8b5cf6", n: 3 },
    { t: "Contacted", col: "#0f6fb8", n: 2 },
    { t: "Booked", col: "#0b7c74", n: 2 },
    { t: "Won", col: "#a8550a", n: 1 },
  ];
  const gap = 10, cw = (c.w - gap * 3) / 4;
  cols.forEach((k, i) => {
    const x = c.x + i * (cw + gap);
    text(g, k.t, x + 2, c.y + 6, `600 11px ${SANS}`, INK2);
    for (let j = 0; j < k.n; j++) {
      const y = c.y + 22 + j * 52;
      if (y + 44 > c.y + c.h) break;
      rr(g, x, y, cw, 44, 9, MIST);
      bar(g, x + 9, y + 11, cw * 0.38, 5, k.col);
      bar(g, x + 9, y + 23, cw * 0.72, 5, "#d6d4dd");
      bar(g, x + 9, y + 33, cw * 0.5, 5, "#e4e2ea");
    }
  });
  // a card mid-move, lifted, to suggest the pipeline in motion
  const mx = c.x + (cw + gap) * 1 + cw * 0.55, my = c.y + c.h - 42;
  g.save(); g.shadowColor = "rgba(48,27,120,0.25)"; g.shadowBlur = 16; g.shadowOffsetY = 6;
  rr(g, mx, my, cw, 40, 9, "#fff"); g.restore();
  rr(g, mx, my, cw, 40, 9, undefined, "rgba(15,111,184,0.45)");
  bar(g, mx + 9, my + 11, cw * 0.38, 5, "#0b7c74");
  bar(g, mx + 9, my + 23, cw * 0.66, 5, "#d6d4dd");
}

function aiPanel(g: G, w: number, h: number, color: string) {
  const c = card(g, w, h, "AI workflow", "AI", color);
  const steps = [
    { t: "New lead", col: "#6d3ce6" },
    { t: "AI reply", col: "#b5279e" },
    { t: "Follow-up", col: "#0f6fb8" },
    { t: "Booked", col: "#0b7c74" },
  ];
  const sw = (c.w - 3 * 18) / 4;
  steps.forEach((s, i) => {
    const x = c.x + i * (sw + 18), y = c.y + 2;
    rr(g, x, y, sw, 40, 10, i === 1 ? "#fbeefa" : MIST, i === 1 ? "rgba(181,39,158,0.35)" : undefined);
    g.beginPath(); g.arc(x + 14, y + 20, 5, 0, Math.PI * 2); g.fillStyle = s.col; g.fill();
    text(g, s.t, x + 24, y + 20.5, `600 10.5px ${SANS}`, INK);
    if (i < 3) {
      g.strokeStyle = "rgba(109,60,230,0.45)"; g.lineWidth = 1.6; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(x + sw + 3, y + 20); g.lineTo(x + sw + 15, y + 20); g.stroke(); g.setLineDash([]);
    }
  });
  // chat
  const cy = c.y + 58;
  rr(g, c.x, cy, c.w * 0.66, 30, 12, MIST);
  text(g, "Hi — any time free this week?", c.x + 12, cy + 15.5, `500 11px ${SANS}`, INK2);
  const bx = c.x + c.w * 0.26, bw = c.w * 0.74;
  const grd = g.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, "#6d3ce6"); grd.addColorStop(1, "#b5279e");
  rr(g, bx, cy + 38, bw, 30, 12); g.fillStyle = grd; g.fill();
  text(g, "Yes! Thursday or Friday — which suits?", bx + 12, cy + 53.5, `600 11px ${SANS}`, "#fff");
  text(g, "AI ASSISTANT · INSTANT REPLY", bx + bw, cy + 82, `600 9px ${MONO}`, INK3, "right");
}

function funnelPanel(g: G, w: number, h: number, color: string) {
  const c = card(g, w, h, "Funnel", "FUNNEL", color);
  const stages = ["Visit", "Opt-in", "Booked call", "Customer"];
  const cols = ["#ece7fd", "#d9cdfb", "#b9a3f6", "#6d3ce6"];
  const rowH = (c.h - 6) / 4;
  stages.forEach((s, i) => {
    const wTop = c.w * (1 - i * 0.17), wBot = c.w * (1 - (i + 1) * 0.17);
    const y = c.y + i * rowH, cx = c.x + c.w / 2;
    g.beginPath();
    g.moveTo(cx - wTop / 2, y); g.lineTo(cx + wTop / 2, y); g.lineTo(cx + wBot / 2, y + rowH - 4); g.lineTo(cx - wBot / 2, y + rowH - 4); g.closePath();
    g.fillStyle = cols[i]; g.fill();
    text(g, s, cx, y + rowH / 2 - 1, `700 11px ${SANS}`, i === 3 ? "#fff" : INK, "center");
  });
}

const DRAW: Record<PanelId, { w: number; h: number; fn: (g: G, w: number, h: number, color: string) => void }> = {
  web: { w: 420, h: 290, fn: webPanel },
  crm: { w: 470, h: 280, fn: crmPanel },
  ai: { w: 440, h: 230, fn: aiPanel },
  funnels: { w: 330, h: 250, fn: funnelPanel },
};

export function makePanel(id: PanelId, { blur = 0 } = {}) {
  const d = DRAW[id];
  const W = d.w + PAD * 2, H = d.h + PAD * 2, s = 2;
  const c = document.createElement("canvas");
  c.width = W * s; c.height = H * s;
  const g = c.getContext("2d")!;
  g.scale(s, s);
  if (blur) {
    // cheap depth-of-field for the deepest panel: draw sharp offscreen, then blur onto the texture
    const tmp = document.createElement("canvas"); tmp.width = c.width; tmp.height = c.height;
    const tg = tmp.getContext("2d")!; tg.scale(s, s); d.fn(tg, d.w, d.h, PANEL_META[id].color);
    g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${blur * s}px)`; g.drawImage(tmp, 0, 0);
  } else d.fn(g, d.w, d.h, PANEL_META[id].color);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, width: W / PX_PER_UNIT, height: H / PX_PER_UNIT };
}

/** Soft radial glow sprite. */
export function glowTexture(color = "#8b5cf6") {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, color + "cc"); grd.addColorStop(0.35, color + "55"); grd.addColorStop(1, color + "00");
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
