"use client";

import { useEffect, useState } from "react";

export function OrgPeopleCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const duration = 850;
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <strong>{count}</strong>;
}
