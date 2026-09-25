"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { ProjectWorld } from "@/types";
import { useDeviceTier } from "@/hooks/use-media";
import { SceneCanvas } from "./scene-canvas";
import { CurveLine, FlowParticles, Label3D, Starfield, bezier } from "./primitives";

/* ─────────────────────────── VisionCoach · AI brain network ─────────────────────────── */
function BrainNetwork({ accent }: { accent: string }) {
  const tier = useDeviceTier();
  const n = tier === "low" ? 60 : 140;
  const { nodes, curves } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    // Two hemispheres of an ellipsoid → reads as a brain silhouette.
    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      const side = i % 2 ? 1 : -1;
      nodes.push(new THREE.Vector3(side * (0.25 + Math.abs(Math.sin(v) * Math.cos(u)) * 1.6), Math.cos(v) * 1.5, Math.sin(v) * Math.sin(u) * 2));
    }
    const curves: THREE.Curve<THREE.Vector3>[] = [];
    nodes.forEach((a, i) => {
      const b = nodes[(i * 7 + 3) % n];
      if (a.distanceTo(b) < 2.2) curves.push(new THREE.LineCurve3(a, b));
    });
    return { nodes, curves: curves.slice(0, tier === "low" ? 40 : 110) };
  }, [n, tier]);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.15;
  });
  return (
    <group ref={group}>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i % 9 === 0 ? 0.07 : 0.035, 12, 12]} />
          <meshBasicMaterial color={i % 9 === 0 ? "#ffffff" : accent} toneMapped={false} />
        </mesh>
      ))}
      {curves.map((c, i) => (
        <CurveLine key={i} curve={c} color={accent} opacity={0.18} />
      ))}
      <FlowParticles curves={curves} perCurve={2} color="#e9d5ff" size={0.05} speed={0.5} />
      <Label3D text="Pose → Rules → LLM → Voice" position={[0, 2.3, 0]} height={0.28} accent={accent} />
    </group>
  );
}

/* ─────────────────────────── Skygaze India · space & astronomy ─────────────────────────── */
function Cosmos({ accent }: { accent: string }) {
  const planet = useRef<THREE.Mesh>(null);
  const iss = useRef<THREE.Group>(null);
  const constellation = useMemo(() => {
    const pts = [
      [-3.2, 1.8, -2], [-2.6, 2.3, -2], [-1.9, 2.0, -2], [-1.4, 2.5, -2], [-0.7, 2.2, -2], [-1.0, 1.5, -2], [-1.7, 1.3, -2],
    ].map((p) => new THREE.Vector3(...(p as [number, number, number])));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0);
  }, []);
  useFrame(({ clock }, dt) => {
    if (planet.current) planet.current.rotation.y += dt * 0.08;
    if (iss.current) {
      const a = clock.elapsedTime * 0.5;
      iss.current.position.set(Math.cos(a) * 2.4, Math.sin(a) * 0.8, Math.sin(a) * 2.4);
      iss.current.rotation.y = -a;
    }
  });
  return (
    <group>
      <mesh ref={planet}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color="#1e3a8a" emissive={accent} emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <group ref={iss}>
        <mesh>
          <boxGeometry args={[0.18, 0.08, 0.08]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.5]} />
          <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1} />
        </mesh>
      </group>
      <CurveLine curve={constellation} color="#ffffff" opacity={0.5} />
      {constellation.points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color="#fde68a" toneMapped={false} />
        </mesh>
      ))}
      <Label3D text="ISS pass · 19:42 IST" position={[0, 2.1, 0]} height={0.26} accent={accent} />
      <Starfield count={2500} radius={25} size={0.05} />
    </group>
  );
}

/* ─────────────────────────── KahaaniBot · interactive storybook ─────────────────────────── */
function Storybook({ accent }: { accent: string }) {
  const page = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (page.current) page.current.rotation.y = -((Math.sin(clock.elapsedTime * 0.8) + 1) / 2) * Math.PI;
  });
  const pageMat = <meshStandardMaterial color="#fdf6e3" roughness={0.9} side={THREE.DoubleSide} />;
  return (
    <group rotation={[-0.5, 0, 0]} position={[0, -0.3, 0]}>
      {/* cover */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[4.2, 0.08, 2.8]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.6} />
      </mesh>
      {/* left + right page stacks */}
      <mesh position={[-1.02, 0.02, 0]}>
        <boxGeometry args={[2, 0.1, 2.6]} />
        {pageMat}
      </mesh>
      <mesh position={[1.02, 0.02, 0]}>
        <boxGeometry args={[2, 0.1, 2.6]} />
        {pageMat}
      </mesh>
      {/* turning page (hinged at spine) */}
      <group ref={page} position={[0, 0.08, 0]}>
        <mesh position={[1, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 2.6]} />
          {pageMat}
        </mesh>
      </group>
      {/* story line "text" */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-1.05, 0.08, -0.9 + i * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5 - (i % 3) * 0.2, 0.06]} />
          <meshBasicMaterial color="#a8a29e" />
        </mesh>
      ))}
      <Float speed={2} floatIntensity={1.5}>
        <mesh position={[0.9, 1.4, 0]}>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <mesh position={[-1.2, 1.2, 0.4]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
        </mesh>
      </Float>
      <Sparkles count={80} scale={[5, 3, 4]} position={[0, 1.2, 0]} size={3} speed={0.4} color="#fde68a" />
      <Label3D text="Ek baar ki baat hai…" position={[0, 2.4, 0]} height={0.3} accent={accent} />
    </group>
  );
}

