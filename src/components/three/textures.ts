import * as THREE from "three";

type Token = [text: string, color: string];

const C = {
  kw: "#c792ea",
  fn: "#82aaff",
  str: "#c3e88d",
  var: "#f07178",
  plain: "#d4d4d8",
  com: "#5c6370",
  num: "#f78c6c",
  type: "#ffcb6b",
};

export const CODE_LINES: Token[][] = [
  [["// app/api/projects/route.ts", C.com]],
  [["import ", C.kw], ["{ createClient } ", C.plain], ["from ", C.kw], ['"@/lib/supabase"', C.str]],
  [],
  [["export async function ", C.kw], ["GET", C.fn], ["() {", C.plain]],
  [["  const ", C.kw], ["db ", C.var], ["= ", C.plain], ["await ", C.kw], ["createClient", C.fn], ["();", C.plain]],
  [["  const ", C.kw], ["{ data } ", C.var], ["= ", C.plain], ["await ", C.kw], ["db", C.var], [".from(", C.plain], ['"projects"', C.str], [")", C.plain]],
  [["    .", C.plain], ["select", C.fn], ["(", C.plain], ['"*"', C.str], [")", C.plain]],
  [["    .", C.plain], ["order", C.fn], ["(", C.plain], ['"order_index"', C.str], [");", C.plain]],
  [["  return ", C.kw], ["Response", C.type], [".", C.plain], ["json", C.fn], ["(data);", C.plain]],
  [["}", C.plain]],
  [],
  [["export const ", C.kw], ["revalidate ", C.var], ["= ", C.plain], ["3600", C.num], [";", C.plain]],
  [],
  [["// ship it 🚀", C.com]],
];

/** Code editor screen texture. `visibleChars` animates a typing effect. */
export function drawEditor(canvas: HTMLCanvasElement, visibleChars: number) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0d1226");
  bg.addColorStop(1, "#070a18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Window chrome
  ctx.fillStyle = "#11172f";
  ctx.fillRect(0, 0, w, 44);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(26 + i * 22, 22, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "500 18px ui-monospace, monospace";
  ctx.fillText("route.ts — portfolio", w / 2 - 100, 28);

  // Sidebar
  ctx.fillStyle = "#0a0e1f";
  ctx.fillRect(0, 44, 150, h - 44);
  ctx.font = "15px ui-monospace, monospace";
  ["app", "  api", "  (site)", "components", "  three", "lib", "supabase"].forEach((f, i) => {
    ctx.fillStyle = i === 1 ? "#818cf8" : "#71717a";
    ctx.fillText(f, 16, 80 + i * 26);
  });

  // Code
  ctx.font = "20px ui-monospace, monospace";
  let remaining = visibleChars;
  let cursorX = 0;
  let cursorY = 0;
  CODE_LINES.forEach((line, i) => {
    const y = 84 + i * 30;
    ctx.fillStyle = "#3f3f46";
    ctx.fillText(String(i + 1).padStart(2, " "), 166, y);
    let x = 206;
    for (const [text, color] of line) {
      if (remaining <= 0) break;
      const slice = text.slice(0, remaining);
      remaining -= slice.length;
      ctx.fillStyle = color;
      ctx.fillText(slice, x, y);
      x += ctx.measureText(slice).width;
      cursorX = x;
      cursorY = y;
    }
    if (remaining > 0) remaining -= 1; // newline
  });
  // Caret
  if (Math.floor(performance.now() / 500) % 2 === 0) {
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(cursorX + 2, cursorY - 18, 10, 24);
  }
}

export const TOTAL_CODE_CHARS = CODE_LINES.reduce((n, l) => n + l.reduce((m, [t]) => m + t.length, 0) + 1, 0);

const TERMINAL_LINES: [string, string][] = [
  ["harshit@portfolio:~$ ", "npm run build"],
  ["", "▲ Next.js 15 — creating optimized build"],
  ["", "✓ Compiled successfully"],
  ["", "✓ Generating static pages (24/24)"],
  ["harshit@portfolio:~$ ", "git push origin main"],
  ["", "→ Deploying to Vercel…"],
  ["", "✓ Production: ready in 38s"],
  ["harshit@portfolio:~$ ", ""],
];

export function drawTerminal(canvas: HTMLCanvasElement, lines: number) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  ctx.fillStyle = "rgba(5,8,22,0.92)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
  ctx.font = "20px ui-monospace, monospace";
  TERMINAL_LINES.slice(0, lines).forEach(([prompt, cmd], i) => {
    const y = 42 + i * 32;
    ctx.fillStyle = "#22d3ee";
    ctx.fillText(prompt, 18, y);
    const px = ctx.measureText(prompt).width;
    ctx.fillStyle = cmd.startsWith("✓") ? "#4ade80" : cmd.startsWith("→") || cmd.startsWith("▲") ? "#a5b4fc" : "#e4e4e7";
    ctx.fillText(cmd, 18 + px, y);
  });
}
export const TERMINAL_LINE_COUNT = TERMINAL_LINES.length;

/** Small pill label rendered to a texture (avoids fetching fonts for troika text). */
export function makeLabelTexture(text: string, color = "#ffffff", accent = "#6366F1") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = "600 44px ui-sans-serif, system-ui, sans-serif";
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + 72;
  canvas.width = width;
  canvas.height = 88;
  ctx.font = font;
  ctx.fillStyle = "rgba(10,14,32,0.85)";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  const r = 40;
  ctx.beginPath();
  ctx.roundRect(2, 2, width - 4, 84, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 36, 46);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { texture: tex, aspect: width / 88 };
}
