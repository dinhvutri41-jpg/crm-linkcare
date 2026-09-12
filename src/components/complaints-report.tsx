"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Building2, CalendarDays, Gift, X } from "lucide-react";

export type ComplaintReport = {
  total: number;
  byMonth: Array<{ month: string; total: number }>;
  byProject: Array<{ project: string; total: number }>;
  byPrivilege: Array<{ privilege: string; total: number }>;
};

const barBlue = "#2563eb";
const barRed = "#ef4444";
const pieColors = [
  "#2563eb",
  "#0ea5e9",
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#64748b",
  "#14b8a6",
];
const reportProjects = ["BIDV", "Vietcombank", "Vietinbank", "Techcombank", "UOB", "TechcomLife"];
const reportPrivileges = ["Phòng chờ trong nước", "Phòng chờ Toàn Cầu", "FastTrack", "Ẩm thực", "Nghỉ dưỡng", "Golf", "Sức khoẻ", "Giáo Dục", "Concierge", "Khác", "Không xác định"];

function formatMonth(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value || "Không xác định";
  return `Thg ${Number(match[2])}/${match[1]}`;
}

function share(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function peak<T>(rows: T[], getTotal: (row: T) => number) {
  return rows.reduce<T | null>((best, row) => {
    if (!best || getTotal(row) > getTotal(best)) return row;
    return best;
  }, null);
}

export function ComplaintsReport({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [report, setReport] = useState<ComplaintReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [project, setProject] = useState("");
  const [privilege, setPrivilege] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedProject, setAppliedProject] = useState("");
  const [appliedPrivilege, setAppliedPrivilege] = useState("");

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const query = new URLSearchParams();
    if (appliedFrom) query.set("from", appliedFrom);
    if (appliedTo) query.set("to", appliedTo);
    if (appliedProject) query.set("project", appliedProject);
    if (appliedPrivilege) query.set("privilege", appliedPrivilege);
    void fetch(`/api/summary${query.toString() ? `?${query}` : ""}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải báo cáo.");
        return (await response.json()) as ComplaintReport;
      })
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch(() => {
        if (!cancelled) {
          setReport(null);
          setError("Không thể tải báo cáo khiếu nại.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, appliedFrom, appliedTo, appliedProject, appliedPrivilege]);

  function applyDateFilter() {
    if (fromDate && toDate && fromDate > toDate) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    setError("");
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedProject(project);
    setAppliedPrivilege(privilege);
  }

  function clearDateFilter() {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    setProject("");
    setPrivilege("");
    setAppliedProject("");
    setAppliedPrivilege("");
    setError("");
  }

  const months = useMemo(
    () =>
      (report?.byMonth ?? []).map((row) => ({
        ...row,
        label: formatMonth(row.month),
      })),
    [report],
  );
  const projects = report?.byProject ?? [];
  const privileges = report?.byPrivilege ?? [];
  const topProject = peak(projects, (row) => row.total);
  const topMonth = peak(months, (row) => row.total);
  const topPrivilege = peak(privileges, (row) => row.total);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-gray-900/50 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-report-title"
        className="mosaic-modal relative my-2 w-full max-w-6xl rounded-2xl bg-gray-100 shadow-2xl sm:my-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-500">
              Analytics
            </p>
            <h2
              id="complaint-report-title"
              className="mt-1 text-2xl font-bold text-gray-800"
            >
              Báo cáo khiếu nại
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {report
                ? `${report.total.toLocaleString("vi-VN")} record được thống kê từ database.`
                : "Thống kê dự án, tháng và đặc quyền bị khiếu nại nhiều nhất."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-end rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700 sm:self-auto"
            aria-label="Đóng báo cáo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-end sm:px-6">
          <label className="flex-1 text-xs font-semibold text-gray-500">
            Từ ngày
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>
          <label className="flex-1 text-xs font-semibold text-gray-500">
            Đến ngày
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>
          <label className="flex-1 text-xs font-semibold text-gray-500">
            Dự án
            <select value={project} onChange={(event) => setProject(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
              <option value="">Tất cả dự án</option>
              {reportProjects.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="flex-1 text-xs font-semibold text-gray-500">
            Đặc quyền
            <select value={privilege} onChange={(event) => setPrivilege(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
              <option value="">Tất cả đặc quyền</option>
              {reportPrivileges.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button type="button" onClick={applyDateFilter} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Lọc báo cáo
          </button>
          <button type="button" onClick={clearDateFilter} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Xoá lọc
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6 p-4 sm:p-6">
          {error ? (
            <div className="col-span-full rounded-xl bg-white px-5 py-10 text-center text-sm text-red-600 shadow-xs">
              {error}
            </div>
          ) : loading && !report ? (
            [0, 1, 2].map((item) => (
              <div
                key={item}
                className="col-span-full h-72 animate-pulse rounded-xl bg-white shadow-xs xl:col-span-4"
              />
            ))
          ) : report && report.total === 0 ? (
            <div className="col-span-full rounded-xl bg-white px-5 py-14 text-center text-sm text-gray-400 shadow-xs">
              Chưa có dữ liệu khiếu nại để thống kê.
            </div>
          ) : report ? (
            <>
              <article className="col-span-full flex flex-col bg-white shadow-xs rounded-xl xl:col-span-4">
                <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h3 className="font-semibold text-gray-800">
                    Dự án khiếu nại nhiều nhất
                  </h3>
                  <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
                    <Building2 className="h-4 w-4" />
                  </span>
                </header>
                <div className="px-5 pt-4">
                  <div className="mb-1 text-xs font-semibold uppercase text-gray-400">
                    {topProject?.project || "Chưa có dữ liệu"}
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 text-3xl font-bold text-gray-800">
                      {(topProject?.total ?? 0).toLocaleString("vi-VN")}
                    </div>
                    {topProject ? (
                      <div className="rounded-full bg-violet-500/20 px-1.5 text-sm font-medium text-violet-700">
                        {share(topProject.total, report.total)}%
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="h-52 px-2 pb-2 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projects}
                        dataKey="total"
                        nameKey="project"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={2}
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {projects.map((row, index) => (
                          <Cell
                            key={row.project}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value ?? 0).toLocaleString("vi-VN")} (${share(Number(value ?? 0), report.total)}%)`,
                          String(name),
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-5 pb-5">
                  {projects.slice(0, 6).map((row, index) => (
                    <div
                      key={row.project}
                      className="flex min-w-0 items-center gap-2 text-xs text-gray-600"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: pieColors[index % pieColors.length],
                        }}
                      />
                      <span className="truncate">{row.project}</span>
                      <b className="ml-auto text-gray-800">{row.total}</b>
                    </div>
                  ))}
                </div>
              </article>

              <article className="col-span-full flex flex-col bg-white shadow-xs rounded-xl xl:col-span-4">
                <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h3 className="font-semibold text-gray-800">
                    Tổng số case khiếu nại
                  </h3>
                  <span className="rounded-lg bg-sky-50 p-2 text-sky-600">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                </header>
                <div className="px-5 pt-4">
                  <div className="mb-1 text-xs font-semibold uppercase text-gray-400">
                    Tổng trong phạm vi lọc
                  </div>
                  <div className="flex items-start">
                    <div className="text-3xl font-bold text-gray-800">
                      {report.total.toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
                <div className="h-52 grow px-2 pb-3 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={months} barSize={18}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-32}
                        textAnchor="end"
                        height={48}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(37,99,235,.06)" }}
                        formatter={(value) => [
                          Number(value ?? 0).toLocaleString("vi-VN"),
                          "Khiếu nại",
                        ]}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {months.map((row) => (
                          <Cell
                            key={row.month}
                            fill={
                              row.total === topMonth?.total ? barRed : barBlue
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="col-span-full flex flex-col bg-white shadow-xs rounded-xl xl:col-span-4">
                <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h3 className="font-semibold text-gray-800">
                    Đặc quyền có nhiều khiếu nại nhất
                  </h3>
                  <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <Gift className="h-4 w-4" />
                  </span>
                </header>
                <div className="px-5 pt-4">
                  <div className="mb-1 text-xs font-semibold uppercase text-gray-400">
                    {topPrivilege?.privilege || "Chưa có dữ liệu"}
                  </div>
                  <div className="flex items-start">
                    <div className="text-3xl font-bold text-gray-800">
                      {(topPrivilege?.total ?? 0).toLocaleString("vi-VN")}
                    </div>
                    {topPrivilege ? (
                      <div className="rounded-full bg-red-500/20 px-1.5 text-sm font-medium text-red-700">
                        {share(topPrivilege.total, report.total)}%
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="h-52 grow px-2 pb-3 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={privileges} barSize={18}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="privilege"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-32}
                        textAnchor="end"
                        height={48}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(37,99,235,.06)" }}
                        formatter={(value) => [
                          Number(value ?? 0).toLocaleString("vi-VN"),
                          "Khiếu nại",
                        ]}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {privileges.map((row) => (
                          <Cell
                            key={row.privilege}
                            fill={
                              row.total === topPrivilege?.total
                                ? barRed
                                : barBlue
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 text-xs text-gray-400 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Mosaic-style analytics
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
