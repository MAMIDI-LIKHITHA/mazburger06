import { useEffect, useRef } from "react";
import * as THREE from "three";

type Layer = {
  mesh: THREE.Object3D;
  targetY: number;
  explodedY: number;
  targetRotZ?: number;
};

function createMaterial(color: number, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function makeBun(radius: number, height: number, color: number, top = false) {
  const geometry = top
    ? new THREE.SphereGeometry(radius, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.58)
    : new THREE.SphereGeometry(radius, 64, 32);
  const mesh = new THREE.Mesh(geometry, createMaterial(color, 0.68));
  mesh.scale.y = top ? height / radius : height / radius;
  return mesh;
}

function makeLettuce() {
  const group = new THREE.Group();
  const material = createMaterial(0x55a832, 0.9);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 10), material);
    leaf.scale.set(1.7, 0.22, 0.72);
    leaf.position.set(Math.cos(a) * 1.38, 0, Math.sin(a) * 1.38);
    leaf.rotation.y = -a;
    group.add(leaf);
  }
  return group;
}

function makeTomatoes() {
  const group = new THREE.Group();
  const material = createMaterial(0xd62f22, 0.7);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.25;
    const slice = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 32), material);
    slice.position.set(Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2);
    slice.rotation.x = Math.PI / 2;
    group.add(slice);
  }
  return group;
}

function makeOnion() {
  const group = new THREE.Group();
  const material = createMaterial(0xc89bd2, 0.62);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.075, 12, 24), material);
    ring.position.set(Math.cos(a) * 1.15, 0.03, Math.sin(a) * 1.15);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }
  return group;
}

function makeCheese() {
  const geometry = new THREE.BoxGeometry(3.15, 0.1, 3.15, 1, 1, 1);
  const mesh = new THREE.Mesh(geometry, createMaterial(0xffc928, 0.62));
  mesh.rotation.y = Math.PI / 4;
  return mesh;
}

function makePatty() {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 64, 24),
    createMaterial(0x422316, 0.95),
  );
  mesh.scale.y = 0.25;
  return mesh;
}

function makeSauce() {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.58, 1.58, 0.08, 64),
    createMaterial(0x9c2419, 0.62),
  );
  return mesh;
}

function addSesameSeeds(bun: THREE.Object3D) {
  const seedMaterial = createMaterial(0xf8e7b4, 0.58);
  const seeds = new THREE.Group();
  const positions = [
    [-0.9, 0.42, 0.25], [-0.35, 0.56, 0.85], [0.25, 0.58, 0.55],
    [0.75, 0.43, 0.25], [-0.75, 0.5, -0.45], [-0.15, 0.61, -0.8],
    [0.48, 0.52, -0.5], [0.9, 0.35, -0.1], [0, 0.66, 0],
  ];
  for (const [x, y, z] of positions) {
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), seedMaterial);
    seed.scale.set(1.8, 0.45, 0.75);
    seed.position.set(x, y, z);
    seed.rotation.z = x * 1.7;
    seeds.add(seed);
  }
  bun.add(seeds);
}

function buildBurger() {
  const group = new THREE.Group();
  const layers: Layer[] = [];

  const add = (mesh: THREE.Object3D, targetY: number, explodedY: number, targetRotZ = 0) => {
    mesh.position.y = explodedY;
    mesh.rotation.z = targetRotZ;
    group.add(mesh);
    layers.push({ mesh, targetY, explodedY, targetRotZ });
  };

  const bottom = makeBun(1.85, 0.42, 0xc47b35);
  add(bottom, -1.58, -5.4);

  add(makePatty(), -1.16, -4.25);
  add(makeCheese(), -0.72, -3.05);
  add(makeLettuce(), -0.43, -1.9);
  add(makeTomatoes(), -0.1, -0.8);
  add(makeOnion(), 0.18, 1.0);
  add(makeSauce(), 0.43, 2.15);

  const top = makeBun(1.92, 1.05, 0xd8944d, true);
  addSesameSeeds(top);
  add(top, 1.0, 4.6);

  return { group, layers };
}

export function ThreeDBurger({ scrollY }: { scrollY: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollY);

  useEffect(() => {
    scrollRef.current = scrollY;
  }, [scrollY]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.15, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xfff3dd, 0x21140e, 2.2);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff1d2, 4.5);
    key.position.set(4, 7, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xff6a00, 2.4);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    const { group, layers } = buildBurger();
    group.scale.setScalar(1.03);
    scene.add(group);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.05;
    floor.position.z = 0.25;
    scene.add(floor);

    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      targetPointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetPointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    host.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      const progress = THREE.MathUtils.clamp(scrollRef.current / 620, 0, 1);

      pointer.x += (targetPointer.x - pointer.x) * 0.06;
      pointer.y += (targetPointer.y - pointer.y) * 0.06;

      layers.forEach((layer, i) => {
        const start = i * 0.075;
        const local = THREE.MathUtils.clamp((progress - start) / 0.68, 0, 1);
        const eased = local * local * (3 - 2 * local);
        const wobble = Math.sin(t * 1.2 + i * 0.65) * 0.018 * eased;
        layer.mesh.position.y = THREE.MathUtils.lerp(layer.explodedY, layer.targetY, eased) + wobble;
        layer.mesh.rotation.z = THREE.MathUtils.lerp(
          i % 2 === 0 ? -0.07 : 0.06,
          layer.targetRotZ ?? 0,
          eased,
        );
        layer.mesh.rotation.x = pointer.y * 0.035 * eased;
      });

      group.rotation.y += ((pointer.x * 0.22) - group.rotation.y) * 0.04;
      group.rotation.x += ((-pointer.y * 0.08) - group.rotation.x) * 0.04;
      group.position.y = Math.sin(t * 0.9) * 0.035;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative z-10 h-[390px] w-full max-w-[560px] sm:h-[470px] md:h-[560px]"
      aria-label="3D burger animation"
    />
  );
}
