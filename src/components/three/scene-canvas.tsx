"use client";

import { Suspense } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import { useDeviceTier } from "@/hooks/use-media";
import { useIsVisible } from "@/hooks/use-in-view-once";
import { cn } from "@/lib/utils";

/**
 * Shared WebGL wrapper:
 *  - caps device-pixel-ratio by device tier and lowers it further if FPS drops
 *  - pauses the render loop while the canvas is off-screen (frameloop="never")
 *  - exposes an accessible label since canvases are opaque to screen readers
 */
export function SceneCanvas({
  children,
  className,
  label,
  camera,
  ...props
}: Omit<CanvasProps, "children"> & { children: React.ReactNode; className?: string; label: string }) {
  const tier = useDeviceTier();
  const [ref, visible] = useIsVisible<HTMLDivElement>("100px");
  const maxDpr = tier === "high" ? 2 : tier === "mid" ? 1.5 : 1;
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <div ref={ref} className={cn("absolute inset-0", className)} role="img" aria-label={label}>
      <Canvas
        dpr={[1, Math.min(dpr, maxDpr)]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
        camera={camera ?? { position: [0, 0, 8], fov: 45 }}
        {...props}
      >
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} />
        <AdaptiveDpr pixelated={false} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
