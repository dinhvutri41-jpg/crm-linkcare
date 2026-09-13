"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  Loader2,
  ArrowUp,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { ComplaintsReport } from "@/components/complaints-report";

type Complaint = {
  id: number;
  sourceSheet: string;
  project: string;
  receivedDate: string;
  month: string;
  customer: string;
  bookingCode: string;
  privilege: string;
  usageDate: string;
  provider: string;
  complaintContent: string;
  cskhExplanation: string;
  responsibleEmployee: string;
  resolution: string;
  compensation: string;
  damage: string;
  errorType: string;
  improvementProposal: string;
  managementOpinion: string;
  teamLeaderOpinion: string;
  managementResolved: boolean;
  status: string;
};
type ListResult = {
  rows: Complaint[];
  total: number;
  page: number;
  pageSize: number;
};
type Field = {
  key: keyof Complaint;
  label: string;
  wide?: boolean;
  date?: boolean;
};

const fields: Field[] = [
  { key: "project", label: "Dự án" },
  { key: "receivedDate", label: "Ngày tiếp nhận", date: true },
  { key: "customer", label: "Khách hàng" },
  { key: "bookingCode", label: "Mã booking" },
  { key: "privilege", label: "Đặc quyền" },
  { key: "usageDate", label: "Ngày sử dụng", date: true },
  { key: "provider", label: "Nhà cung cấp" },
  { key: "complaintContent", label: "Nội dung khiếu nại", wide: true },
  { key: "cskhExplanation", label: "CSKH giải trình diễn biến", wide: true },
  {
    key: "responsibleEmployee",
    label: "Nhân viên phụ trách / kết quả vi phạm / đã lập biên bản?",
    wide: true,
  },
  { key: "resolution", label: "Kết quả xử lý", wide: true },
  { key: "compensation", label: "Đền bù", wide: true },
  { key: "damage", label: "Thiệt hại", wide: true },
  { key: "errorType", label: "Phân loại lỗi" },
  { key: "improvementProposal", label: "Đề xuất cải tiến", wide: true },
  { key: "managementOpinion", label: "Ý kiến quản lý", wide: true },
  { key: "teamLeaderOpinion", label: "Ý kiến Team Leader", wide: true },
];
const projects = [
  "BIDV",
  "Vietcombank",
  "Vietinbank",
  "Techcombank",
  "UOB",
  "TechcomLife",
  "Elite",
];
const privileges = [
  "Phòng chờ trong nước",
  "Phòng chờ Toàn Cầu",
  "FastTrack",
  "Ẩm thực",
  "Nghỉ dưỡng",
  "Golf",
  "Sức khoẻ",
  "Giáo Dục",
  "Concierge",
  "Khác",
];
const errorTypes = [
  "Lỗi NCC",
  "Lỗi Nghiệp vụ",
  "Lội hệ thống/kỉ thuật",
  "Lỗi vận hành",
  "Khác",
];
const statuses = ["Chưa xử lý", "Đang xử lý", "Hoàn thành"];

function blankComplaint(): Complaint {
  const date = new Date().toISOString().slice(0, 10);
  return {
    id: 0,
    sourceSheet: "manual",
    project: "",
    receivedDate: date,
    month: date.slice(0, 7),
    customer: "",
    bookingCode: "",
    privilege: "",
    usageDate: "",
    provider: "",
    complaintContent: "",
    cskhExplanation: "",
    responsibleEmployee: "",
    resolution: "",
    compensation: "",
    damage: "",
    errorType: "",
    improvementProposal: "",
    managementOpinion: "",
    teamLeaderOpinion: "",
    managementResolved: false,
    status: "Chưa xử lý",
  };
}

function dateInputValue(value: string): string {
  if (!value) return "";
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().slice(0, 10);
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="date"
      value={dateInputValue(value)}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-[#d7e2f1] bg-white px-3 py-2 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/10"
    />
  );
}

function PrivilegeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isOther =
    value === "Khác" || (value !== "" && !privileges.includes(value));
  return (
    <div className="space-y-2">
      <span className="relative block">
        <select
          value={isOther ? "Khác" : value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[#d7e2f1] bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/10"
        >
          <option value="">Chọn đặc quyền</option>
          {privileges.map((privilege) => (
            <option key={privilege} value={privilege}>
              {privilege}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
      {isOther ? (
        <input
          autoFocus
          value={value === "Khác" ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nhập loại đặc quyền khác"
          className="w-full rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/10"
        />
      ) : null}
    </div>
  );
}

function ErrorTypeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isOther = value === "Khác" || (value !== "" && !errorTypes.includes(value));
  return (
    <div className="space-y-2">
      <span className="relative block">
        <select
          value={isOther ? "Khác" : value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[#d7e2f1] bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/10"
        >
          <option value="">Chọn phân loại lỗi</option>
          {errorTypes.map((errorType) => (
            <option key={errorType} value={errorType}>
              {errorType}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
      {isOther ? (
        <input
          autoFocus
          value={value === "Khác" ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nhập loại lỗi khác"
          className="w-full rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/10"
        />
      ) : null}
    </div>
  );
}

function ComplaintCell({ value, wide = false }: { value: string; wide?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLButtonElement | null>(null);
  const displayValue = value || "—";
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    setOverflowing(element.scrollHeight > element.clientHeight + 1);
  }, [value]);
  return <td className={`${wide ? "min-w-[28rem] max-w-[28rem]" : "max-w-72"} complaint-table-cell px-3 py-3 align-top`}><button ref={textRef} type="button" title={overflowing ? displayValue : undefined} onClick={overflowing ? () => setExpanded((current) => !current) : undefined} className={`complaint-cell-text text-left ${!value ? "text-slate-300" : "text-inherit"} ${overflowing ? "is-overflowing" : ""} ${expanded ? "is-expanded" : ""}`}>{displayValue}</button></td>;
}

export function ComplaintsCrud() {
  const [rows, setRows] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [receivedTo, setReceivedTo] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [privilegeFilter, setPrivilegeFilter] = useState("");
  const [hasOpinion, setHasOpinion] = useState(false);
  const [recordId, setRecordId] = useState(() => typeof window === "undefined" ? 0 : Number(new URLSearchParams(window.location.search).get("recordId") || 0));
  const [statusFilter, setStatusFilter] = useState("");
  const [draft, setDraft] = useState<Complaint | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLFormElement | null>(null);

  function notify(message: string, type: "success" | "error") {
    setToast({ message, type });
  }
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function load() {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (search) query.set("search", search);
    if (receivedFrom) query.set("receivedFrom", receivedFrom);
    if (receivedTo) query.set("receivedTo", receivedTo);
    if (projectFilter) query.set("project", projectFilter);
    if (privilegeFilter) query.set("privilege", privilegeFilter);
    if (hasOpinion) query.set("hasOpinion", "true");
    if (recordId > 0) query.set("recordId", String(recordId));
    if (statusFilter) query.set("status", statusFilter);
    if (receivedFrom && receivedTo && receivedFrom > receivedTo) {
      notify("Ngày bắt đầu không được lớn hơn ngày kết thúc.", "error");
      setLoading(false);
      return;
    }
    const response = await fetch(`/api/complaints?${query}`);
    if (response.ok) {
      const data: ListResult = await response.json();
      setRows((current) => page === 1 ? data.rows : [...current, ...data.rows]);
      setTotal(data.total);
    } else notify("Không thể tải danh sách khiếu nại.", "error");
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, [page, search, receivedFrom, receivedTo, projectFilter, privilegeFilter, hasOpinion, statusFilter, recordId]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 420);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || rows.length >= total) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage((current) => current + 1);
    }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, rows.length, total]);

  useEffect(() => {
    const handleResolved = () => void load();
    const handleFocus = (event: Event) => {
      const id = (event as CustomEvent<{ id: number }>).detail?.id;
      if (id) { setRecordId(id); setPage(1); }
    };
    window.addEventListener("management-notification-resolved", handleResolved);
    window.addEventListener("focus-complaint-record", handleFocus);
    return () => { window.removeEventListener("management-notification-resolved", handleResolved); window.removeEventListener("focus-complaint-record", handleFocus); };
  }, [page, search, receivedFrom, receivedTo, projectFilter, privilegeFilter]);

  function change(key: keyof Complaint, value: string) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [key]: value,
            ...(key === "receivedDate" ? { month: value.slice(0, 7) } : {}),
          }
        : current,
    );
  }
  function editComplaint(row: Complaint) {
    setDraft({ ...row });
    window.setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  async function updateStatus(row: Complaint, status: string) {
    const response = await fetch(`/api/complaints/${row.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...row, status }) });
    if (response.ok) { setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item)); notify("Đã cập nhật trạng thái.", "success"); }
    else notify("Không thể cập nhật trạng thái.", "error");
  }

  async function readResponse(response: Response) {
    const text = await response.text();
    try {
      return JSON.parse(text) as { error?: string; imported?: number };
    } catch {
      return { error: `Server trả về HTTP ${response.status}` };
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    const editing = draft.id > 0;
    const response = await fetch(
      editing ? `/api/complaints/${draft.id}` : "/api/complaints",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      },
    );
    const data = await readResponse(response);
    notify(
      response.ok
        ? editing
          ? "Đã cập nhật record."
          : "Đã tạo record và lưu vào database."
        : data.error || "Không thể lưu record.",
      response.ok ? "success" : "error",
    );
    if (response.ok) {
      setDraft(null);
      setPage(1);
      window.dispatchEvent(new CustomEvent("management-opinion-updated"));
      await load();
    }
    setSaving(false);
  }
  async function remove(row: Complaint) {
    if (!window.confirm(`Xoá record ${row.bookingCode || row.id}?`)) return;
    const response = await fetch(`/api/complaints/${row.id}`, {
      method: "DELETE",
    });
    notify(
      response.ok ? "Đã xoá record." : "Không thể xoá record.",
      response.ok ? "success" : "error",
    );
    if (response.ok) await load();
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/import", { method: "POST", body });
    const data = await readResponse(response);
    notify(
      response.ok
        ? `Đã import ${data.imported ?? 0} record.`
        : data.error || "Import thất bại.",
      response.ok ? "success" : "error",
    );
    if (response.ok) await load();
  }
  async function exportFile() {
    const response = await fetch(
      `/api/complaints/export${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    );
    if (!response.ok) {
      const data = await readResponse(response);
      notify(data.error || "Không thể xuất Excel.", "error");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkcare-complaints-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Đã tải file Excel thành công.", "success");
  }

  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function refreshList() {
    setRefreshing(true);
    setRecordId(0);
    setPage(1);
    window.history.replaceState(null, "", "/complaints");
    window.setTimeout(() => setRefreshing(false), 500);
  }
  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1800px] px-5 py-7 sm:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#4a91c3]">
              Complaint workspace
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#173554]">
              Dữ liệu khiếu nại
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tạo record, lưu database và quản lý danh sách khiếu nại.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDraft(blankComplaint())}
              className="inline-flex items-center gap-2 rounded-xl bg-[#24618f] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Tạo case mới
            </button>
            <button
              onClick={() => void exportFile()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d7e2f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#24618f]"
            >
              <Download className="h-4 w-4" /> Xuất Excel
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d7e2f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#24618f]"
            >
              <BarChart3 className="h-4 w-4" /> Xem báo cáo
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d7e2f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#24618f]">
              <FileUp className="h-4 w-4" /> Import
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  void importFile(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>
        {toast ? (
          <div
            className={`toast-notification fixed right-5 top-24 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
            role="status"
          >
            <span className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ) : null}
        {draft ? (
          <form
            ref={editorRef}
            id="complaint-editor"
            onSubmit={save}
            className="mb-5 rounded-2xl border border-[#d7e2f1] bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#173554]">
                  {draft.id ? "Chỉnh sửa record" : "Tạo record mới"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Dữ liệu sẽ được lưu trực tiếp vào database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Đóng form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={field.wide ? "md:col-span-2" : ""}
                >
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    {field.label}
                  </span>
                  {field.key === "project" ? (
                    <span className="relative block">
                      <select
                        required
                        value={String(draft[field.key] ?? "")}
                        onChange={(event) =>
                          change(field.key, event.target.value)
                        }
                        className="w-full appearance-none rounded-lg border border-[#d7e2f1] bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/10"
                      >
                        <option value="">Chọn dự án</option>
                        {projects.map((project) => (
                          <option key={project} value={project}>
                            {project}
                          </option>
                        ))}
                        {draft.project && !projects.includes(draft.project) ? (
                          <option value={draft.project}>{draft.project}</option>
                        ) : null}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </span>
                  ) : field.key === "privilege" ? (
                    <PrivilegeField
                      value={String(draft[field.key] ?? "")}
                      onChange={(value) => change(field.key, value)}
                    />
                  ) : field.key === "errorType" ? (
                    <ErrorTypeField
                      value={String(draft[field.key] ?? "")}
                      onChange={(value) => change(field.key, value)}
                    />
                  ) : field.date ? (
                    <DateField
                      value={String(draft[field.key] ?? "")}
                      onChange={(value) => change(field.key, value)}
                    />
                  ) : field.wide ? (
                    <textarea
                      required={field.key === "complaintContent"}
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) =>
                        change(field.key, event.target.value)
                      }
                      className="min-h-20 w-full rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm outline-none focus:border-[#24618f]"
                    />
                  ) : (
                    <input
                      required={field.key === "receivedDate"}
                      type="text"
                      readOnly={field.key === "month"}
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) =>
                        change(field.key, event.target.value)
                      }
                      className="w-full rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm outline-none focus:border-[#24618f]"
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg border border-[#d7e2f1] px-4 py-2 text-sm text-slate-600"
              >
                Huỷ
              </button>
              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#24618f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Đang lưu" /> : "Lưu record"}
              </button>
            </div>
          </form>
        ) : null}
        <section className="rounded-2xl border border-[#d7e2f1] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-3"><h3 className="text-lg font-semibold text-[#173554]">Danh sách khiếu nại</h3><button type="button" onClick={refreshList} className="rounded-lg p-2 text-[#24618f] hover:bg-[#eaf4fb]" title="Làm mới danh sách" aria-label="Làm mới danh sách"> <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></button></div>
              <p className="mt-1 text-xs text-slate-500">
                {total} record đã lưu trong database
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="text-xs font-medium text-slate-500">
                Từ ngày
                <input type="date" value={receivedFrom} onChange={(event) => { setPage(1); setReceivedFrom(event.target.value); }} className="mt-1 h-10 w-full box-border rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm font-normal leading-5 text-slate-700 sm:w-36" />
              </label>
              <label className="text-xs font-medium text-slate-500">
                Đến ngày
                <input type="date" value={receivedTo} onChange={(event) => { setPage(1); setReceivedTo(event.target.value); }} className="mt-1 h-10 w-full box-border rounded-lg border border-[#d7e2f1] px-3 py-2 text-sm font-normal leading-5 text-slate-700 sm:w-36" />
              </label>
              <label className="text-xs font-medium text-slate-500">
                Dự án
                <select value={projectFilter} onChange={(event) => { setPage(1); setProjectFilter(event.target.value); }} className="mt-1 h-10 w-full box-border rounded-lg border border-[#d7e2f1] bg-white px-3 py-2 text-sm font-normal leading-5 text-slate-700 sm:w-36">
                  <option value="">Tất cả dự án</option>
                  {projects.map((project) => <option key={project} value={project}>{project}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-500">
                Đặc quyền
                <select value={privilegeFilter} onChange={(event) => { setPage(1); setPrivilegeFilter(event.target.value); }} className="mt-1 h-10 w-full box-border rounded-lg border border-[#d7e2f1] bg-white px-3 py-2 text-sm font-normal leading-5 text-slate-700 sm:w-44">
                  <option value="">Tất cả đặc quyền</option>
                  {privileges.map((privilege) => <option key={privilege} value={privilege}>{privilege}</option>)}
                </select>
              </label>
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Tìm khiếu nại..." className="h-10 w-full box-border rounded-lg border border-[#d7e2f1] py-2 pl-9 pr-3 text-sm leading-5 sm:w-72" />
              </label>
              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm font-medium text-slate-600">
                <input type="checkbox" checked={hasOpinion} onChange={(event) => { setPage(1); setHasOpinion(event.target.checked); }} className="h-4 w-4 accent-[#24618f]" />
                Khiếu nại có ý kiến
              </label>
              <label className="text-xs font-medium text-slate-500">Trạng thái<select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }} className="mt-1 h-10 w-full rounded-lg border border-[#d7e2f1] bg-white px-3 text-sm font-normal text-slate-700 sm:w-36"><option value="">Tất cả trạng thái</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#e5ebf2]">
            <table className="min-w-[1400px] divide-y divide-[#e5ebf2] text-left text-sm">
              <thead className="bg-[#f5f8fb] text-[#315172]">
                <tr>
                  <th className="sticky left-0 z-10 bg-[#f5f8fb] px-3 py-3">
                    Thao tác
                  </th>
                  {fields.map((field) => (
                    <th
                      key={field.key}
                      className={`${field.key === "complaintContent" ? "min-w-[28rem]" : "min-w-36"} px-3 py-3 font-medium`}
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ebf2]">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="sticky left-0 z-[1] whitespace-nowrap bg-white px-3 py-3 shadow-[6px_0_10px_-10px_rgba(15,23,42,.35)]">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1">
                      <button
                        title="Sửa"
                        onClick={() => editComplaint(row)}
                        className="rounded-lg p-2 text-[#24618f] hover:bg-[#eaf4fb]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Xoá"
                        onClick={() => void remove(row)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                        </div>
                        <select aria-label="Trạng thái xử lý" value={row.status || "Chưa xử lý"} onChange={(event) => void updateStatus(row, event.target.value)} className={`h-8 rounded-md border px-2 text-xs font-medium text-slate-800 ${row.status === "Đang xử lý" ? "border-amber-300 bg-amber-100" : row.status === "Hoàn thành" ? "border-emerald-300 bg-emerald-100" : "border-red-300 bg-red-100"}`}><option value="Chưa xử lý">Chưa xử lý</option><option value="Đang xử lý">Đang xử lý</option><option value="Hoàn thành">Hoàn thành</option></select>
                      </div>
                    </td>
                    {fields.map((field) => <ComplaintCell key={field.key} value={String(row[field.key] ?? "")} wide={field.key === "complaintContent"} />)}
                  </tr>
                ))}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={fields.length + 1}
                      className="px-4 py-14 text-center text-sm text-slate-400"
                    >
                      Chưa có record khiếu nại.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-3 text-sm text-slate-500">
            {loading ? <Loader2 className="h-8 w-8 animate-spin" aria-label="Đang tải thêm" /> : rows.length >= total && total > 0 ? "Đã hiển thị toàn bộ record" : null}
          </div>
        </section>
      </div>
      {showScrollTop ? <button type="button" onClick={scrollToTop} className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#24618f] text-white shadow-lg transition hover:bg-[#1d527d]" aria-label="Cuộn lên đầu trang"><ArrowUp className="h-5 w-5" /></button> : null}
      <ComplaintsReport open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
