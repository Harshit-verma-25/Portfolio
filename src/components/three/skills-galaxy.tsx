"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useUI } from "@/store/ui";
import { useDeviceTier } from "@/hooks/use-media";
import { SceneCanvas } from "./scene-canvas";
import { Label3D, Starfield } from "./primitives";

export interface GalaxyPlanet {
  id: string;
  name: string;
  color: string;
  skills: string[];
}

const ORBITS = [3.2, 4.6, 6.0, 7.4, 8.8, 10.2];

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.5) * 0.03);
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshStandardMaterial color="#eef2ff" emissive="#c7d2fe" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color="#a5b4fc" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <pointLight intensity={80} distance={30} color="#a5b4fc" />
      <Label3D text="Harshit.core" position={[0, 1.9, 0]} height={0.32} accent="#6366F1" />
    </group>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.01, radius + 0.01, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Planet({ planet, radius, index, total }: { planet: GalaxyPlanet; radius: number; index: number; total: number }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const moons = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const active = useUI((s) => s.activePlanet === planet.id);
  const setActivePlanet = useUI((s) => s.setActivePlanet);
  const setCursor = useUI((s) => s.setCursor);
  const speed = 0.12 / (1 + index * 0.35);
  const phase = (index / total) * Math.PI * 2;

  useFrame(({ clock }, dt) => {
    const paused = useUI.getState().activePlanet !== null;
    if (group.current && !paused) {
      const a = phase + clock.elapsedTime * speed;
      group.current.position.set(Math.cos(a) * radius, Math.sin(a * 2) * 0.3, Math.sin(a) * radius);
    }
    if (body.current) {
      body.current.rotation.y += dt * 0.4;
      const s = THREE.MathUtils.damp(body.current.scale.x, hovered || active ? 1.25 : 1, 6, dt);
      body.current.scale.setScalar(s);
    }
    if (moons.current) moons.current.rotation.y += dt * 0.6;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActivePlanet(active ? null : planet.id);
  };

  return (
    <group ref={group} name={`planet-${planet.id}`}>
      <mesh
        ref={body}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setCursor("view", "Explore");
        }}
        onPointerOut={() => {
          setHovered(false);
          setCursor("default");
        }}
      >
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={hovered || active ? 0.9 : 0.35} roughness={0.35} metalness={0.3} />
      </mesh>
      {/* atmosphere */}
      <mesh scale={1.22}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshBasicMaterial color={planet.color} transparent opacity={0.12} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* ring */}
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.95, 0.012, 8, 96]} />
        <meshBasicMaterial color={planet.color} transparent opacity={0.6} />
      </mesh>
      {/* skill moons */}
      <group ref={moons}>
        {planet.skills.slice(0, 6).map((s, i, arr) => {
          const a = (i / arr.length) * Math.PI * 2;
          return (
            <mesh key={s} position={[Math.cos(a) * 1.25, Math.sin(a * 3) * 0.15, Math.sin(a) * 1.25]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          );
        })}
      </group>
      <Label3D text={planet.name} position={[0, 1.15, 0]} height={0.3} accent={planet.color} />
    </group>
  );
}

/** Flies the camera toward the selected planet, back out when cleared. */
function CameraDirector() {
  const { camera, scene, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const outward = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const id = useUI.getState().activePlanet;
    const obj = id ? scene.getObjectByName(`planet-${id}`) : null;
    if (obj) {
      // Frame the planet from outside its orbit, slightly above and to the side, so the sun
      // sits behind-left instead of between camera and planet.
      obj.getWorldPosition(lookTarget);
      outward.copy(lookTarget).setY(0).normalize();
      const side = new THREE.Vector3(-outward.z, 0, outward.x);
      target.copy(lookTarget).addScaledVector(outward, 3.8).addScaledVector(side, 1.8).setY(lookTarget.y + 3.6);
    } else {
      lookTarget.set(0, 0, 0);
      target.set(pointer.x * 2, 7 + pointer.y * 1.5, 15);
    }
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 2.5, dt);
    look.lerp(lookTarget, 1 - Math.exp(-4 * dt));
    camera.lookAt(look);
  });
  return null;
}

export default function SkillsGalaxy({ planets }: { planets: GalaxyPlanet[] }) {
  const tier = useDeviceTier();
  const setActivePlanet = useUI((s) => s.setActivePlanet);
  return (
    <SceneCanvas
      label={`3D skills galaxy with ${planets.length} planets: ${planets.map((p) => p.name).join(", ")}. Use the planet buttons to explore each skill area.`}
      camera={{ position: [0, 7, 15], fov: 45 }}
      onPointerMissed={() => setActivePlanet(null)}
    >
      <ambientLight intensity={0.25} />
      <Sun />
      {planets.map((p, i) => (
        <group key={p.id}>
          <OrbitRing radius={ORBITS[i % ORBITS.length]} />
          <Planet planet={p} radius={ORBITS[i % ORBITS.length]} index={i} total={planets.length} />
        </group>
      ))}
      <Sparkles count={tier === "low" ? 40 : 120} scale={[24, 6, 24]} size={2} speed={0.3} color="#a5b4fc" />
      <Starfield count={tier === "low" ? 500 : 1600} radius={40} />
      <CameraDirector />
    </SceneCanvas>
  );
}
