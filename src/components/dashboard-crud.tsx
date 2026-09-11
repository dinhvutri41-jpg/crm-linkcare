"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileUp, Pencil, Plus, Save, Search, ShieldCheck, Trash2, X } from "lucide-react";

type Complaint = {
  id: number; sourceSheet: string; project: string; receivedDate: string; month: string; customer: string; bookingCode: string;
  privilege: string; usageDate: string; provider: string; complaintContent: string; resolution: string; compensation: string; damage: string; errorType: string;
};
type Summary = { total: number; byMonth: Array<{ month: string; total: number }>; byProject: Array<{ project: string; total: number }> };
type Field = { key: keyof Complaint; label: string; wide?: boolean; date?: boolean };

const fields: Field[] = [
  { key: "project", label: "Dự án" }, { key: "receivedDate", label: "Ngày tiếp nhận", date: true }, { key: "customer", label: "Thông tin khách hàng", wide: true },
  { key: "bookingCode", label: "Mã booking" }, { key: "privilege", label: "Loại đặc quyền" }, { key: "usageDate", label: "Lịch sử dụng" }, { key: "provider", label: "Nhà cung cấp" },
  { key: "complaintContent", label: "Nội dung khiếu nại", wide: true }, { key: "resolution", label: "Kết quả xử lý", wide: true }, { key: "compensation", label: "Quà tặng / đền bù", wide: true },
  { key: "damage", label: "Thiệt hại", wide: true }, { key: "errorType", label: "Phân loại lỗi" }, { key: "sourceSheet", label: "Nguồn sheet", wide: true }, { key: "month", label: "Tháng" },
];

function emptyComplaint() {
  const today = new Date().toISOString().slice(0, 10);
  return { id: 0, sourceSheet: "manual", project: "", receivedDate: today, month: today.slice(0, 7), customer: "", bookingCode: "", privilege: "", usageDate: "", provider: "", complaintContent: "", resolution: "", compensation: "", damage: "", errorType: "" } satisfies Complaint;
}

