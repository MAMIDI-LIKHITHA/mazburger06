import { useEffect, useState } from "react";

export function ThreeDBurger({ scrollY }: { scrollY: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = (event.clientY / window.innerHeight - 0.5) * -6;
      setTilt({ x: y, y: x });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const progress = Math.min(Math.max(scrollY / 700, 0), 1);
  const scale = 1 + progress * 0.08;
  const lift = progress * -18;

  return (
    <div
      className="relative z-10 flex h-[390px] w-full max-w-[600px] items-center justify-center sm:h-[470px] md:h-[560px]"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-full max-w-[560px] transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateY(${lift}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${scale})`,
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
          aria-hidden="true"
        />

        <img
          src="/images/maz-burger-hero.png"
          alt="MAZ BURGER"
          className="relative z-10 mx-auto block w-full max-w-[560px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.38)]"
          style={{
            transform: "translateZ(35px)",
            transformStyle: "preserve-3d",
          }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div
          className="pointer-events-none absolute bottom-[8%] left-1/2 z-0 h-10 w-[62%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-2xl"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
