"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellRing, BookOpen, Clock3, FileWarning, Settings2, Trash2 } from "lucide-react";
import { ACTIVITY_EVENTS_KEY, ACTIVITY_FEED_KEY, type ActivityEvent, type ActivityTone } from "@/lib/activity-events";

type ActivityItem = ActivityEvent;
type SnapshotItem = { id: string; signature: string; detail: string };
type Snapshot = Record<string, SnapshotItem>;
type StoredActivity = ActivityItem & { timestamp: number };

const initialActivity: ActivityItem[] = [
  { id: "empty-complaints", label: "Chưa có hoạt động mới", detail: "Hệ thống sẽ cập nhật khi có thay đổi", time: "Đang theo dõi", tone: "coral", href: "/complaints", kind: "updated" },
];

function formatTime(value: Date) {
  return value.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function eventLabel(action: ActivityItem["kind"], area: string) {
  if (action === "created") return `${area} mới được tạo`;
  if (action === "deleted") return `${area} đã bị xóa`;
  return `${area} vừa được cập nhật`;
}

function iconFor(item: ActivityItem) {
  if (item.kind === "deleted") return Trash2;
  if (item.href === "/learning") return BookOpen;
  if (item.href === "/technical-reports") return Settings2;
  if (item.kind === "updated") return BellRing;
  return FileWarning;
}

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>(initialActivity);
  const previous = useRef<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    const savedFeed = (): ActivityItem[] => {
      try { return JSON.parse(localStorage.getItem(ACTIVITY_FEED_KEY) || "[]") as ActivityItem[]; } catch { return []; }
    };
    const saveFeed = (next: ActivityItem[]) => {
      try { localStorage.setItem(ACTIVITY_FEED_KEY, JSON.stringify(next.slice(0, 5))); } catch { /* best effort */ }
    };
    const mergeFeed = (incoming: ActivityItem[]) => {
      if (!incoming.length) return;
      setItems((current) => {
        const existing = current.filter((item) => !item.id.startsWith("empty-"));
        const next = [...incoming, ...existing].slice(0, 5);
        saveFeed(next);
        return next;
      });
    };
    const pendingEvents = (): ActivityItem[] => {
      try {
        const stored = JSON.parse(localStorage.getItem(ACTIVITY_EVENTS_KEY) || "[]") as StoredActivity[];
        localStorage.removeItem(ACTIVITY_EVENTS_KEY);
        return stored.slice(-5).map(({ timestamp: _timestamp, ...item }) => item);
      } catch {
        return [];
      }
    };
    async function poll() {
      const [complaintsResponse, technicalResponse, coursesResponse] = await Promise.allSettled([
        fetch("/api/complaints?page=1&pageSize=100", { cache: "no-store" }),
        fetch("/api/technical-reports?page=1&pageSize=100", { cache: "no-store" }),
        fetch("/api/courses", { cache: "no-store" }),
      ]);
      if (cancelled) return;
      const snapshot: Snapshot = {};
      const responses = [
        { result: complaintsResponse, prefix: "complaint", area: "Báo cáo khiếu nại", href: "/complaints" as const, tone: "coral" as const, detail: (row: any) => `${row.project || "Không có dự án"} · ${row.bookingCode || "Không có booking"}` },
        { result: technicalResponse, prefix: "technical", area: "Báo cáo lỗi kĩ thuật", href: "/technical-reports" as const, tone: "blue" as const, detail: (row: any) => `${row.project || "Không có dự án"} · ${row.errorDescription || "Không có mô tả"}` },
        { result: coursesResponse, prefix: "course", area: "Khóa học E-learning", href: "/learning" as const, tone: "mint" as const, detail: (row: any) => row.title || "Course" },
      ];
      for (const source of responses) {
        if (source.result.status !== "fulfilled" || !source.result.value.ok) continue;
        const payload = await source.result.value.json();
        const rows = Array.isArray(payload) ? payload : payload.rows || [];
        for (const row of rows) snapshot[`${source.prefix}:${row.id}`] = { id: `${row.id}`, signature: `${row.updatedAt || row.createdAt || ""}:${row.status || ""}`, detail: source.detail(row) };
      }
      const old = previous.current;
      previous.current = snapshot;
      const stored = pendingEvents();
      if (!old) {
        mergeFeed(stored.reverse());
        return;
      }
      const now = formatTime(new Date());
      const changes: ActivityItem[] = [];
      for (const source of responses) {
        for (const [key, current] of Object.entries(snapshot)) {
          if (!key.startsWith(`${source.prefix}:`)) continue;
          const before = old[key];
          const action = !before ? "created" : before.signature !== current.signature ? "updated" : null;
          if (action) changes.push({ id: `${key}:${action}:${current.signature}`, label: eventLabel(action, source.area), detail: current.detail, time: now, tone: source.tone, href: source.href, kind: action });
        }
        for (const key of Object.keys(old)) {
          if (key.startsWith(`${source.prefix}:`) && !snapshot[key]) changes.push({ id: `${key}:deleted:${now}`, label: eventLabel("deleted", source.area), detail: old[key].detail, time: now, tone: source.tone, href: source.href, kind: "deleted" });
        }
      }
      const nextChanges = [...stored, ...changes.reverse()];
      mergeFeed(nextChanges);
    }
    const persisted = savedFeed();
    if (persisted.length) setItems(persisted);
    void poll();
    const interval = window.setInterval(() => void poll(), 5000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  return <div className="mt-6 space-y-3">{items.map((item) => { const Icon = iconFor(item); return <Link href={item.href} key={item.id} className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-[#e1ebf2] hover:bg-[#f8fbfd]"><span className={`overview-activity-icon overview-activity-${item.tone}`}><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#24415e]">{item.label}</p><p className="mt-0.5 truncate text-xs text-slate-400">{item.detail} · {item.time}</p></div><Clock3 className="h-4 w-4 text-slate-300" /></Link>; })}</div>;
}
