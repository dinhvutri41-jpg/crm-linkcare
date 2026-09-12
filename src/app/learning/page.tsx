"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { BookOpen, Clock3, GraduationCap, Plus, Trash2, X } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  coverColor: string;
};
const covers: Record<string, string> = {
  blue: "from-[#2f80b7] to-[#163f68]",
  teal: "from-[#259f98] to-[#14605e]",
  gold: "from-[#d89a38] to-[#8d581d]",
};
const projects = ["BIDV", "Vietcombank", "Vietinbank", "Techcombank", "UOB", "TechcomLife"];

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Đào tạo nội bộ",
    level: "Cơ bản",
    coverColor: "blue",
  });
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/courses", { cache: "no-store" });
    if (response.ok) setCourses(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, questions }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Không thể tạo khóa học.");
      return;
    }
    setOpen(false);
    setForm({
      title: "",
      description: "",
      category: "Đào tạo nội bộ",
      level: "Cơ bản",
      coverColor: "blue",
    });
    setQuestions([{ question: "", answer: "" }]);
    await load();
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8">
        <div className="learning-hero relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="learning-rocket-scroll-layer" aria-hidden="true">
            <img src="/rocket.svg" alt="" className="learning-rocket-scroll-logo" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#4a91c3]">
              Learning workspace
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-[#173554]">
              E-learning
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Xây dựng kiến thức nội bộ và theo dõi hành trình học tập.
            </p>
          </div>
          <Link
            href="/learning/courses/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#24618f] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Tạo khóa học
          </Link>
        </div>
        <div className="mb-7 grid gap-4 md:grid-cols-3">
          <Stat icon={<BookOpen />} label="Khóa học" value={courses.length} />
          <Stat
            icon={<GraduationCap />}
            label="Danh mục"
            value={new Set(courses.map((course) => course.category)).size}
          />
          <Stat
            icon={<Clock3 />}
            label="Trạng thái"
            value={
              courses.some((course) => course.status === "published")
                ? "Đang mở"
                : "Đang chuẩn bị"
            }
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d7e2f1] border-t-[#24618f]" />
          </div>
        ) : courses.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/learning/courses/${course.id}`}
                className="group overflow-hidden rounded-2xl border border-[#e3eaf2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`flex h-36 items-end bg-gradient-to-br p-5 ${covers[course.coverColor] || covers.blue}`}
                >
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                    {course.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#173554] group-hover:text-[#24618f]">
                      {course.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {course.level}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {course.description || "Chưa có mô tả khóa học."}
                  </p>
                  <p className="mt-4 text-xs font-medium text-[#24618f]">
                    Mở khóa học →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#bdccda] bg-white px-6 py-20 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-[#4a91c3]" />
            <h3 className="mt-4 text-xl font-semibold text-[#173554]">
              Chưa có khóa học
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Tạo khóa học đầu tiên để bắt đầu thư viện đào tạo nội bộ.
            </p>
            <Link
              href="/learning/courses/new"
              className="mt-5 rounded-xl bg-[#24618f] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Tạo khóa học đầu tiên
            </Link>
          </div>
        )}
        {open ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <form
              onSubmit={create}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#4a91c3]">
                    Course setup
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[#173554]">
                    Tạo khóa học
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Tên khóa học
                  </span>
                  <select
                    required
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    className="h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                  ><option value="">Chọn dự án / tên khóa học</option>{projects.map((project) => <option key={project} value={project}>{project}</option>)}</select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Mô tả
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    className="min-h-24 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="h-10 rounded-lg border border-[#d7e2f1] px-3 text-sm"
                    placeholder="Danh mục"
                  />
                  <select
                    value={form.level}
                    onChange={(event) =>
                      setForm({ ...form, level: event.target.value })
                    }
                    className="h-10 rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                  >
                    <option>Cơ bản</option>
                    <option>Trung cấp</option>
                    <option>Nâng cao</option>
                  </select>
                  <select
                    value={form.coverColor}
                    onChange={(event) =>
                      setForm({ ...form, coverColor: event.target.value })
                    }
                    className="h-10 rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                  >
                    <option value="blue">Xanh</option>
                    <option value="teal">Teal</option>
                    <option value="gold">Vàng</option>
                  </select>
                </div>
                <div className="rounded-xl border border-[#e3eaf2] bg-[#f8fbfd] p-4"><div className="flex items-center justify-between"><div><h4 className="font-semibold text-[#173554]">Câu hỏi và câu trả lời</h4><p className="text-xs text-slate-500">Admin nhập nội dung đào tạo dạng text.</p></div><button type="button" onClick={() => setQuestions([...questions, { question: "", answer: "" }])} className="rounded-lg bg-[#eaf4fb] px-3 py-2 text-xs font-semibold text-[#24618f]">Thêm câu hỏi</button></div><div className="mt-3 space-y-3">{questions.map((item, index) => <div key={index} className="rounded-lg border border-[#d7e2f1] bg-white p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Câu hỏi {index + 1}</span>{questions.length > 1 ? <button type="button" onClick={() => setQuestions(questions.filter((_, itemIndex) => itemIndex !== index))} className="text-red-500"><Trash2 className="h-4 w-4" /></button> : null}</div><input value={item.question} onChange={(event) => setQuestions(questions.map((current, itemIndex) => itemIndex === index ? { ...current, question: event.target.value } : current))} placeholder="Nhập câu hỏi" className="h-10 w-full rounded-lg border border-[#d7e2f1] px-3 text-sm" /><textarea value={item.answer} onChange={(event) => setQuestions(questions.map((current, itemIndex) => itemIndex === index ? { ...current, answer: event.target.value } : current))} placeholder="Nhập câu trả lời" className="mt-2 min-h-20 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm" /></div>)}</div></div>
                {error ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[#d7e2f1] px-4 py-2 text-sm text-slate-600"
                >
                  Hủy
                </button>
                <button className="rounded-lg bg-[#24618f] px-4 py-2 text-sm font-semibold text-white">
                  Lưu khóa học
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-[#e3eaf2] bg-white p-5">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4fb] text-[#2d78aa]">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#173554]">{value}</p>
    </div>
  );
}
