"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";

const colors = ["#24618f", "#e2765b", "#d89a38", "#3d9b78", "#7d6acb", "#4aa3df", "#c45b85"];
const projects = ["BIDV", "VietcomBank", "VietinBank", "TechcomBank", "UOB", "TechcomLife", "Elite"];
type Stats = { total: number; pending: number; projects: Array<{ project: string; total: number }>; systems: Array<{ system: string; total: number }> };

export function TechnicalReportsStats({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, projects: [], systems: [] });
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [project, setProject] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (reportFrom) params.set("reportFrom", reportFrom);
    if (reportTo) params.set("reportTo", reportTo);
    if (project) params.set("project", project);
    setLoading(true);
    fetch(`/api/technical-reports/stats?${params}`, { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then(setStats)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reportFrom, reportTo, project]);

  const pendingChart = [{ name: "Chưa xử lý", value: stats.pending }, { name: "Đã xử lý", value: Math.max(stats.total - stats.pending, 0) }];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#4a91c3]">Report analytics</p><h2 className="mt-1 text-2xl font-semibold text-[#173554]">Xem báo cáo lỗi</h2><p className="mt-1 text-sm text-slate-500">Tổng hợp trực tiếp từ toàn bộ record trong database.</p></div><button type="button" onClick={onClose} aria-label="Đóng báo cáo" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></header>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><label className="text-xs font-medium text-slate-500">Từ ngày<input type="date" value={reportFrom} onChange={(event) => setReportFrom(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] px-3 text-sm" /></label><label className="text-xs font-medium text-slate-500">Đến ngày<input type="date" value={reportTo} onChange={(event) => setReportTo(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] px-3 text-sm" /></label><label className="text-xs font-medium text-slate-500">Dự án<select value={project} onChange={(event) => setProject(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm"><option value="">Tất cả dự án</option>{projects.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
        {loading ? <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d7e2f1] border-t-[#24618f]" /></div> : <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-[#e3eaf2] bg-[#f8fbfd] p-4"><h3 className="text-base font-semibold text-[#173554]">Case chưa xử lý</h3><p className="mt-1 text-sm text-slate-500">{stats.pending} case</p><div className="relative h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pendingChart} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>{pendingChart.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? "#e2765b" : "#3d9b78"} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-3xl font-semibold text-[#173554]">{stats.pending}</strong></div></div></article>
          <article className="rounded-2xl border border-[#e3eaf2] bg-[#f8fbfd] p-4"><h3 className="text-base font-semibold text-[#173554]">Báo cáo theo dự án</h3><p className="mt-1 text-sm text-slate-500">Dự án có nhiều báo cáo nhất: {stats.projects[0]?.project || "Chưa có dữ liệu"}</p><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.projects} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#dfeaf8" /><XAxis dataKey="project" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="total" name="Số báo cáo" radius={[6, 6, 0, 0]}>{stats.projects.map((entry, index) => <Cell key={entry.project} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></article>
          <article className="rounded-2xl border border-[#e3eaf2] bg-[#f8fbfd] p-4 md:col-span-2"><h3 className="text-base font-semibold text-[#173554]">Báo cáo theo hệ thống bị lỗi</h3><p className="mt-1 text-sm text-slate-500">Hệ thống bị báo cáo nhiều nhất: {stats.systems[0]?.system || "Chưa có dữ liệu"}</p><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.systems} layout="vertical" margin={{ top: 8, right: 20, left: 20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#dfeaf8" /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="system" width={105} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="total" name="Số báo cáo" radius={[0, 6, 6, 0]}>{stats.systems.map((entry, index) => <Cell key={entry.system} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></article>
        </div>}
      </section>
    </div>
  );
}
