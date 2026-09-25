"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useUI } from "@/store/ui";
import { useDeviceTier } from "@/hooks/use-media";
import { SceneCanvas } from "./scene-canvas";
import { CurveLine, FlowParticles, Label3D, Starfield, bezier } from "./primitives";
import { TERMINAL_LINE_COUNT, TOTAL_CODE_CHARS, drawEditor, drawTerminal } from "./textures";

/* ------------------------------------------------------------------ */
/* Scene anchors — every object and connection is laid out from here. */
/* ------------------------------------------------------------------ */
const P = {
  laptop: [0, -0.4, 0] as [number, number, number],
  terminal: [-3.1, 0.9, -0.6] as [number, number, number],
  git: [3.2, 0.6, -0.8] as [number, number, number],
  db: [2.4, -1.6, 0.6] as [number, number, number],
  api: [-2.5, -1.5, 0.8] as [number, number, number],
  cloud: [0.4, 1.8, -1.8] as [number, number, number],
};

/** Camera keyframes blended by hero scroll progress (0 → 1). */
const CAMERA_KEYS = [
  { pos: new THREE.Vector3(0, 0.6, 8.2), look: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(-2.2, 1.6, 5.5), look: new THREE.Vector3(0.2, 0.1, 0) },
  { pos: new THREE.Vector3(1.8, 3.6, 6.5), look: new THREE.Vector3(0, -0.4, 0) },
];

function Laptop() {
  const screenCanvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(screenCanvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [screenCanvas]);
  const chars = useRef(0);
  const last = useRef(0);
  const lidRef = useRef<THREE.Group>(null);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }, dt) => {
    // Type the code, pause, loop. Redraw at ~20fps to keep the texture upload cheap.
    chars.current += dt * 38;
    if (chars.current > TOTAL_CODE_CHARS + 120) chars.current = 0;
    if (clock.elapsedTime - last.current > 0.05) {
      last.current = clock.elapsedTime;
      drawEditor(screenCanvas, Math.floor(chars.current));
      texture.needsUpdate = true;
    }
    // Lid opens on load.
    if (lidRef.current) lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, -0.18, 2.5, dt);
  });

  return (
    <group position={P.laptop} rotation={[0.18, -0.35, 0]}>
      {/* Base */}
      <RoundedBox args={[3.4, 0.12, 2.3]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1c1f2e" metalness={0.85} roughness={0.25} />
      </RoundedBox>
      {/* Keyboard well + trackpad */}
      <mesh position={[0, 0.062, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 1.05]} />
        <meshStandardMaterial color="#0c0e18" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.062, 0.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshStandardMaterial color="#232739" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Lid (hinged at back edge) */}
      <group ref={lidRef} position={[0, 0.06, -1.15]} rotation={[1.5, 0, 0]}>
        <RoundedBox args={[3.4, 2.2, 0.08]} radius={0.05} smoothness={4} position={[0, 1.1, -0.04]}>
          <meshStandardMaterial color="#1c1f2e" metalness={0.85} roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 1.1, 0.002]}>
          <planeGeometry args={[3.18, 1.98]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
      {/* Screen glow on the desk */}
      <pointLight position={[0, 1, 0.2]} intensity={2.5} distance={4} color="#6366F1" />
    </group>
  );
}

function TerminalPanel() {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 300;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);
  const shown = useRef(0);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, dt) => {
    const before = Math.floor(shown.current);
    shown.current = (shown.current + dt * 1.1) % (TERMINAL_LINE_COUNT + 3);
    const now = Math.floor(shown.current);
    if (now !== before) {
      drawTerminal(canvas, Math.min(now, TERMINAL_LINE_COUNT));
      texture.needsUpdate = true;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={P.terminal} rotation={[0, 0.45, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 1.03]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
        <Label3D text="terminal" position={[0, 0.72, 0]} height={0.2} accent="#06B6D4" />
      </group>
    </Float>
  );
}

function GitGraph() {
  const commits = useMemo(
    () => [
      { p: [0, 0.9, 0], c: "#6366F1" },
      { p: [0, 0.45, 0], c: "#6366F1" },
      { p: [0.45, 0.15, 0], c: "#22c55e" },
      { p: [0, 0, 0], c: "#6366F1" },
      { p: [0.45, -0.3, 0], c: "#22c55e" },
      { p: [0, -0.45, 0], c: "#8B5CF6" },
      { p: [0, -0.9, 0], c: "#8B5CF6" },
    ] as { p: [number, number, number]; c: string }[],
    [],
  );
  const branch = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.45, 0), new THREE.Vector3(0.45, 0.15, 0), new THREE.Vector3(0.45, -0.3, 0), new THREE.Vector3(0, -0.45, 0)]), []);
  const trunk = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(0, 0.9, 0), new THREE.Vector3(0, -0.9, 0)), []);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    group.current?.children.forEach((child, i) => {
      if ((child as THREE.Mesh).isMesh) child.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2 + i) * 0.12);
    });
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group position={P.git} rotation={[0, -0.4, 0]}>
        <group ref={group}>
          {commits.map((c, i) => (
            <mesh key={i} position={c.p}>
              <sphereGeometry args={[0.085, 20, 20]} />
              <meshStandardMaterial color={c.c} emissive={c.c} emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <CurveLine curve={trunk} color="#8B5CF6" opacity={0.7} />
        <CurveLine curve={branch} color="#22c55e" opacity={0.7} />
        <Label3D text="git commits" position={[0.1, 1.25, 0]} height={0.2} accent="#22c55e" />
      </group>
    </Float>
  );
}

function Database() {
  return (
    <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.7}>
      <group position={P.db}>
        {[0, 0.34, 0.68].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.26, 40]} />
            <meshStandardMaterial color="#0e7490" metalness={0.5} roughness={0.25} emissive="#06B6D4" emissiveIntensity={0.35} />
          </mesh>
        ))}
        <Label3D text="postgres" position={[0, 1.2, 0]} height={0.2} accent="#06B6D4" />
      </group>
    </Float>
  );
}

