import { Suspense, lazy, useEffect, useState } from "react";

// The real 3D scene is client-only (WebGL); load it after mount.
const BurgerScene = lazy(() => import("./BurgerScene"));

export function ThreeDBurger({ scrollY }: { scrollY: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative z-10 flex w-full max-w-[600px] select-none flex-col items-center justify-center">
      <div className="relative aspect-square w-[min(78vw,460px)]">
        {mounted ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-40 w-40 animate-pulse rounded-full bg-primary/15 blur-2xl" />
              </div>
            }
          >
            <BurgerScene scrollY={scrollY} />
          </Suspense>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}
