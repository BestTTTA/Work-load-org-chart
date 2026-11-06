"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Opens a chart wider than the screen on its centre, so the root node is visible. */
export function CenteredScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
    }
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-x-auto rounded-lg border border-line bg-surface"
    >
      {children}
    </div>
  );
}