function ApiNode({ position, label }: { position: [number, number, number]; label: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.8;
      ref.current.rotation.x += dt * 0.3;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.9}>
      <group position={position}>
        <mesh ref={ref}>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.6} wireframe />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="#c4b5fd" emissive="#8B5CF6" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <Label3D text={label} position={[0, 0.75, 0]} height={0.2} accent="#8B5CF6" />
      </group>
    </Float>
  );
}

function Connections({ density }: { density: number }) {
  const curves = useMemo(
    () => [
      bezier(P.terminal, P.laptop, 0.6),
      bezier(P.laptop, P.git, 0.9),
      bezier(P.laptop, P.db, -0.4),
      bezier(P.api, P.laptop, 0.3),
      bezier(P.api, P.db, -1.2),
      bezier(P.git, P.cloud, 0.4),
      bezier(P.cloud, P.terminal, 0.5),
    ],
    [],
  );
  return (
    <>
      {curves.map((c, i) => (
        <CurveLine key={i} curve={c} color={i % 2 ? "#06B6D4" : "#6366F1"} opacity={0.18} />
      ))}
      <FlowParticles curves={curves} perCurve={density} color="#a5b4fc" size={0.055} speed={0.18} />
    </>
  );
}

/** Mouse parallax + scroll-driven camera path. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { camera, pointer, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const progress = useUI.getState().heroProgress;
    const seg = Math.min(progress * (CAMERA_KEYS.length - 1), CAMERA_KEYS.length - 1.0001);
    const i = Math.floor(seg);
    const t = seg - i;
    target.lerpVectors(CAMERA_KEYS[i].pos, CAMERA_KEYS[i + 1].pos, t);
    const lookTarget = CAMERA_KEYS[i].look.clone().lerp(CAMERA_KEYS[i + 1].look, t);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 3, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 3, dt);
    look.lerp(lookTarget, 1 - Math.exp(-3 * dt));
    camera.lookAt(look);

    if (group.current) {
      // Desktop: workspace sits to the right of the headline. Mobile: above it, smaller.
      const wide = size.width >= 768;
      const tx = wide ? Math.min(2, (size.width / size.height) * 1.05) : 0;
      const ty = wide ? 0.1 : 1.15;
      const ts = wide ? 0.86 : 0.6;
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, tx, 4, dt);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, ty, 4, dt);
      group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, ts, 4, dt));
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.35, 2.5, dt);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.15, 2.5, dt);
    }
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  const tier = useDeviceTier();
  return (
    <SceneCanvas label="Interactive 3D developer workspace: a laptop typing code, a terminal deploying, a git commit graph, a database and API nodes connected by flowing data particles." camera={{ position: [0, 0.6, 8.2], fov: 42 }}>
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 9, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#c7d2fe" />
      <pointLight position={[-5, -2, 3]} intensity={30} distance={14} color="#8B5CF6" />
      <pointLight position={[5, 2, -2]} intensity={30} distance={14} color="#06B6D4" />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 2, 1]} color="#6366F1" />
        <Lightformer intensity={1.5} position={[-5, 1, 2]} scale={[2, 6, 1]} color="#06B6D4" />
      </Environment>
      <Rig>
        <Laptop />
        <TerminalPanel />
        <GitGraph />
        <Database />
        <ApiNode position={P.api} label="REST / GraphQL" />
        <ApiNode position={P.cloud} label="edge · cloud" />
        <Connections density={tier === "low" ? 8 : tier === "mid" ? 16 : 28} />
      </Rig>
      <Starfield count={tier === "low" ? 400 : 1400} />
    </SceneCanvas>
  );
}
