"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export function CoursesCountMetric() {
  const [count, setCount] = useState<number | null>(null);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/courses", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((courses) => setCount(Array.isArray(courses) ? courses.length : 0))
      .catch(() => setCount(0));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (count === null) return;
    const startedAt = performance.now();
    const duration = 850;
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setAnimatedCount(Math.round(count * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return (
    <Link href="/learning" className="overview-metric block rounded-2xl border border-[#e0e8ef] bg-white p-4 shadow-[0_12px_30px_rgba(26,62,95,.08)] transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between"><span className="overview-metric-icon overview-metric-mint"><BookOpen /></span><span className="text-xs font-bold text-[#3d9b78]">Đang mở</span></div>
      <p className="mt-4 text-xs text-slate-500">Bài học nội bộ</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#173554]">{count === null ? "—" : animatedCount}</p>
    </Link>
  );
}
