import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#050816", color: "white", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -200, left: -150, width: 700, height: 700, borderRadius: 9999, background: "radial-gradient(circle, rgba(99,102,241,0.55), transparent 65%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -250, right: -100, width: 700, height: 700, borderRadius: 9999, background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent 65%)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 9999, background: "linear-gradient(135deg,#6366F1,#8B5CF6,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>HV</div>
          <div style={{ fontSize: 26, color: "#A1A1AA", display: "flex" }}>harshitverma.dev</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 110, fontWeight: 700, letterSpacing: -5, lineHeight: 1, display: "flex" }}>Harshit Verma</div>
          <div style={{ fontSize: 44, marginTop: 20, display: "flex", backgroundImage: "linear-gradient(90deg,#818CF8,#A78BFA,#22D3EE)", backgroundClip: "text", color: "transparent" }}>Full Stack Software Developer</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#D4D4D8" }}>
          {["Next.js", "TypeScript", "Supabase", "AI"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
