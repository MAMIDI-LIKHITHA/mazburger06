import { useEffect, useRef, useState } from "react";

type BurgerPart = {
  src: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  z: number;
  spread: number;
  rotate: number;
  finalY: number;
};

const parts: BurgerPart[] = [
  { src: "/images/burger-3d/maz-burger-bottom-bun.png", alt: "Нижняя булочка", x: 185, y: 1290, w: 650, z: 5, spread: 190, rotate: -2, finalY: 930 },
  { src: "/images/burger-3d/maz-burger-patty.png", alt: "Говяжья котлета", x: 200, y: 1070, w: 625, z: 25, spread: 155, rotate: 1.5, finalY: 790 },
  { src: "/images/burger-3d/maz-burger-cheese.png", alt: "Сыр", x: 190, y: 900, w: 645, z: 45, spread: 125, rotate: -1, finalY: 720 },
  { src: "/images/burger-3d/maz-burger-onion.png", alt: "Красный лук", x: 220, y: 785, w: 580, z: 65, spread: 105, rotate: 2, finalY: 655 },
  { src: "/images/burger-3d/maz-burger-tomato.png", alt: "Помидоры", x: 190, y: 640, w: 635, z: 85, spread: 90, rotate: -1.5, finalY: 585 },
  { src: "/images/burger-3d/maz-burger-lettuce.png", alt: "Салат", x: 110, y: 435, w: 805, z: 105, spread: 72, rotate: 1, finalY: 490 },
  { src: "/images/burger-3d/maz-burger-sauce.png", alt: "Соус", x: 210, y: 325, w: 605, z: 125, spread: 52, rotate: -1, finalY: 410 },
  { src: "/images/burger-3d/maz-burger-top-bun.png", alt: "Верхняя булочка", x: 180, y: 25, w: 670, z: 150, spread: 30, rotate: 1.5, finalY: 300 },
];

export function ThreeDBurger({ scrollY }: { scrollY: number }) {
  // Rotation controlled by drag/touch; idle gently sways.
  const [rot, setRot] = useState({ x: -8, y: -18 });
  const [dragging, setDragging] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [tapProgress, setTapProgress] = useState(0);
  const drag = useRef({ x: 0, y: 0, rx: 0, ry: 0, moved: 0 });
  const raf = useRef<number | null>(null);

  // Animate tap-driven assembly progress toward target.
  useEffect(() => {
    const target = assembled ? 1 : 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      let done = false;
      setTapProgress((p) => {
        const next = p + (target - p) * (1 - Math.exp(-5 * dt));
        if (Math.abs(target - next) < 0.002) {
          done = true;
          return target;
        }
        return next;
      });
      if (!done) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [assembled]);

  // Idle sway when not dragging.
  useEffect(() => {
    if (dragging) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let id = 0;
    const t0 = performance.now();
    const base = { ...rot };
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      setRot({ x: base.x + Math.sin(t * 0.8) * 2, y: base.y + Math.sin(t * 0.5) * 6 });
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y, moved: 0 };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.moved = Math.max(drag.current.moved, Math.hypot(dx, dy));
    setRot({
      x: Math.max(-35, Math.min(35, drag.current.rx - dy * 0.35)),
      y: drag.current.ry + dx * 0.5,
    });
  };
  const onUp = () => {
    if (drag.current.moved < 6) setAssembled((a) => !a);
    setDragging(false);
  };

  const scrollProgress = Math.min(Math.max(scrollY / 45, 0), 1);
  const progress = Math.max(scrollProgress, tapProgress);

  return (
    <div
      className="relative z-10 flex w-full max-w-[600px] select-none flex-col items-center justify-center"
      style={{ perspective: "1400px" }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Поверните бургер, нажмите чтобы собрать"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAssembled((a) => !a);
          }
        }}
        className={`relative w-[min(78vw,460px)] touch-none outline-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          aspectRatio: "1024 / 1536",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: dragging ? "none" : "transform 80ms linear",
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
          style={{ transform: "translate(-50%,-50%) translateZ(-120px)" }}
          aria-hidden="true"
        />

        {parts.map((part, index) => {
          const verticalProgress = Math.min(progress / 0.5, 1);
          const assembledX = (part.x / 1024) * 100;
          const startY = (part.y / 1536) * 100;
          const finalY = (part.finalY / 1536) * 100;
          const assembledY = startY + (finalY - startY) * verticalProgress;
          const assembledW = (part.w / 1024) * 100;
          const horizontalProgress = Math.min(Math.max((progress - 0.5) / 0.3, 0), 1);
          const direction = index % 2 === 0 ? 1 : -1;
          const horizontalEase = 1 - Math.pow(horizontalProgress, 1.8);
          const spread = horizontalEase * part.spread * direction;
          const rotation = part.rotate + horizontalEase * direction * 7;
          // Real 3D separation: exploded layers fan out in depth, then compress.
          const explode = 1 - progress;
          const depth = (index - 3.5) * (8 + explode * 45);
          const tiltX = explode * direction * 18;

          return (
            <img
              key={part.src}
              src={part.src}
              alt={part.alt}
              draggable={false}
              className="pointer-events-none absolute block object-contain"
              style={{
                left: `${assembledX}%`,
                top: `${assembledY}%`,
                width: `${assembledW}%`,
                transform: `translate3d(${spread}px, 0, ${depth}px) rotateX(${tiltX}deg) rotateZ(${rotation}deg)`,
                transformOrigin: "center center",
                zIndex: index + 2,
                filter: "drop-shadow(0 18px 16px rgba(0,0,0,0.28))",
              }}
            />
          );
        })}

        <div
          className="pointer-events-none absolute bottom-[2%] left-1/2 h-[5%] w-[55%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-2xl"
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
        Вращайте · нажмите, чтобы {assembled ? "разобрать" : "собрать"}
      </p>
    </div>
  );
}
