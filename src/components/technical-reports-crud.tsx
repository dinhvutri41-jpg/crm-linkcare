"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bug, CheckCircle2, Download, FileUp, Loader2, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";
import { TechnicalReportsStats } from "@/components/technical-reports-stats";

type Status = "Chưa xử lý" | "Đang xử lý" | "Hoàn thành";
type TechnicalReport = { id: number; sequence: number; project: string; errorDescription: string; affectedSystem: string; reportTime: string; agentReported: string; itReceivedTime: string; itCompletedTime: string; handler: string; itResult: string; customerServiceTest: string; complaintEscalation: string; totalProcessingTime: string; status: Status };
type ReportForm = Omit<TechnicalReport, "id">;
type Toast = { message: string; type: "success" | "delete" | "error" };
type Field = { key: keyof ReportForm; label: string; wide?: boolean };
type DateTimeKey = "reportTime" | "itReceivedTime" | "itCompletedTime";

const statuses: Status[] = ["Chưa xử lý", "Đang xử lý", "Hoàn thành"];
const projects = ["BIDV", "VietcomBank", "VietinBank", "TechcomBank", "UOB", "TechcomLife", "Elite"];
const affectedSystems = ["Izzi", "Loungkey", "BSGD, doanh nghiệp", "onepay", "Web Linkcare", "Omi", "Phòng chờ", "Email", "omicall", "Landing page"];
const dateTimeKeys = new Set<DateTimeKey>(["reportTime", "itReceivedTime", "itCompletedTime"]);
const fields: Field[] = [
  { key: "project", label: "Dự án" },
  { key: "errorDescription", label: "Mô tả lỗi", wide: true },
  { key: "affectedSystem", label: "Hệ thống bị lỗi" },
  { key: "reportTime", label: "Thời điểm báo IT (hh:mm dd/mm/yyyy)" },
  { key: "agentReported", label: "Agent báo lỗi" },
  { key: "itReceivedTime", label: "Thời điểm IT tiếp nhận lỗi (hh:mm dd/mm/yyyy)" },
  { key: "itCompletedTime", label: "Thời điểm IT hoàn thành (hh:mm dd/mm/yyyy)" },
  { key: "handler", label: "Người xử lý" },
  { key: "itResult", label: "Kết quả IT xử lý", wide: true },
  { key: "customerServiceTest", label: "CSKH test kết quả" },
  { key: "complaintEscalation", label: "Mức độ ảnh hưởng - Đề xuất ý kiến", wide: true },
  { key: "totalProcessingTime", label: "Tổng thời gian xử lý" },
];
const emptyForm: ReportForm = { sequence: 0, project: "", errorDescription: "", affectedSystem: "", reportTime: "", agentReported: "", itReceivedTime: "", itCompletedTime: "", handler: "", itResult: "", customerServiceTest: "", complaintEscalation: "", totalProcessingTime: "", status: "Chưa xử lý" };

