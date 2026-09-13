"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";

type Report = { id: number; team: string; reportContent: string; complaints: string; proposal: string; afterMeetingAction: string };
type Draft = Omit<Report, "id">;
type Toast = { message: string; ok: boolean };
const empty: Draft = { team: "", reportContent: "", complaints: "", proposal: "", afterMeetingAction: "" };
const fields: Array<{ key: keyof Draft; label: string }> = [
  { key: "team", label: "Team / Dự án" },
  { key: "reportContent", label: "Nội dung báo cáo" },
  { key: "complaints", label: "Khiếu nại phát sinh" },
  { key: "proposal", label: "Đề xuất" },
  { key: "afterMeetingAction", label: "Nội dung cần thực hiện sau họp" },
];

export function MeetingReportsCrud() {
  const [rows, setRows] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  async function load(nextPage = 1) {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (nextPage === 1) setLoading(true); else setLoadingMore(true);
    const params = new URLSearchParams({ page: String(nextPage), pageSize: "15" });
    if (search) params.set("search", search);
    const response = await fetch(`/api/meeting-reports?${params}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setRows((current) => nextPage === 1 ? data.rows : [...current, ...data.rows]);
      setTotal(data.total);
      setPage(nextPage);
    }
    if (nextPage === 1) setLoading(false); else setLoadingMore(false);
    loadingRef.current = false;
  }

  useEffect(() => { void load(1); }, [search]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 4000); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || loadingMore || rows.length >= total) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void load(page + 1); }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, rows.length, total, search]);

  function openCreate() { setEditingId(null); setDraft(empty); setShowForm(true); }
  function edit(row: Report) { setEditingId(row.id); setDraft({ team: row.team, reportContent: row.reportContent, complaints: row.complaints, proposal: row.proposal, afterMeetingAction: row.afterMeetingAction }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function closeForm() { setShowForm(false); setEditingId(null); setDraft(empty); }
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); const response = await fetch(editingId ? `/api/meeting-reports/${editingId}` : "/api/meeting-reports", { method: editingId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) }); if (!response.ok) { const data = await response.json().catch(() => null); setToast({ message: data?.error || "Không thể lưu báo cáo.", ok: false }); setSaving(false); return; } closeForm(); setToast({ message: editingId ? "Đã cập nhật báo cáo giao ban." : "Đã tạo báo cáo giao ban.", ok: true }); await load(1); setSaving(false); }
  async function remove(row: Report) { if (!window.confirm(`Xóa báo cáo giao ban của ${row.team}?`)) return; const response = await fetch(`/api/meeting-reports/${row.id}`, { method: "DELETE" }); if (!response.ok) { setToast({ message: "Không thể xóa báo cáo.", ok: false }); return; } setToast({ message: "Đã xóa báo cáo giao ban.", ok: true }); await load(1); }

  return <main className="min-h-[calc(100vh-76px)] bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
    {toast ? <div role="status" className={`fixed right-5 top-24 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${toast.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{toast.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}{toast.message}<button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo"><X className="h-4 w-4" /></button></div> : null}
    <div className="mx-auto max-w-[1800px]">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#4a91c3]">Meeting reports</p><h1 className="mt-1 text-3xl font-semibold text-[#173554]">Báo cáo giao ban</h1><p className="mt-2 text-sm text-slate-500">{total} record trong database</p></div><button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#24618f] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Tạo báo cáo</button></div>
      {showForm ? <section className="mb-6 rounded-2xl border border-[#e3eaf2] bg-white p-5 shadow-sm"><div className="flex justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#4a91c3]">{editingId ? "Update" : "New report"}</p><h2 className="mt-1 text-xl font-semibold text-[#173554]">{editingId ? "Cập nhật báo cáo giao ban" : "Tạo báo cáo giao ban"}</h2></div><button type="button" onClick={closeForm} aria-label="Đóng form"><X className="text-slate-400" /></button></div><form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">{fields.map((field) => <label key={field.key}><span className="mb-1.5 block text-sm font-medium text-slate-600">{field.label}</span>{field.key === "team" ? <input required value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="h-11 w-full rounded-lg border border-[#d7e2f1] px-3 text-sm" /> : <textarea value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="min-h-28 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm" />}</label>)}<div className="md:col-span-2 flex justify-end gap-2 border-t border-[#edf1f5] pt-4"><button type="button" onClick={closeForm} className="rounded-lg border border-[#d7e2f1] px-4 py-2 text-sm">Đóng</button><button disabled={saving} className="rounded-lg bg-[#24618f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu báo cáo"}</button></div></form></section> : null}
      <section className="rounded-2xl border border-[#e3eaf2] bg-white p-5 shadow-sm"><div className="mb-5 flex justify-between gap-3"><div><h2 className="text-xl font-semibold text-[#173554]">Danh sách báo cáo giao ban</h2><p className="mt-1 text-sm text-slate-500">Tải 15 record mỗi lần</p></div><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm báo cáo..." className="h-10 rounded-lg border border-[#d7e2f1] pl-9 pr-3 text-sm" /></label></div><div className="overflow-x-auto rounded-xl border border-[#d7e2f1]"><table className="min-w-[1200px] w-full text-left text-sm"><thead className="bg-[#f8fbfd] text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Thao tác</th>{fields.map((field) => <th key={field.key} className="min-w-[220px] px-3 py-3">{field.label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f5]">{loading ? <tr><td colSpan={fields.length + 1} className="px-3 py-10 text-center">Đang tải...</td></tr> : rows.length ? rows.map((row) => <tr key={row.id} className="align-top"><td className="whitespace-nowrap px-3 py-3"><div className="flex gap-2"><button type="button" onClick={() => edit(row)} aria-label="Sửa" className="rounded-lg bg-[#eaf4fb] p-2 text-[#24618f]"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void remove(row)} aria-label="Xóa" className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>{fields.map((field) => <td key={field.key} className="whitespace-pre-wrap px-3 py-3 text-slate-600">{row[field.key] || "—"}</td>)}</tr>) : <tr><td colSpan={fields.length + 1} className="px-3 py-12 text-center text-slate-400">Chưa có báo cáo giao ban.</td></tr>}</tbody></table></div><div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-4 text-sm text-slate-500">{loadingMore ? <Loader2 className="h-7 w-7 animate-spin text-[#24618f]" aria-label="Đang tải thêm" /> : rows.length >= total && total > 0 ? "Đã hiển thị toàn bộ record" : null}</div></section>
    </div>
  </main>;
}
