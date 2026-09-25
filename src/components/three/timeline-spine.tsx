"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { SceneCanvas } from "./scene-canvas";
import { Starfield } from "./primitives";

const SPACING = 3;

/** Glowing helix spine that the camera descends as the timeline scrolls. */
function Spine({ count, progress }: { count: number; progress: MotionValue<number> }) {
  const length = (count - 1) * SPACING;
  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = count * 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = -t * length;
      pts.push(new THREE.Vector3(Math.sin(t * Math.PI * count) * 0.6, y, Math.cos(t * Math.PI * count) * 0.6));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [count, length]);
  const nodes = useRef<THREE.Group>(null);
  const tubularSegments = count * 48;
  const radialSegments = 8;
  // A brighter copy of the spine whose draw range grows with scroll — progress follows the helix.
  const progressGeo = useMemo(() => new THREE.TubeGeometry(curve, tubularSegments, 0.04, radialSegments, false), [curve, tubularSegments]);
  useEffect(() => () => progressGeo.dispose(), [progressGeo]);

  useFrame(({ camera }, dt) => {
    const p = progress.get();
    const y = -p * length;
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y + 0.4, 5, dt);
    camera.position.x = Math.sin(p * Math.PI) * 1.2;
    camera.lookAt(0, camera.position.y - 0.4, 0);
    nodes.current?.children.forEach((child, i) => {
      const reached = p * (count - 1) >= i - 0.3;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, reached ? 2.4 : 0.2, 6, dt);
      const s = THREE.MathUtils.damp(child.scale.x, Math.abs(p * (count - 1) - i) < 0.5 ? 1.6 : 1, 6, dt);
      child.scale.setScalar(s);
    });
    // TubeGeometry indices run segment by segment along the path: 6 indices per quad.
    progressGeo.setDrawRange(0, Math.floor(p * tubularSegments) * radialSegments * 6);
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, tubularSegments, 0.025, radialSegments, false]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.35} />
      </mesh>
      <mesh geometry={progressGeo}>
        <meshBasicMaterial color="#06B6D4" toneMapped={false} />
      </mesh>
      <group ref={nodes}>
        {Array.from({ length: count }, (_, i) => {
          const t = i / Math.max(1, count - 1);
          const p = curve.getPointAt(t);
          return (
            <mesh key={i} position={p}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.2} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export default function TimelineSpine({ count, progress }: { count: number; progress: MotionValue<number> }) {
  return (
    <SceneCanvas label="A glowing helix timeline that lights up each career milestone as you scroll." camera={{ position: [0, 0.4, 6], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 0, 3]} intensity={20} color="#06B6D4" />
      <Spine count={count} progress={progress} />
      <Starfield count={600} radius={20} size={0.03} />
    </SceneCanvas>
  );
}
