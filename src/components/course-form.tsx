"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const projects = [
  "BIDV",
  "Vietcombank",
  "Vietinbank",
  "Techcombank",
  "UOB",
  "TechcomLife",
];
type Question = { question: string; answer: string };

export function CourseForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Đào tạo nội bộ",
    level: "Cơ bản",
    coverColor: "blue",
    agentSteps: "",
    escalationGuidance: "",
    trainingNotes: "",
  });
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", answer: "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, questions }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Không thể tạo khóa học.");
      setSaving(false);
      return;
    }
    const course = (await response.json()) as { id: number };
    window.location.assign(`/learning/courses/${course.id}`);
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
      <div className="mx-auto max-w-[980px] px-5 py-8 sm:px-8">
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#24618f]"
        >
          <ArrowLeft className="h-4 w-4" /> E-learning
        </Link>
        <div className="mt-5 rounded-2xl border border-[#e3eaf2] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-[#173554]">
            Tạo khóa học
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Tạo nội dung đào tạo dạng câu hỏi và câu trả lời.
          </p>
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
              <button
                disabled={saving}
                className="rounded-lg bg-[#24618f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu khóa học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