export function DashboardCrud() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rows, setRows] = useState<Complaint[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Complaint>>({});
  const [newDraft, setNewDraft] = useState<Complaint | null>(null);
  const [search, setSearch] = useState(""); const [month, setMonth] = useState(""); const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState<number | "new" | null>(null);
  const months = useMemo(() => summary?.byMonth ?? [], [summary]); const pages = Math.max(1, Math.ceil(total / 20));

  async function load() {
    setLoading(true); const query = new URLSearchParams({ page: String(page), pageSize: "20" }); if (search) query.set("search", search); if (month) query.set("month", month);
    const [summaryResponse, listResponse] = await Promise.all([fetch("/api/summary"), fetch(`/api/complaints?${query}`)]);
    if (summaryResponse.ok) setSummary(await summaryResponse.json());
    if (listResponse.ok) { const data = await listResponse.json(); setRows(data.rows); setTotal(data.total); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, [page, search, month]);

  function updateDraft(id: number, key: keyof Complaint, value: string) { setDrafts((current) => ({ ...current, [id]: { ...current[id], [key]: value, ...(key === "receivedDate" ? { month: value.slice(0, 7) } : {}) } })); }
  function updateNew(key: keyof Complaint, value: string) { setNewDraft((current) => current ? { ...current, [key]: value, ...(key === "receivedDate" ? { month: value.slice(0, 7) } : {}) } : current); }
  function cancel(id: number) { setDrafts((current) => { const next = { ...current }; delete next[id]; return next; }); }
  async function responseData(response: Response): Promise<{ error?: string; [key: string]: unknown }> {
    const text = await response.text();
    if (!text) return { error: `Server trả về HTTP ${response.status}` };
    try { return JSON.parse(text) as { error?: string; [key: string]: unknown }; } catch { return { error: `Server trả về HTTP ${response.status}` }; }
  }

  async function save(id: number) {
    setSaving(id); const response = await fetch(`/api/complaints/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(drafts[id]) }); const data = await responseData(response);
    setMessage(response.ok ? "Đã lưu thay đổi." : data.error || "Không thể lưu."); if (response.ok) { cancel(id); await load(); } setSaving(null);
  }
  async function create() {
    if (!newDraft) return; setSaving("new"); const response = await fetch("/api/complaints", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(newDraft) }); const data = await responseData(response);
    setMessage(response.ok ? "Đã tạo bản ghi mới." : data.error || "Không thể tạo bản ghi."); if (response.ok) { setNewDraft(null); setPage(1); await load(); } setSaving(null);
  }
  async function remove(row: Complaint) {
    if (!window.confirm(`Xoá bản ghi ${row.bookingCode || row.id}?`)) return; const response = await fetch(`/api/complaints/${row.id}`, { method: "DELETE" }); setMessage(response.ok ? "Đã xoá bản ghi." : "Không thể xoá bản ghi."); if (response.ok) await load();
  }
  async function importFile(file: File | undefined) {
    if (!file) return; setMessage("Đang import dữ liệu..."); const body = new FormData(); body.set("file", file); const response = await fetch("/api/import", { method: "POST", body }); const data = await responseData(response);
    setMessage(response.ok ? `Đã import ${data.imported} bản ghi.` : data.error || "Import thất bại."); if (response.ok) await load();
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,.2),transparent_35%),linear-gradient(180deg,#edf3ff,#e7f0ff)]"><div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8">
    <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_40px_-25px_rgba(18,61,122,.4)] sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123d7a] font-bold text-white">L</div><div><p className="font-semibold text-[#123d7a]">LinkCare CRM</p><p className="text-xs uppercase tracking-[.2em] text-slate-400">Operations data hub</p></div></div><p className="mt-3 text-sm text-slate-500">CRUD dữ liệu khiếu nại, đồng bộ database cho Lounge Finder.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setNewDraft(emptyComplaint())} className="inline-flex items-center gap-2 rounded-xl border border-[#123d7a] px-4 py-2.5 text-sm font-semibold text-[#123d7a]"><Plus className="h-4 w-4" /> Bản ghi mới</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#123d7a] px-4 py-2.5 text-sm font-semibold text-white"><FileUp className="h-4 w-4" /> Import CSV / XLSX<input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div></header>
    {message ? <div className="mb-5 rounded-xl border border-[#d7e2f1] bg-white px-4 py-3 text-sm text-[#123d7a]">{message}</div> : null}
    <div className="mb-6"><Kpi label="Tổng bản ghi" value={summary?.total ?? 0} /></div>
    <section className="mb-6 rounded-2xl border border-[#d7e2f1] bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-[#123d7a]">Thống kê khiếu nại</h2><p className="text-xs text-slate-500">Cập nhật sau khi lưu database</p></div><ShieldCheck className="h-5 w-5 text-[#1d4f94]" /></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={months}><CartesianGrid strokeDasharray="3 3" stroke="#dfeaf8" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" name="Khiếu nại" fill="#123d7a" /></BarChart></ResponsiveContainer></div></section>
    <section className="mt-6 rounded-2xl border border-[#d7e2f1] bg-white p-4 sm:p-5"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-[#123d7a]">Dữ liệu khiếu nại</h2><p className="text-xs text-slate-500">Bấm Sửa để chỉnh toàn bộ ô của một dòng rồi bấm Lưu.</p></div><div className="flex flex-col gap-2 sm:flex-row"><select value={month} onChange={(event) => { setPage(1); setMonth(event.target.value); }} className="rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm"><option value="">Tất cả tháng</option>{months.map((item) => <option key={item.month} value={item.month}>{item.month}</option>)}</select><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Tìm toàn bộ dữ liệu..." className="rounded-lg border border-[#d7e2f1] py-2 pl-9 pr-3 text-sm" /></label></div></div><div className="overflow-x-auto rounded-xl border border-[#d7e2f1]"><table className="min-w-[2500px] divide-y divide-[#d7e2f1] text-left text-sm"><thead className="bg-[#e7f0ff] text-[#123d7a]"><tr><th className="sticky left-0 z-10 bg-[#e7f0ff] px-3 py-3">Thao tác</th>{fields.map((field) => <th key={field.key} className={`px-3 py-3 ${field.wide ? "min-w-64" : "min-w-40"}`}>{field.label}</th>)}</tr></thead><tbody className="divide-y divide-[#d7e2f1]">{newDraft ? <EditableRow draft={newDraft} saving={saving === "new"} onChange={updateNew} onSave={() => void create()} onCancel={() => setNewDraft(null)} /> : null}{rows.map((row) => drafts[row.id] ? <EditableRow key={row.id} draft={drafts[row.id]} saving={saving === row.id} onChange={(key, value) => updateDraft(row.id, key, value)} onSave={() => void save(row.id)} onCancel={() => cancel(row.id)} /> : <tr key={row.id} className="hover:bg-[#f4f8ff]"><td className="sticky left-0 z-[1] whitespace-nowrap bg-white px-3 py-3"><button title="Sửa bản ghi" onClick={() => setDrafts((current) => ({ ...current, [row.id]: { ...row } }))} className="mr-2 rounded-lg p-2 text-[#123d7a]"><Pencil className="h-4 w-4" /></button><button title="Xoá bản ghi" onClick={() => void remove(row)} className="rounded-lg p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></td>{fields.map((field) => <td key={field.key} className="max-w-80 px-3 py-3 align-top">{row[field.key] || <span className="text-slate-300">—</span>}</td>)}</tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-sm text-slate-500"><span>{loading ? "Đang tải..." : `${total} bản ghi`}</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Trước</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Sau</button></div></div></section>
  </div></main>;
}

function EditableRow({ draft, saving, onChange, onSave, onCancel }: { draft: Complaint; saving: boolean; onChange: (key: keyof Complaint, value: string) => void; onSave: () => void; onCancel: () => void }) {
  return <tr className="bg-[#fffdf5]"><td className="sticky left-0 z-[1] whitespace-nowrap bg-[#fffdf5] px-3 py-3"><button title="Lưu" disabled={saving} onClick={onSave} className="mr-2 rounded-lg p-2 text-emerald-700 disabled:opacity-40"><Save className="h-4 w-4" /></button><button title="Huỷ" disabled={saving} onClick={onCancel} className="rounded-lg p-2 text-slate-500"><X className="h-4 w-4" /></button></td>{fields.map((field) => <td key={field.key} className="px-2 py-2 align-top">{field.wide ? <textarea value={String(draft[field.key] ?? "")} onChange={(event) => onChange(field.key, event.target.value)} className="min-h-16 w-full min-w-64 rounded-md border border-[#c7d7eb] bg-white px-2 py-2 text-sm" /> : <input type={field.date ? "date" : "text"} readOnly={field.key === "month"} value={String(draft[field.key] ?? "")} onChange={(event) => onChange(field.key, event.target.value)} className="w-full min-w-36 rounded-md border border-[#c7d7eb] bg-white px-2 py-2 text-sm" />}</td>)}</tr>;
}

function Kpi({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-[#d7e2f1] bg-white p-5"><p className="text-xs uppercase tracking-[.16em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-[#123d7a]">{value.toLocaleString()}</p></div>; }