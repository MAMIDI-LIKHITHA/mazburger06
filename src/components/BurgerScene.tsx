import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Float } from "@react-three/drei";
import * as THREE from "three";

// ---- Procedural layered burger -------------------------------------------
// Each layer knows its stacked height (y) and how far it flies when exploded.

type LayerDef = {
  id: string;
  y: number; // stacked position
  explodeY: number; // extra lift when exploded
  fan: number; // sideways fan direction (-1..1)
  spin: number; // idle spin offset when exploded
};

const LAYERS: LayerDef[] = [
  { id: "bottomBun", y: 0.0, explodeY: -0.55, fan: 0.4, spin: 0.3 },
  { id: "patty", y: 0.22, explodeY: -0.1, fan: -0.6, spin: -0.5 },
  { id: "cheese", y: 0.34, explodeY: 0.28, fan: 0.7, spin: 0.8 },
  { id: "tomato", y: 0.42, explodeY: 0.62, fan: -0.5, spin: -0.9 },
  { id: "lettuce", y: 0.5, explodeY: 0.95, fan: 0.6, spin: 1.1 },
  { id: "topBun", y: 0.72, explodeY: 1.45, fan: -0.3, spin: -0.7 },
];

const SEEDS = Array.from({ length: 14 }, (_, i) => {
  const a = i * 2.399963; // golden angle
  const r = 0.12 + (i % 4) * 0.09;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, rot: a };
});

function BurgerLayers({ progress }: { progress: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const layerRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const p = progress.current;
    const explode = 1 - p;
    LAYERS.forEach((l, i) => {
      const g = layerRefs.current[i];
      if (!g) return;
      const targetY = l.y + l.explodeY * explode;
      const targetX = l.fan * explode * 0.55;
      const targetZ = -Math.abs(l.fan) * explode * 0.2;
      g.position.x += (targetX - g.position.x) * (1 - Math.exp(-6 * dt));
      g.position.y += (targetY - g.position.y) * (1 - Math.exp(-6 * dt));
      g.position.z += (targetZ - g.position.z) * (1 - Math.exp(-6 * dt));
      const targetRot = l.spin * explode * 0.6;
      g.rotation.y += (targetRot - g.rotation.y) * (1 - Math.exp(-6 * dt));
      g.rotation.z += (l.fan * explode * 0.15 - g.rotation.z) * (1 - Math.exp(-6 * dt));
    });
  });

  return (
    <group ref={group} position={[0, -0.55, 0]}>
      {/* Bottom bun */}
      <group ref={(el) => (layerRefs.current[0] = el)}>
        <mesh castShadow receiveShadow position={[0, 0.06, 0]} scale={[1, 0.42, 1]}>
          <sphereGeometry args={[0.62, 32, 24]} />
          <meshStandardMaterial color="#d9903b" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
          <meshStandardMaterial color="#e8b06a" roughness={0.7} />
        </mesh>
      </group>

      {/* Patty */}
      <group ref={(el) => (layerRefs.current[1] = el)}>
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.64, 0.6, 0.18, 32]} />
          <meshStandardMaterial color="#4a2c17" roughness={0.95} />
        </mesh>
      </group>

      {/* Cheese — rotated square slice with drippy corners */}
      <group ref={(el) => (layerRefs.current[2] = el)}>
        <mesh castShadow position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.95, 0.045, 0.95]} />
          <meshStandardMaterial color="#f4b62e" roughness={0.35} />
        </mesh>
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.62, -0.06, Math.sin(a) * 0.62]}>
              <sphereGeometry args={[0.06, 12, 10]} />
              <meshStandardMaterial color="#f4b62e" roughness={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* Tomato */}
      <group ref={(el) => (layerRefs.current[3] = el)}>
        <mesh castShadow position={[-0.18, 0, 0.1]}>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 24]} />
          <meshStandardMaterial color="#c0392b" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0.22, 0, -0.12]}>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 24]} />
          <meshStandardMaterial color="#d1463a" roughness={0.4} />
        </mesh>
      </group>

      {/* Lettuce — bumpy green ruffle */}
      <group ref={(el) => (layerRefs.current[4] = el)}>
        <mesh castShadow position={[0, 0, 0]} scale={[1, 0.16, 1]}>
          <sphereGeometry args={[0.68, 32, 16]} />
          <meshStandardMaterial color="#7cb342" roughness={0.6} />
        </mesh>
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6]} scale={[1, 0.5, 1]}>
              <sphereGeometry args={[0.14, 12, 10]} />
              <meshStandardMaterial color="#8bc34a" roughness={0.6} />
            </mesh>
          );
        })}
      </group>

      {/* Top bun with sesame seeds */}
      <group ref={(el) => (layerRefs.current[5] = el)}>
        <mesh castShadow position={[0, 0, 0]} scale={[1, 0.62, 1]}>
          <sphereGeometry args={[0.64, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e3a551" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.005, 0]}>
          <cylinderGeometry args={[0.64, 0.64, 0.03, 32]} />
          <meshStandardMaterial color="#d9903b" roughness={0.6} />
        </mesh>
        {SEEDS.map((s, i) => (
          <mesh
            key={i}
            position={[s.x, 0.64 * Math.sqrt(Math.max(0, 1 - (s.x * s.x + s.z * s.z) / 0.41)) * 0.62 + 0.01, s.z]}
            rotation={[0.3, s.rot, 0.2]}
            scale={[1, 0.5, 0.7]}
          >
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshStandardMaterial color="#f7e6c4" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Scene({ scrollY, assembled }: { scrollY: number; assembled: boolean }) {
  const root = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const rot = useRef({ x: 0.15, y: -0.4 });
  const drag = useRef<{ active: boolean; x: number; y: number; rx: number; ry: number }>({
    active: false,
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
  });

  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const scrollProgress = Math.min(Math.max(scrollY / 45, 0), 1);
    const target = Math.max(scrollProgress, assembled ? 1 : 0);
    progress.current += (target - progress.current) * (1 - Math.exp(-5 * dt));

    if (root.current) {
      const t = clock.getElapsedTime();
      const sway = reduceMotion || drag.current.active ? 0 : Math.sin(t * 0.6) * 0.08;
      root.current.rotation.y += (rot.current.y + sway - root.current.rotation.y) * (1 - Math.exp(-8 * dt));
      root.current.rotation.x += (rot.current.x - root.current.rotation.x) * (1 - Math.exp(-8 * dt));
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-4, 3, -2]} intensity={0.8} color="#ffb066" angle={0.6} penumbra={1} />

      <group ref={root}>
        <Float speed={reduceMotion ? 0 : 1.6} rotationIntensity={0} floatIntensity={reduceMotion ? 0 : 0.35}>
          <BurgerLayers progress={progress} />
        </Float>
      </group>

      <ContactShadows position={[0, -1.15, 0]} opacity={0.45} scale={6} blur={2.6} far={2.4} color="#1a0d05" />

      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffb066" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        <Lightformer intensity={0.8} color="#fff2e0" position={[5, 2, 2]} rotation-y={-Math.PI / 2} scale={[12, 2, 1]} />
      </Environment>
    </>
  );
}

export default function BurgerScene({ scrollY }: { scrollY: number }) {
  const [assembled, setAssembled] = useState(false);
  const dragInfo = useRef({ x: 0, y: 0, moved: 0, active: false });
  const rotRef = useRef({ x: 0.15, y: -0.4 });

  // Expose drag rotation to the scene through a shared ref on the canvas wrapper.
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragInfo.current = { x: e.clientX, y: e.clientY, moved: 0, active: true };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current.active) return;
    const dx = e.clientX - dragInfo.current.x;
    const dy = e.clientY - dragInfo.current.y;
    dragInfo.current.moved = Math.max(dragInfo.current.moved, Math.hypot(dx, dy));
    rotRef.current = {
      x: Math.max(-0.7, Math.min(0.9, rotRef.current.x + dy * 0.004)),
      y: rotRef.current.y + dx * 0.008,
    };
    window.dispatchEvent(new CustomEvent("maz-burger-rot", { detail: rotRef.current }));
  };
  const onPointerUp = () => {
    if (dragInfo.current.moved < 6) setAssembled((a) => !a);
    dragInfo.current.active = false;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Поверните бургер, нажмите чтобы собрать"
      className="flex h-full w-full cursor-grab flex-col items-center outline-none active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (dragInfo.current.active = false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setAssembled((a) => !a);
        }
      }}
    >
      <div className="w-full flex-1">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0.7, 3.4], fov: 38 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent", pointerEvents: "none" }}
        >
          <SceneWithDrag scrollY={scrollY} assembled={assembled} rotRef={rotRef} />
        </Canvas>
      </div>
      <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        Вращайте · нажмите, чтобы {assembled ? "разобрать" : "собрать"}
      </p>
    </div>
  );
}

