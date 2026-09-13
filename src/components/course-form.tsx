"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, House, Pencil, Plus, Trash2, X } from "lucide-react";

const projects = [
  "BIDV",
  "Vietcombank",
  "Vietinbank",
  "Techcombank",
  "UOB",
  "TechcomLife",
];
type Question = { question: string; answer: string };
type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  coverColor: string;
  agentSteps: string;
  escalationGuidance: string;
  trainingNotes: string;
};
type CourseFormValue = Omit<Course, "id" | "status">;
type Toast = { message: string; type: "success" | "delete" };

const emptyForm: CourseFormValue = {
  title: "",
  description: "",
  category: "Đào tạo nội bộ",
  level: "Cơ bản",
  coverColor: "blue",
  agentSteps: "",
  escalationGuidance: "",
  trainingNotes: "",
};

export function CourseForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CourseFormValue>(emptyForm);
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", answer: "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  async function loadCourses() {
    setLoading(true);
    const response = await fetch("/api/courses", { cache: "no-store" });
    if (response.ok) setCourses(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(editingId ? `/api/courses/${editingId}` : "/api/courses", {
      method: editingId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, questions }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Không thể tạo khóa học.");
      setSaving(false);
      return;
    }
    setForm(emptyForm);
    setQuestions([{ question: "", answer: "" }]);
    setEditingId(null);
    setShowForm(false);
    setToast({
      message: editingId ? "Đã cập nhật khóa học thành công." : "Đã tạo khóa học thành công.",
      type: "success",
    });
    await loadCourses();
  }

  async function editCourse(course: Course) {
    setError("");
    const response = await fetch(`/api/courses/${course.id}`);
    if (!response.ok) {
      setError("Không thể tải khóa học để chỉnh sửa.");
      return;
    }
    const data = await response.json() as Course & { lessons?: Array<{ title: string; content: string }> };
    setEditingId(data.id);
    setShowForm(true);
    setForm({ title: data.title, description: data.description, category: data.category, level: data.level, coverColor: data.coverColor, agentSteps: data.agentSteps, escalationGuidance: data.escalationGuidance, trainingNotes: data.trainingNotes });
    setQuestions(data.lessons?.length ? data.lessons.map((lesson) => ({ question: lesson.title, answer: lesson.content })) : [{ question: "", answer: "" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeCourse(course: Course) {
    if (!window.confirm(`Xóa khóa học ${course.title}?`)) return;
    const response = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Không thể xóa khóa học.");
      return;
    }
    if (editingId === course.id) {
      setEditingId(null);
      setForm(emptyForm);
      setQuestions([{ question: "", answer: "" }]);
      setShowForm(false);
    }
    setToast({ message: "Đã xóa khóa học thành công.", type: "delete" });
    await loadCourses();
  }

  function openCreateForm() {
    setError("");
    setEditingId(null);
    setForm(emptyForm);
    setQuestions([{ question: "", answer: "" }]);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setQuestions([{ question: "", answer: "" }]);
    setError("");
  }

  function updateQuestion(index: number, key: keyof Question, value: string) {
    setQuestions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f4f7fb]">
      {toast ? (
        <div
          role="status"
          className={`fixed right-5 top-5 z-[70] flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.type === "delete" ? "bg-red-600" : "bg-emerald-600"}`}
        >
          <span className="h-2 w-2 rounded-full bg-white/90" />
          {toast.message}
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setToast(null)}
            className="ml-2 rounded-md p-1 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-[980px] flex-col px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#24618f]"
          >
            <House className="h-4 w-4" /> Trang chủ
          </Link>
          <Link
            href="/learning"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#24618f]"
          >
            <ArrowLeft className="h-4 w-4" /> E-learning
          </Link>
        </div>
        <section className="order-2 mt-5 rounded-2xl border border-[#e3eaf2] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#4a91c3]">Course management</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#173554]">Danh sách khóa học</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{courses.length} khóa học</span>
              <button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-lg bg-[#24618f] px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Tạo khóa học</button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            {loading ? <p className="py-6 text-sm text-slate-500">Đang tải danh sách...</p> : courses.length ? <table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-[#e3eaf2] text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Tên khóa học</th><th className="px-3 py-3">Danh mục</th><th className="px-3 py-3">Cấp độ</th><th className="px-3 py-3 text-right">Thao tác</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-b border-[#edf1f5] last:border-0"><td className="px-3 py-3 font-semibold text-[#173554]">{course.title}</td><td className="px-3 py-3 text-slate-500">{course.category}</td><td className="px-3 py-3 text-slate-500">{course.level}</td><td className="px-3 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => void editCourse(course)} className="inline-flex items-center gap-1 rounded-lg bg-[#eaf4fb] px-3 py-2 text-xs font-semibold text-[#24618f]"><Pencil className="h-3.5 w-3.5" /> Sửa</button><button type="button" onClick={() => void removeCourse(course)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"><Trash2 className="h-3.5 w-3.5" /> Xóa</button></div></td></tr>)}</tbody></table> : <p className="py-6 text-sm text-slate-500">Chưa có khóa học nào.</p>}
          </div>
        </section>
        {showForm ? <section className="order-1 mt-5 rounded-2xl border border-[#e3eaf2] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[#173554]">
                {editingId ? "Cập nhật khóa học" : "Tạo khóa học"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Tạo nội dung đào tạo dạng câu hỏi và câu trả lời.
              </p>
            </div>
            <button type="button" onClick={closeForm} aria-label="Đóng form khóa học" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submit} className="mt-8 space-y-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Tên khóa học / Dự án
                </span>
                <select
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                >
                  <option value="">Chọn dự án</option>
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Danh mục
                </span>
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-[#d7e2f1] px-3 text-sm"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Cấp độ
                </span>
                <select
                  value={form.level}
                  onChange={(event) =>
                    setForm({ ...form, level: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                >
                  <option>Cơ bản</option>
                  <option>Trung cấp</option>
                  <option>Nâng cao</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Màu cover
                </span>
                <select
                  value={form.coverColor}
                  onChange={(event) =>
                    setForm({ ...form, coverColor: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                >
                  <option value="blue">Xanh</option>
                  <option value="teal">Teal</option>
                  <option value="gold">Vàng</option>
                </select>
              </label>
            </div>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                Mô tả khóa học
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="min-h-28 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="mb-1.5 block text-sm font-medium text-slate-600">Các bước Agent cần thao tác/xử lý gì</span><textarea value={form.agentSteps} onChange={(event) => setForm({ ...form, agentSteps: event.target.value })} className="min-h-28 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm" /></label>
              <label><span className="mb-1.5 block text-sm font-medium text-slate-600">Khi nào cần báo Team Leader/Manager</span><textarea value={form.escalationGuidance} onChange={(event) => setForm({ ...form, escalationGuidance: event.target.value })} className="min-h-28 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm" /></label>
            </div>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-600">Ghi chú đào tạo</span><textarea value={form.trainingNotes} onChange={(event) => setForm({ ...form, trainingNotes: event.target.value })} className="min-h-28 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm" /></label>
            <section className="border-t border-[#edf1f5] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#173554]">
                    Câu hỏi và câu trả lời
                  </h2>
                  <p className="text-sm text-slate-500">
                    Mỗi cặp là một bài học.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions([...questions, { question: "", answer: "" }])
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#eaf4fb] px-3 py-2 text-sm font-semibold text-[#24618f]"
                >
                  <Plus className="h-4 w-4" /> Thêm
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {questions.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#d7e2f1] bg-[#f8fbfd] p-4"
                  >
                    <div className="mb-3 flex justify-between">
                      <b className="text-sm text-[#315172]">
                        Câu hỏi {index + 1}
                      </b>
                      {questions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setQuestions(
                              questions.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <input
                      value={item.question}
                      onChange={(event) =>
                        updateQuestion(index, "question", event.target.value)
                      }
                      placeholder="Nhập câu hỏi"
                      className="h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"
                    />
                    <textarea
                      value={item.answer}
                      onChange={(event) =>
                        updateQuestion(index, "answer", event.target.value)
                      }
                      placeholder="Nhập câu trả lời"
                      className="mt-3 min-h-28 w-full rounded-lg border border-[#d7e2f1] bg-white p-3 text-sm"
                    />
                  </div>
                ))}
              </div>
            </section>
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-3 border-t border-[#edf1f5] pt-6">
              <Link
                href="/learning"
                className="rounded-lg border border-[#d7e2f1] px-4 py-2.5 text-sm text-slate-600"
              >
                Hủy
              </Link>
              <button type="button" onClick={closeForm} className="inline-flex items-center gap-2 rounded-lg border border-[#d7e2f1] px-4 py-2.5 text-sm text-slate-600"><X className="h-4 w-4" /> Đóng</button>
              <button
                disabled={saving}
                className="rounded-lg bg-[#24618f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : editingId ? "Cập nhật khóa học" : "Lưu khóa học"}
              </button>
            </div>
          </form>
        </section> : null}
      </div>
    </main>
  );
}
