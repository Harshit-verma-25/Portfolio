"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeLabelTexture } from "./textures";

/** Billboarded text label backed by a canvas texture. */
export function Label3D({ text, position, height = 0.28, accent, color }: { text: string; position: [number, number, number]; height?: number; accent?: string; color?: string }) {
  const { texture, aspect } = useMemo(() => makeLabelTexture(text, color, accent), [text, color, accent]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

/**
 * Glowing particles travelling along a set of curves — the "data flowing between systems"
 * motif used across scenes. One Points object, one draw call.
 */
export function FlowParticles({ curves, perCurve = 24, color = "#8B5CF6", size = 0.06, speed = 0.12 }: { curves: THREE.Curve<THREE.Vector3>[]; perCurve?: number; color?: string; size?: number; speed?: number }) {
  const count = curves.length * perCurve;
  const ref = useRef<THREE.Points>(null);
  const offsets = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [count]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    for (let i = 0; i < count; i++) {
      offsets[i] = (offsets[i] + dt * speed * (0.6 + (i % 5) * 0.12)) % 1;
      curves[Math.floor(i / perCurve)].getPointAt(offsets[i], tmp);
      positions.set([tmp.x, tmp.y, tmp.z], i * 3);
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/** Static line rendering of a curve (the "cable" particles travel along). */
export function CurveLine({ curve, color = "#6366F1", opacity = 0.25 }: { curve: THREE.Curve<THREE.Vector3>; color?: string; opacity?: number }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  }, [curve, color, opacity]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  return <primitive object={line} />;
}

/** Soft starfield / dust backdrop. */
export function Starfield({ count = 1200, radius = 30, color = "#ffffff", size = 0.035 }: { count?: number; radius?: number; color?: string; size?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.35 + Math.random() * 0.65);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);
    }
    return arr;
  }, [count, radius]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

export const bezier = (a: [number, number, number], b: [number, number, number], lift = 1) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  mid.y += lift;
  return new THREE.QuadraticBezierCurve3(va, mid, vb);
};