/* ─────────────────────────── Leave Management · corporate workflow ─────────────────────────── */
function Workflow({ accent }: { accent: string }) {
  const stages = useMemo(
    () => [
      { label: "Apply", pos: [-4.2, 0, 0], color: "#6366F1" },
      { label: "Manager", pos: [-1.4, 1, 0], color: "#8B5CF6" },
      { label: "HR", pos: [1.4, 1, 0], color: "#06B6D4" },
      { label: "Approved", pos: [4.2, 0, 0], color: accent },
      { label: "Ledger", pos: [0, -1.6, 0], color: "#f59e0b" },
    ] as { label: string; pos: [number, number, number]; color: string }[],
    [accent],
  );
  const curves = useMemo(
    () => [bezier(stages[0].pos, stages[1].pos, 0.5), bezier(stages[1].pos, stages[2].pos, 0.4), bezier(stages[2].pos, stages[3].pos, 0.5), bezier(stages[3].pos, stages[4].pos, -0.8), bezier(stages[4].pos, stages[0].pos, -0.8)],
    [stages],
  );
  const cubes = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    cubes.current?.children.forEach((c, i) => {
      c.rotation.y = clock.elapsedTime * 0.5 + i;
      c.rotation.x = Math.sin(clock.elapsedTime + i) * 0.2;
    });
  });
  return (
    <group>
      <group ref={cubes}>
        {stages.map((s) => (
          <mesh key={s.label} position={s.pos}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.5} metalness={0.4} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {stages.map((s) => (
        <Label3D key={s.label} text={s.label} position={[s.pos[0], s.pos[1] + 0.85, s.pos[2]]} height={0.24} accent={s.color} />
      ))}
      {curves.map((c, i) => (
        <CurveLine key={i} curve={c} color="#ffffff" opacity={0.2} />
      ))}
      <FlowParticles curves={curves} perCurve={6} color="#fde68a" size={0.12} speed={0.25} />
    </group>
  );
}

/* ─────────────────────────── Quyl · education ecosystem ─────────────────────────── */
function Ecosystem({ accent }: { accent: string }) {
  const satellites = useMemo(
    () =>
      ["Students", "Mentors", "Institutions", "Courses", "Assessments", "Analytics"].map((label, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2;
        return { label, pos: [Math.cos(a) * 3.2, Math.sin(a * 2) * 0.6, Math.sin(a) * 3.2] as [number, number, number] };
      }),
    [],
  );
  const curves = useMemo(() => satellites.flatMap((s, i) => [bezier([0, 0, 0], s.pos, 0.6), bezier(s.pos, satellites[(i + 1) % satellites.length].pos, 0.3)]), [satellites]);
  const hub = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (hub.current) hub.current.rotation.y += dt * 0.6;
    if (world.current) world.current.rotation.y += dt * 0.12;
  });
  return (
    <group ref={world}>
      <group ref={hub}>
        <mesh>
          <torusKnotGeometry args={[0.6, 0.18, 128, 16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
      <Label3D text="Quyl" position={[0, 1.3, 0]} height={0.34} accent={accent} />
      {satellites.map((s) => (
        <group key={s.label} position={s.pos}>
          <mesh>
            <dodecahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#1e1b4b" emissive="#6366F1" emissiveIntensity={0.6} flatShading />
          </mesh>
          <Label3D text={s.label} position={[0, 0.65, 0]} height={0.22} accent="#6366F1" />
        </group>
      ))}
      {curves.map((c, i) => (
        <CurveLine key={i} curve={c} color={i % 2 ? "#6366F1" : accent} opacity={0.2} />
      ))}
      <FlowParticles curves={curves} perCurve={5} color="#a5f3fc" size={0.06} speed={0.3} />
    </group>
  );
}

/** Gentle pointer-driven orbit around the scene origin. */
function PointerOrbit({ base }: { base: [number, number, number] }) {
  const { camera, pointer } = useThree();
  const origin = useMemo(() => new THREE.Vector3(...base), [base]);
  useFrame((_, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, origin.x + pointer.x * 1.2, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, origin.y + pointer.y * 0.6, 2, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const WORLDS: Record<ProjectWorld, { component: (p: { accent: string }) => React.JSX.Element; camera: [number, number, number]; label: string }> = {
  brain: { component: BrainNetwork, camera: [0, 0.3, 7.2], label: "An AI brain network: nodes and synapses with signals pulsing between them, representing VisionCoach's vision-to-voice pipeline." },
  cosmos: { component: Cosmos, camera: [0, 0.6, 7], label: "A glowing planet with the ISS orbiting and a constellation in the background, representing Skygaze India." },
  storybook: { component: Storybook, camera: [0, 2.4, 6.2], label: "An open storybook with a page turning and glowing sparkles, representing KahaaniBot." },
  workflow: { component: Workflow, camera: [0, 0.5, 8.5], label: "A leave request moving through Apply, Manager, HR, Approved and Ledger stages." },
  ecosystem: { component: Ecosystem, camera: [0, 2.5, 8], label: "The Quyl hub connected to students, mentors, institutions, courses, assessments and analytics." },
};

export default function ProjectWorldScene({ world, accent }: { world: ProjectWorld; accent: string }) {
  const { component: World, camera, label } = WORLDS[world];
  return (
    <SceneCanvas label={label} camera={{ position: camera, fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <pointLight position={[-4, 2, 3]} intensity={25} color={accent} />
      <World accent={accent} />
      <PointerOrbit base={camera} />
    </SceneCanvas>
  );
}
