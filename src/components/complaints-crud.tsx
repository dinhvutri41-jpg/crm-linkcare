"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  Pencil,
  Plus,
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

export function ComplaintsCrud() {
  const [rows, setRows] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [receivedTo, setReceivedTo] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [privilegeFilter, setPrivilegeFilter] = useState("");
  const [draft, setDraft] = useState<Complaint | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

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
    const query = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) query.set("search", search);
    if (receivedFrom) query.set("receivedFrom", receivedFrom);
    if (receivedTo) query.set("receivedTo", receivedTo);
    if (projectFilter) query.set("project", projectFilter);
    if (privilegeFilter) query.set("privilege", privilegeFilter);
    if (receivedFrom && receivedTo && receivedFrom > receivedTo) {
      notify("Ngày bắt đầu không được lớn hơn ngày kết thúc.", "error");
      setLoading(false);
      return;
    }
    const response = await fetch(`/api/complaints?${query}`);
    if (response.ok) {
      const data: ListResult = await response.json();
      setRows(data.rows);
      setTotal(data.total);
    } else notify("Không thể tải danh sách khiếu nại.", "error");
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, [page, search, receivedFrom, receivedTo, projectFilter, privilegeFilter]);

  useEffect(() => {
    const handleResolved = () => void load();
    window.addEventListener("management-notification-resolved", handleResolved);
    return () => window.removeEventListener("management-notification-resolved", handleResolved);
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

  const pages = Math.max(1, Math.ceil(total / 20));
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
              <Plus className="h-4 w-4" /> Tạo record
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
              <BarChart3 className="h-4 w-4" /> Show report
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
                {saving ? "Đang lưu..." : "Lưu record"}
              </button>
            </div>
          </form>
        ) : null}
        <section className="rounded-2xl border border-[#d7e2f1] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#173554]">
                Danh sách khiếu nại
              </h3>
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
                      className="min-w-36 px-3 py-3 font-medium"
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ebf2]">
                {rows.map((row) => (
                  <tr key={row.id} className={(row.managementOpinion.trim() || row.teamLeaderOpinion.trim()) && !row.managementResolved ? "complaint-management-row" : undefined}>
                    <td className="sticky left-0 z-[1] whitespace-nowrap bg-white px-3 py-3 shadow-[6px_0_10px_-10px_rgba(15,23,42,.35)]">
                      <button
                        title="Sửa"
                        onClick={() => setDraft({ ...row })}
                        className="mr-1 rounded-lg p-2 text-[#24618f] hover:bg-[#eaf4fb]"
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
                    </td>
                    {fields.map((field) => (
                      <td key={field.key} className="max-w-72 px-3 py-3 align-top">
                        {row[field.key] || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
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
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{loading ? "Đang tải..." : `${total} record`}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border border-[#d7e2f1] px-3 py-2 disabled:opacity-40"
              >
                Trước
              </button>
              <span>
                {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border border-[#d7e2f1] px-3 py-2 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      </div>
      <ComplaintsReport open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
