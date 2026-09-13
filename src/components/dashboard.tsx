"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileUp, Search, ShieldCheck } from "lucide-react";

type Summary = { total: number; byMonth: Array<{ month: string; total: number }>; byProject: Array<{ project: string; total: number }> };
type Complaint = { id: number; project: string; receivedDate: string; customer: string; bookingCode: string; privilege: string; usageDate: string; provider: string; complaintContent: string; compensation: string; damage: string };
type ListResult = { rows: Complaint[]; total: number; page: number; pageSize: number };

export function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [result, setResult] = useState<ListResult | null>(null);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) query.set("search", search);
    if (month) query.set("month", month);
    const [summaryResponse, listResponse] = await Promise.all([fetch("/api/summary"), fetch(`/api/complaints?${query}`)]);
    if (summaryResponse.ok) setSummary(await summaryResponse.json());
    if (listResponse.ok) setResult(await listResponse.json());
    setLoading(false);
  }

  useEffect(() => { void load(); }, [page, search, month]);

  const pages = Math.max(1, Math.ceil((result?.total ?? 0) / 20));
  const projectMax = Math.max(1, ...(summary?.byProject.map((item) => item.total) ?? [1]));
  const months = useMemo(() => summary?.byMonth ?? [], [summary]);

  async function importFile(file: File | undefined) {
    if (!file) return;
    setMessage("Đang import dữ liệu...");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/import", { method: "POST", body });
    const data = await response.json();
    setMessage(response.ok ? `Đã import ${data.imported} bản ghi.` : data.error || "Import thất bại.");
    if (response.ok) await load();
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,.2),transparent_35%),linear-gradient(180deg,#edf3ff,#e7f0ff)]">
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_40px_-25px_rgba(18,61,122,.4)] sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123d7a] font-bold text-white">V</div><div><p className="font-semibold text-[#123d7a]">VIP BOOKING 24H</p><p className="text-xs uppercase tracking-[.2em] text-slate-400">Operations data hub</p></div></div><p className="mt-3 text-sm text-slate-500">Quản lý khiếu nại, dịch vụ và dữ liệu vận hành.</p></div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#123d7a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0c2f5f]"><FileUp className="h-4 w-4" /> Import CSV / XLSX<input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      </header>
      {message ? <div className="mb-5 rounded-xl border border-[#d7e2f1] bg-white px-4 py-3 text-sm text-[#123d7a]">{message}</div> : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><Kpi label="Tổng khiếu nại" value={summary?.total ?? 0} /><Kpi label="Tháng có dữ liệu" value={summary?.byMonth.length ?? 0} /><Kpi label="Dự án" value={summary?.byProject.length ?? 0} /></div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        <section className="rounded-2xl border border-[#d7e2f1] bg-white p-5 shadow-[0_16px_32px_-20px_rgba(18,61,122,.35)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-[#123d7a]">Khiếu nại theo tháng</h2><p className="text-xs text-slate-500">Tự động cập nhật sau mỗi lần import</p></div><ShieldCheck className="h-5 w-5 text-[#1d4f94]" /></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={months}><CartesianGrid strokeDasharray="3 3" stroke="#dfeaf8" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="total" name="Khiếu nại" fill="#123d7a" radius={[7,7,0,0]} /></BarChart></ResponsiveContainer></div></section>
        <section className="rounded-2xl border border-[#d7e2f1] bg-white p-5 shadow-[0_16px_32px_-20px_rgba(18,61,122,.35)]"><h2 className="text-lg font-semibold text-[#123d7a]">Theo dự án</h2><div className="mt-5 space-y-4">{(summary?.byProject ?? []).map((item) => <div key={item.project}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-600">{item.project}</span><b className="text-[#123d7a]">{item.total}</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#2d6fba]" style={{ width: `${item.total / projectMax * 100}%` }} /></div></div>)}</div></section>
      </div>
      <section className="mt-6 rounded-2xl border border-[#d7e2f1] bg-white p-4 shadow-[0_16px_32px_-20px_rgba(18,61,122,.35)] sm:p-5"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-semibold text-[#123d7a]">Danh sách khiếu nại</h2><div className="flex flex-col gap-2 sm:flex-row"><select value={month} onChange={(event) => { setPage(1); setMonth(event.target.value); }} className="rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm"><option value="">Tất cả tháng</option>{months.map((item) => <option key={item.month} value={item.month}>{item.month}</option>)}</select><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Tìm 7 trường dữ liệu..." className="rounded-lg border border-[#d7e2f1] py-2 pl-9 pr-3 text-sm" /></label></div></div><div className="overflow-x-auto rounded-xl border border-[#d7e2f1]"><table className="min-w-[1100px] divide-y divide-[#d7e2f1] text-left text-sm"><thead className="bg-[#e7f0ff] text-[#123d7a]"><tr>{["Dự án","Ngày tiếp nhận","Khách hàng","Booking","Đặc quyền","Lịch sử dụng","Nhà cung cấp"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead><tbody className="divide-y divide-[#d7e2f1]">{result?.rows.map((row) => <tr key={row.id} className="hover:bg-[#f4f8ff]"><td className="px-4 py-3 font-medium">{row.project}</td><td className="px-4 py-3 whitespace-nowrap">{row.receivedDate}</td><td className="max-w-64 px-4 py-3">{row.customer || "—"}</td><td className="px-4 py-3">{row.bookingCode || "—"}</td><td className="px-4 py-3">{row.privilege || "—"}</td><td className="px-4 py-3">{row.usageDate || "—"}</td><td className="px-4 py-3">{row.provider || "—"}</td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-sm text-slate-500"><span>{loading ? "Đang tải..." : `${result?.total ?? 0} bản ghi`}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Trước</button><span className="px-2 py-1.5">{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Sau</button></div></div></section>
    </div>
  </main>;
}

function Kpi({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-[#d7e2f1] bg-white p-5 shadow-[0_16px_32px_-20px_rgba(18,61,122,.35)]"><p className="text-xs uppercase tracking-[.16em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-[#123d7a]">{value.toLocaleString()}</p></div>; }
