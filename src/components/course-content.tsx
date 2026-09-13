"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type Lesson = { id: number; title: string; content: string; durationMinutes: number; programName?: string; agentSteps?: string; escalationGuidance?: string; trainingNotes?: string; questionLevel?: string };

export function CourseContent({ lessons }: { lessons: Lesson[] }) {
  const programs = Array.from(new Set(lessons.map((lesson) => lesson.programName || "Chưa phân loại")));
  const [program, setProgram] = useState(programs[0] || "");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return lessons.filter((lesson) => (lesson.programName || "Chưa phân loại") === program && (!query || `${lesson.title} ${lesson.content} ${lesson.agentSteps} ${lesson.escalationGuidance} ${lesson.trainingNotes}`.toLowerCase().includes(query))); }, [lessons, program, search]);
  return <div><label className="mt-4 block max-w-md text-sm font-medium text-slate-600">Chương trình đặc quyền<select value={program} onChange={(event) => setProgram(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm">{programs.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="relative mt-4 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm câu hỏi hoặc câu trả lời..." className="h-10 w-full rounded-lg border border-[#d7e2f1] pl-9 pr-3 text-sm outline-none focus:border-[#24618f]" /></div>{filtered.length ? <div className="mt-4 space-y-3">{filtered.map((lesson, index) => <article key={lesson.id} className="rounded-xl border border-[#e3eaf2] p-4"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4fb] text-sm font-semibold text-[#24618f]">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-[#173554]">{lesson.title}</h3>{lesson.questionLevel ? <span className="rounded-full bg-[#fff5e2] px-2 py-1 text-xs font-medium text-[#a66f27]">{lesson.questionLevel}</span> : null}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{lesson.content || "Chưa có câu trả lời."}</p><div className="mt-4 grid gap-3 text-sm md:grid-cols-2"><Info label="Các bước Agent" value={lesson.agentSteps} /><Info label="Khi nào báo Team Leader/Manager" value={lesson.escalationGuidance} /><Info label="Ghi chú đào tạo" value={lesson.trainingNotes} /></div></div></div></article>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-[#bdccda] px-5 py-10 text-center text-sm text-slate-500">Không tìm thấy nội dung phù hợp.</div>}</div>;
}

function Info({ label, value }: { label: string; value?: string }) {
  const tone = label.startsWith("Các bước Agent")
    ? "bg-[#eaf4fb] border border-[#cfe5f5]"
    : label.startsWith("Khi nào báo")
      ? "bg-[#fff0ec] border border-[#f5d4cc]"
      : "bg-[#eaf8f1] border border-[#cdebdc]";
  return <div className={`rounded-lg p-3 ${tone}`}><p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-1 whitespace-pre-wrap leading-5 text-slate-700">{value || "Chưa có nội dung"}</p></div>;
}
