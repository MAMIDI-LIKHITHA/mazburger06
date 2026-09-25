import { useEffect, useState } from "react";

type BurgerPart = {
  src: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  z: number;
  spread: number;
  rotate: number;
};

const parts: BurgerPart[] = [
  { src: "/images/burger-3d/maz-burger-bottom-bun.png", alt: "Нижняя булочка", x: 185, y: 1290, w: 650, z: 5, spread: 190, rotate: -2 },
  { src: "/images/burger-3d/maz-burger-patty.png", alt: "Говяжья котлета", x: 200, y: 1070, w: 625, z: 25, spread: 155, rotate: 1.5 },
  { src: "/images/burger-3d/maz-burger-cheese.png", alt: "Сыр", x: 190, y: 900, w: 645, z: 45, spread: 125, rotate: -1 },
  { src: "/images/burger-3d/maz-burger-onion.png", alt: "Красный лук", x: 220, y: 785, w: 580, z: 65, spread: 105, rotate: 2 },
  { src: "/images/burger-3d/maz-burger-tomato.png", alt: "Помидоры", x: 190, y: 640, w: 635, z: 85, spread: 90, rotate: -1.5 },
  { src: "/images/burger-3d/maz-burger-lettuce.png", alt: "Салат", x: 110, y: 435, w: 805, z: 105, spread: 72, rotate: 1 },
  { src: "/images/burger-3d/maz-burger-sauce.png", alt: "Соус", x: 210, y: 325, w: 605, z: 125, spread: 52, rotate: -1 },
  { src: "/images/burger-3d/maz-burger-top-bun.png", alt: "Верхняя булочка", x: 180, y: 25, w: 670, z: 150, spread: 30, rotate: 1.5 },
];

export function ThreeDBurger({ scrollY }: { scrollY: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 7;
      const y = (event.clientY / window.innerHeight - 0.5) * -5;
      setTilt({ x: y, y: x });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const progress = Math.min(Math.max(scrollY / 45, 0), 1);

  return (
    <div
      className="relative z-10 flex w-full max-w-[600px] items-center justify-center"
      style={{ perspective: "1600px" }}
    >
      <div
        className="relative w-[min(78vw,460px)]"
        style={{
          aspectRatio: "1024 / 1536",
          transformStyle: "preserve-3d",
          transform: `translateY(${-progress * 2}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 120ms ease-out",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
          aria-hidden="true"
        />

        {parts.map((part, index) => {
          const assembledX = (part.x / 1024) * 100;
          const assembledY = (part.y / 1536) * 100;
          const assembledW = (part.w / 1024) * 100;
          // Two-stage assembly:
          // 1) Vertical stacking first while the ingredients remain spread horizontally.
          // 2) Horizontal attachment second, pulling every layer into its final position.
          const verticalProgress = Math.min(progress / 0.5, 1);
          const horizontalProgress = Math.min(
            Math.max((progress - 0.5) / 0.5, 0),
            1
          );
          const direction = index % 2 === 0 ? 1 : -1;

          const spread =
            (1 - horizontalProgress) * part.spread * direction;

          const vertical =
            (1 - verticalProgress) * (-110 - index * 8);

          const rotation =
            part.rotate +
            (1 - horizontalProgress) * direction * 7;

          const depth =
            part.z + (1 - verticalProgress) * 100;

          return (
            <img
              key={part.src}
              src={part.src}
              alt={part.alt}
              className="pointer-events-none absolute block object-contain"
              style={{
                left: `${assembledX}%`,
                top: `${assembledY}%`,
                width: `${assembledW}%`,
                transform: `translate3d(${spread}px, ${vertical}px, ${depth}px) rotateZ(${rotation}deg)`,
                transformOrigin: "center center",
                zIndex: index + 2,
                filter: "drop-shadow(0 18px 16px rgba(0,0,0,0.28))",
                transition: "transform 35ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          );
        })}

        <div
          className="pointer-events-none absolute bottom-[2%] left-1/2 h-[5%] w-[55%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-2xl"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
