import { useEffect, useMemo, useState } from "react";

type Part = {
  name: string;
  y: number;
  z: number;
  color: string;
  width: string;
  height: string;
  radius: string;
  rotate?: number;
};

const parts: Part[] = [
  { name: "bottom bun", y: 0, z: 0, color: "#b96d2d", width: "250px", height: "42px", radius: "50% 50% 35% 35%" },
  { name: "patty", y: 42, z: 8, color: "#3d2117", width: "245px", height: "55px", radius: "46%" },
  { name: "cheese", y: 96, z: 12, color: "#ffc928", width: "270px", height: "20px", radius: "12px", rotate: -2 },
  { name: "lettuce", y: 120, z: 16, color: "#55a832", width: "265px", height: "25px", radius: "50%" },
  { name: "tomato", y: 148, z: 20, color: "#d62f22", width: "235px", height: "30px", radius: "48%" },
  { name: "onion", y: 181, z: 24, color: "#c89bd2", width: "215px", height: "18px", radius: "50%" },
  { name: "sauce", y: 202, z: 28, color: "#9c2419", width: "225px", height: "15px", radius: "50%" },
  { name: "top bun", y: 220, z: 34, color: "#d8944d", width: "255px", height: "112px", radius: "52% 52% 28% 28%" },
];

export function ThreeDBurger({ scrollY }: { scrollY: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * -8;
      setTilt({ x: y, y: x });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const progress = Math.min(Math.max(scrollY / 620, 0), 1);
  const assembled = parts.map((part, index) => {
    const start = index * 0.075;
    const local = Math.min(Math.max((progress - start) / 0.68, 0), 1);
    const eased = local * local * (3 - 2 * local);
    const spread = (index - 3.5) * 95;
    const rotate = (index % 2 ? 5 : -5) * (1 - eased);
    return { ...part, eased, spread, rotate };
  });

  const seeds = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    left: 15 + ((i * 37) % 70),
    top: 18 + ((i * 17) % 42),
    rotate: (i * 31) % 80 - 40,
  })), []);

  return (
    <div className="relative z-10 flex h-[390px] w-full max-w-[560px] items-center justify-center sm:h-[470px] md:h-[560px]" style={{ perspective: "1100px" }}>
      <div
        className="relative h-[330px] w-[310px] transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        aria-label="3D burger animation"
      >
        <div className="absolute -inset-16 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
        {assembled.map((part, index) => (
          <div
            key={part.name}
            className="absolute left-1/2 shadow-[0_18px_25px_rgba(0,0,0,0.25)]"
            style={{
              width: part.width,
              height: part.height,
              marginLeft: `calc(-${part.width} / 2)`,
              bottom: `${part.y + 28}px`,
              transformStyle: "preserve-3d",
              transform: `translate3d(${part.spread * (1 - part.eased)}px, ${part.spread * (1 - part.eased) * -0.16}px, ${part.z}px) rotateZ(${part.rotate + (part.rotate ?? 0)}deg) scale(${0.94 + part.eased * 0.06})`,
              background: part.color,
              borderRadius: part.radius,
              opacity: 0.25 + part.eased * 0.75,
              transition: "transform 80ms linear, opacity 80ms linear",
              boxShadow: `0 ${10 + index * 2}px ${20 + index * 3}px rgba(0,0,0,0.22), inset 0 5px 8px rgba(255,255,255,0.12)`,
              overflow: "hidden",
            }}
          >
            {part.name === "top bun" && seeds.map((seed) => (
              <span
                key={seed.left + "-" + seed.top}
                className="absolute h-2 w-5 rounded-full bg-[#f8e7b4]"
                style={{ left: `${seed.left}%`, top: `${seed.top}%`, transform: `rotate(${seed.rotate}deg)`, boxShadow: "0 1px 2px rgba(0,0,0,.18)" }}
              />
            ))}
            {part.name === "cheese" && <span className="absolute left-1/2 top-1/2 h-8 w-10 -translate-x-1/2 translate-y-2 rotate-12 rounded-b-xl bg-[#e7a914]" />}
            {part.name === "lettuce" && <span className="absolute inset-x-0 bottom-0 h-3 rounded-full bg-[#75bb43]" />}
            {part.name === "tomato" && <span className="absolute inset-x-5 top-2 h-3 rounded-full bg-[#ef4a39] opacity-80" />}
            {part.name === "patty" && <span className="absolute inset-x-5 top-3 h-3 rounded-full bg-[#65402a] opacity-70" />}
          </div>
        ))}
      </div>
    </div>
  );
}