function toDateTimeInput(value: string) {
  const match = value.match(/^(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[5]}-${match[4]}-${match[3]}T${match[1]}:${match[2]}` : "";
}
function fromDateTimeInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return match ? `${match[4]}:${match[5]} ${match[3]}/${match[2]}/${match[1]}` : "";
}
function statusClass(status: Status) {
  return status === "Hoàn thành" ? "border-emerald-300 bg-emerald-100" : status === "Đang xử lý" ? "border-amber-300 bg-amber-100" : "border-red-300 bg-red-100";
}

function ReportField({ field, value, onChange }: { field: Field; value: string | number; onChange: (value: string) => void }) {
  const isDateTime = dateTimeKeys.has(field.key as DateTimeKey);
  const className = "h-11 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm";
  const isOtherSystem = field.key === "affectedSystem" && value !== "" && !affectedSystems.includes(String(value));
  const [otherSystemSelected, setOtherSystemSelected] = useState(isOtherSystem);
  useEffect(() => {
    if (isOtherSystem) setOtherSystemSelected(true);
    else if (value && field.key === "affectedSystem") setOtherSystemSelected(false);
  }, [field.key, isOtherSystem, value]);
  return (
    <label className={field.wide ? "md:col-span-2" : ""}>
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{field.label}</span>
      {field.wide ? <textarea value={String(value)} onChange={(event) => onChange(event.target.value)} className="min-h-24 w-full rounded-lg border border-[#d7e2f1] p-3 text-sm" /> : field.key === "project" ? <select required value={String(value)} onChange={(event) => onChange(event.target.value)} className={className}><option value="">Chọn dự án</option>{projects.map((project) => <option key={project} value={project}>{project}</option>)}</select> : field.key === "affectedSystem" ? <div className="space-y-2"><select value={otherSystemSelected ? "Khác" : String(value)} onChange={(event) => { const selected = event.target.value === "Khác"; setOtherSystemSelected(selected); onChange(selected ? "" : event.target.value); }} className={className}><option value="">Chọn hệ thống</option>{affectedSystems.map((system) => <option key={system} value={system}>{system}</option>)}<option value="Khác">Khác</option></select>{otherSystemSelected ? <input value={isOtherSystem ? String(value) : ""} onChange={(event) => onChange(event.target.value)} placeholder="Nhập hệ thống khác" className={className} /> : null}</div> : <input type={isDateTime ? "datetime-local" : "text"} value={isDateTime ? toDateTimeInput(String(value)) : String(value)} onChange={(event) => onChange(isDateTime ? fromDateTimeInput(event.target.value) : event.target.value)} className={className} />}
    </label>
  );
}

export function TechnicalReportsCrud() {
  const [rows, setRows] = useState<TechnicalReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ReportForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const tableScrollerRef = useRef<HTMLDivElement | null>(null);

  async function load(nextPage = 1) {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const scrollPosition = nextPage > 1 ? window.scrollY : null;
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    const params = new URLSearchParams({ page: String(nextPage), pageSize: "15" });
    if (search) params.set("search", search);
    if (projectFilter) params.set("project", projectFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (reportFrom) params.set("reportFrom", reportFrom);
    if (reportTo) params.set("reportTo", reportTo);
    const response = await fetch(`/api/technical-reports?${params}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setRows((current) => nextPage === 1 ? data.rows : [...current, ...data.rows]);
      setTotal(data.total);
      setPage(nextPage);
      if (scrollPosition !== null) {
        window.requestAnimationFrame(() => window.scrollTo({ top: scrollPosition, behavior: "auto" }));
      }
    }
    if (nextPage === 1) setLoading(false);
    else setLoadingMore(false);
    loadingRef.current = false;
  }

  useEffect(() => { void load(1); }, [search, projectFilter, statusFilter, reportFrom, reportTo]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || loadingMore || rows.length >= total) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void load(page + 1);
    }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, rows.length, total, search, projectFilter, statusFilter, reportFrom, reportTo]);
  useEffect(() => {
    const scroller = document.querySelector("table")?.parentElement as HTMLDivElement | null;
    if (!scroller) return;
    tableScrollerRef.current = scroller;
    scroller.style.cursor = "grab";
    scroller.style.touchAction = "pan-y";
    const drag = { active: false, startX: 0, scrollLeft: 0 };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.active = true;
      drag.startX = event.clientX;
      drag.scrollLeft = scroller.scrollLeft;
      scroller.setPointerCapture(event.pointerId);
      scroller.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      event.preventDefault();
      scroller.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
    };
    const stopDragging = () => {
      drag.active = false;
      scroller.style.cursor = "grab";
    };
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", stopDragging);
    scroller.addEventListener("pointercancel", stopDragging);
    return () => {
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", stopDragging);
      scroller.removeEventListener("pointercancel", stopDragging);
    };
  }, [rows.length]);

  function update(key: keyof ReportForm, value: string) { setForm((current) => ({ ...current, [key]: key === "sequence" ? Number(value) || 0 : value })); }
  function openCreate() { setEditingId(null); setForm({ ...emptyForm, sequence: rows.length + 1 }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingId(null); setForm(emptyForm); }
  function edit(row: TechnicalReport) { setEditingId(row.id); setForm({ ...row }); setShowForm(true); }
  async function updateStatus(row: TechnicalReport, status: Status) {
    const response = await fetch(`/api/technical-reports/${row.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...row, status }) });
    if (!response.ok) { setToast({ message: "Không thể cập nhật trạng thái.", type: "error" }); return; }
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item));
    setToast({ message: "Đã cập nhật trạng thái.", type: "success" });
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    const response = await fetch(editingId ? `/api/technical-reports/${editingId}` : "/api/technical-reports", { method: editingId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    if (!response.ok) { const data = await response.json().catch(() => null); setToast({ message: data?.error || "Không thể lưu báo cáo.", type: "error" }); setSaving(false); return; }
    setToast({ message: editingId ? "Đã cập nhật báo cáo kỹ thuật." : "Đã tạo báo cáo kỹ thuật.", type: "success" }); closeForm(); await load(); setSaving(false);
  }
  async function remove(row: TechnicalReport) {
    if (!window.confirm(`Xóa báo cáo lỗi ${row.sequence || row.id}?`)) return;
    const response = await fetch(`/api/technical-reports/${row.id}`, { method: "DELETE" });
    if (!response.ok) { setToast({ message: "Không thể xóa báo cáo.", type: "error" }); return; }
    setToast({ message: "Đã xóa báo cáo kỹ thuật.", type: "delete" });
    if (editingId === row.id) closeForm();
    await load();
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/technical-reports/import", { method: "POST", body });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setToast({ message: data?.error || "Không thể import Excel.", type: "error" }); return; }
    setToast({ message: `Đã import ${data.imported} case.`, type: "success" });
    await load(1);
  }
  async function exportFile() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (projectFilter) params.set("project", projectFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (reportFrom) params.set("reportFrom", reportFrom);
    if (reportTo) params.set("reportTo", reportTo);
    const response = await fetch(`/api/technical-reports/export?${params}`);
    if (!response.ok) { setToast({ message: "Không thể export Excel.", type: "error" }); return; }
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `technical-reports-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      {toast ? <div className={`toast-notification fixed right-5 top-24 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`} role="status"><span className="mt-0.5 shrink-0">{toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</span><span className="text-sm font-medium">{toast.message}</span><button type="button" aria-label="Đóng thông báo" onClick={() => setToast(null)} className="ml-auto rounded-md p-1 opacity-70 hover:bg-black/5 hover:opacity-100"><X className="h-4 w-4" /></button></div> : null}
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#e2765b]">Technical reports</p><h2 className="mt-1 text-3xl font-semibold text-[#173554]">Báo cáo lỗi kĩ thuật</h2><p className="mt-2 text-sm text-slate-500">Theo dõi lỗi hệ thống theo các cột dữ liệu từ sheet vận hành.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={exportFile} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#24618f] bg-white px-4 py-2.5 text-sm font-semibold text-[#24618f]"><Download className="h-4 w-4" /> Xuất Excel</button><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#24618f] bg-white px-4 py-2.5 text-sm font-semibold text-[#24618f]"><FileUp className="h-4 w-4" /> Import Excel<input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label><button type="button" onClick={() => setShowStats(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#24618f] bg-white px-4 py-2.5 text-sm font-semibold text-[#24618f]">Xem báo cáo</button><button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#24618f] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Tạo case mới</button></div></div>
        {showForm ? <section className="mb-6 rounded-2xl border border-[#e3eaf2] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#4a91c3]">{editingId ? "Update report" : "New report"}</p><h3 className="mt-1 text-xl font-semibold text-[#173554]">{editingId ? "Sửa báo cáo lỗi" : "Tạo báo cáo lỗi"}</h3></div><button type="button" onClick={closeForm} aria-label="Đóng form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-3">{fields.map((field) => <ReportField key={field.key} field={field} value={form[field.key]} onChange={(value) => update(field.key, value)} />)}<div className="md:col-span-3 flex justify-end gap-2 border-t border-[#edf1f5] pt-5"><button type="button" onClick={closeForm} className="rounded-lg border border-[#d7e2f1] px-4 py-2.5 text-sm text-slate-600">Đóng</button><button disabled={saving} className="rounded-lg bg-[#24618f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu báo cáo"}</button></div></form></section> : null}
        <section className="rounded-2xl border border-[#e3eaf2] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 rounded-xl border border-[#edf1f5] bg-[#f8fbfd] p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-medium text-slate-500">Từ ngày<input type="date" value={reportFrom} onChange={(event) => setReportFrom(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm text-slate-700" /></label><label className="text-xs font-medium text-slate-500">Đến ngày<input type="date" value={reportTo} onChange={(event) => setReportTo(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm text-slate-700" /></label><label className="text-xs font-medium text-slate-500">Trạng thái<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm text-slate-700"><option value="">Tất cả trạng thái</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="text-xs font-medium text-slate-500">Dự án<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm text-slate-700"><option value="">Tất cả dự án</option>{projects.map((project) => <option key={project} value={project}>{project}</option>)}</select></label></div></div><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-xl font-semibold text-[#173554]">Danh sách báo cáo lỗi</h3><p className="mt-1 text-sm text-slate-500">Tổng số record trong database: {total}</p></div><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm báo cáo..." className="h-10 w-full rounded-lg border border-[#d7e2f1] pl-9 pr-3 text-sm sm:w-72" /></label></div><div className="overflow-x-auto rounded-xl border border-[#d7e2f1]"><table className="min-w-[2050px] divide-y divide-[#d7e2f1] text-left text-sm"><thead className="bg-[#f8fbfd] text-xs uppercase tracking-wide text-slate-500"><tr><th className="sticky left-0 z-10 bg-[#f8fbfd] px-3 py-3">Thao tác</th>{fields.map((field) => <th key={field.key} className={`px-3 py-3 ${field.wide ? "min-w-[280px]" : "min-w-[150px]"}`}>{field.label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f5]">{loading ? <tr><td colSpan={fields.length + 1} className="px-3 py-10 text-center text-slate-400">Đang tải dữ liệu...</td></tr> : rows.length ? rows.map((row) => <tr key={row.id} className="align-top hover:bg-[#fbfdff]"><td className="sticky left-0 whitespace-nowrap bg-white px-3 py-3"><div className="flex min-w-[190px] flex-col gap-2"><select aria-label={`Trạng thái báo cáo ${row.sequence || row.id}`} value={row.status || "Chưa xử lý"} onChange={(event) => void updateStatus(row, event.target.value as Status)} className={`h-8 rounded-md border px-2 text-xs font-medium text-slate-800 ${statusClass(row.status || "Chưa xử lý")}`}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><div className="flex gap-2"><button type="button" onClick={() => edit(row)} aria-label={`Sửa báo cáo ${row.sequence || row.id}`} className="rounded-lg bg-[#eaf4fb] p-2 text-[#24618f]"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void remove(row)} aria-label={`Xóa báo cáo ${row.sequence || row.id}`} className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></div></td>{fields.map((field) => <td key={field.key} className="max-w-[300px] whitespace-pre-wrap px-3 py-3 text-slate-600">{String(row[field.key] ?? "") || "—"}</td>)}</tr>) : <tr><td colSpan={fields.length + 1} className="px-3 py-12 text-center text-slate-400"><Bug className="mx-auto mb-2 h-8 w-8" />Chưa có báo cáo lỗi nào.</td></tr>}</tbody></table></div></section>
        <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-3 text-sm text-slate-500">{loadingMore ? <Loader2 className="h-8 w-8 animate-spin" aria-label="Đang tải thêm" /> : rows.length >= total && total > 0 ? "Đã hiển thị toàn bộ record" : null}</div>
      </div>
      {showStats ? <TechnicalReportsStats onClose={() => setShowStats(false)} /> : null}
    </main>
  );
}