// Bridges the DOM drag ref into the R3F scene.
function SceneWithDrag({
  scrollY,
  assembled,
  rotRef,
}: {
  scrollY: number;
  assembled: boolean;
  rotRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return <SceneInner scrollY={scrollY} assembled={assembled} rotRef={rotRef} />;
}

function SceneInner({
  scrollY,
  assembled,
  rotRef,
}: {
  scrollY: number;
  assembled: boolean;
  rotRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const root = useRef<THREE.Group>(null);
  const progress = useRef(0);

  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const scrollProgress = Math.min(Math.max(scrollY / 45, 0), 1);
    const target = Math.max(scrollProgress, assembled ? 1 : 0);
    progress.current += (target - progress.current) * (1 - Math.exp(-5 * dt));

    if (root.current) {
      const t = clock.getElapsedTime();
      const sway = reduceMotion ? 0 : Math.sin(t * 0.6) * 0.08;
      root.current.rotation.y += (rotRef.current.y + sway - root.current.rotation.y) * (1 - Math.exp(-8 * dt));
      root.current.rotation.x += (rotRef.current.x - root.current.rotation.x) * (1 - Math.exp(-8 * dt));
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-4, 3, -2]} intensity={0.8} color="#ffb066" angle={0.6} penumbra={1} />

      <group ref={root}>
        <Float speed={reduceMotion ? 0 : 1.6} rotationIntensity={0} floatIntensity={reduceMotion ? 0 : 0.35}>
          <BurgerLayers progress={progress} />
        </Float>
      </group>

      <ContactShadows position={[0, -1.15, 0]} opacity={0.45} scale={6} blur={2.6} far={2.4} color="#1a0d05" />

      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffb066" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        <Lightformer intensity={0.8} color="#fff2e0" position={[5, 2, 2]} rotation-y={-Math.PI / 2} scale={[12, 2, 1]} />
      </Environment>
    </>
  );
}
