"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type Lesson = { id: number; title: string; content: string; durationMinutes: number };

export function CourseContent({ lessons }: { lessons: Lesson[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); if (!query) return lessons; return lessons.filter((lesson) => `${lesson.title} ${lesson.content}`.toLowerCase().includes(query)); }, [lessons, search]);
  return <div><div className="relative mt-4 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm câu hỏi hoặc câu trả lời..." className="h-10 w-full rounded-lg border border-[#d7e2f1] pl-9 pr-3 text-sm outline-none focus:border-[#24618f]" /></div>{filtered.length ? <div className="mt-4 space-y-3">{filtered.map((lesson, index) => <article key={lesson.id} className="rounded-xl border border-[#e3eaf2] p-4"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4fb] text-sm font-semibold text-[#24618f]">{index + 1}</span><div className="min-w-0"><h3 className="font-semibold text-[#173554]">{lesson.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{lesson.content || "Chưa có câu trả lời."}</p></div></div></article>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-[#bdccda] px-5 py-10 text-center text-sm text-slate-500">Không tìm thấy nội dung phù hợp.</div>}</div>;
}
