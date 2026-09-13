"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  Bug,
  ChevronRight,
  Database,
  FileWarning,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type ManagementNotification = {
  id: number;
  project: string;
  receivedDate: string;
  bookingCode: string;
  customer: string;
  managementOpinion: string;
  teamLeaderOpinion: string;
  complaintContent: string;
  updatedAt: string;
};

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const LAST_ACTIVITY_KEY = "linkcare_last_activity";

const navigation = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/complaints", label: "Báo cáo khiếu nại", icon: FileWarning },
  { href: "/technical-reports", label: "Báo cáo lỗi kĩ thuật", icon: Bug },
  { href: "/learning", label: "E-learning", icon: GraduationCap },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<ManagementNotification[]>(
    [],
  );
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<ManagementNotification | null>(null);
  const [resolving, setResolving] = useState(false);

  async function loadNotifications() {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as {
        notifications: ManagementNotification[];
      };
      setNotifications(data.notifications);
    }
  }

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 5000);
    const handleOpinionUpdate = () => void loadNotifications();
    window.addEventListener("management-opinion-updated", handleOpinionUpdate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("management-opinion-updated", handleOpinionUpdate);
    };
  }, []);

  useEffect(() => {
    let lastPersisted = 0;
    let expired = false;

    const logoutForIdle = async () => {
      if (expired) return;
      expired = true;
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/login?reason=idle");
    };

    const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
    if (storedActivity && Date.now() - storedActivity >= IDLE_TIMEOUT_MS) {
      void logoutForIdle();
      return;
    }

    const markActivity = () => {
      const now = Date.now();
      if (now - lastPersisted < 10_000) return;
      lastPersisted = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    };
    markActivity();

    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;
    activityEvents.forEach((event) => window.addEventListener(event, markActivity, { passive: true }));
    const idleCheck = window.setInterval(() => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
      if (lastActivity && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) void logoutForIdle();
    }, 15_000);

    return () => {
      window.clearInterval(idleCheck);
      activityEvents.forEach((event) => window.removeEventListener(event, markActivity));
    };
  }, []);

  async function resolveNotification() {
    if (!selectedNotification) return;
    setResolving(true);
    const response = await fetch(`/api/notifications/${selectedNotification.id}`, { method: "PATCH" });
    if (response.ok) {
      setNotifications((current) => current.filter((item) => item.id !== selectedNotification.id));
      window.dispatchEvent(new CustomEvent("management-notification-resolved", { detail: { id: selectedNotification.id } }));
      setSelectedNotification(null);
    }
    setResolving(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  function closeNotificationDetail() {
    if (!selectedNotification) return;
    const id = selectedNotification.id;
    setSelectedNotification(null);
    if (pathname === "/complaints") window.dispatchEvent(new CustomEvent("focus-complaint-record", { detail: { id } }));
    else window.location.assign(`/complaints?recordId=${id}`);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-[#e4eaf2] bg-[#102b4e] text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4aa3df] text-lg font-bold">
              L
            </span>
            <span>
              <strong className="block text-[15px] tracking-wide">
                VIP BOOKING 24H
              </strong>
              <small className="block text-[10px] uppercase tracking-[.2em] text-blue-200/70">
                CRM workspace
              </small>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 px-4 py-7">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200/50">
            Workspace
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#2d6fa8] text-white shadow-lg shadow-black/10" : "text-blue-100/70 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${active ? "text-white" : "text-blue-200/60"}`}
                  />
                  <span>{item.label}</span>
                  {active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
                </Link>
              );
            })}
          </nav>
          <p className="px-3 pb-3 pt-9 text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200/50">
            Hệ thống
          </p>
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/50">
              <Database className="h-[18px] w-[18px]" /> Kết nối dữ liệu
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/50">
              <Settings className="h-[18px] w-[18px]" /> Cài đặt
            </button>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9edf9] text-sm font-bold text-[#1d5f8f]">
              TV
            </div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">VIP BOOKING 24H team</p><p className="truncate text-xs text-blue-100/50">Operations</p></div><button onClick={() => void logout()} className="ml-auto rounded-lg p-2 text-blue-100/60 hover:bg-white/10 hover:text-white" aria-label="Đăng xuất"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      {mobileOpen ? (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Đóng menu"
        />
      ) : null}
      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e4eaf2] bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[#315172] hover:bg-[#eef4f9] lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                VIP BOOKING 24H /{" "}
                {pathname === "/complaints" ? "Báo cáo khiếu nại" : pathname === "/technical-reports" ? "Báo cáo lỗi kĩ thuật" : pathname.startsWith("/learning") ? "E-learning" : "Tổng quan"}
              </p>
              <h1 className="mt-0.5 text-lg font-semibold text-[#173554]">
                {pathname === "/complaints"
                  ? "Quản lý khiếu nại"
                  : pathname === "/technical-reports" ? "Báo cáo lỗi kĩ thuật" : pathname.startsWith("/learning") ? "Đào tạo nội bộ" : "Tổng quan vận hành"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-[#edf8f2] px-3 py-1.5 text-xs font-medium text-[#28744a] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3cb371]" />{" "}
              Database connected
            </span>
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-[#eef4f9]"
              aria-label={`Thông báo ${notifications.length}`}
            >
              <Bell className={`h-5 w-5 ${pathname === "/" && notifications.length > 0 ? "notification-bell-attention" : ""}`} />
              {notifications.length ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {notifications.length > 99 ? "99+" : notifications.length}
                </span>
              ) : null}
            </button>
            <BarChart3 className="hidden h-5 w-5 text-slate-400 sm:block" />
          </div>
          {notificationOpen ? (
            <div className="absolute right-5 top-[68px] z-50 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#dbe4ee] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#edf1f5] px-4 py-3">
                <div>
                  <h2 className="font-semibold text-[#173554]">
                    Thông báo quản lý
                  </h2>
                    <p className="text-xs text-slate-500">
                    {notifications.length} record có ý kiến cần xử lý
                  </p>
                </div>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {notifications.length ? (
                  notifications.map((item) => (
                    <article
                      key={item.id}
                      className="cursor-pointer border-b border-[#edf1f5] px-4 py-4 last:border-0 hover:bg-[#f8fbfd]"
                      onClick={() => {
                        setNotificationOpen(false);
                        setSelectedNotification(item);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#173554]">
                            {item.project} ·{" "}
                            {item.bookingCode || "Không có booking"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Ngày tiếp nhận: {item.receivedDate} ·{" "}
                            {item.customer || "Không có thông tin khách hàng"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">
                          {item.teamLeaderOpinion.trim() && item.managementOpinion.trim() ? "2 ý kiến" : item.teamLeaderOpinion.trim() ? "Ý kiến Team Leader" : "Ý kiến quản lý"}
                        </span>
                      </div>
                      {item.teamLeaderOpinion.trim() ? <div className="mt-3 rounded-lg bg-[#fff9db] p-3"><p className="text-xs font-semibold text-amber-900">Ý kiến Team Leader</p><p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-amber-950">{item.teamLeaderOpinion}</p></div> : null}
                      {item.managementOpinion.trim() ? <div className="mt-3 rounded-lg bg-[#e7f5ff] p-3"><p className="text-xs font-semibold text-sky-900">Ý kiến quản lý</p><p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-sky-950">{item.managementOpinion}</p></div> : null}
                      {item.complaintContent ? (
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                          <b>Nội dung khiếu nại:</b> {item.complaintContent}
                        </p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-sm text-slate-400">
                    Chưa có thông báo.
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {selectedNotification ? (
            <div className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px]" onClick={() => closeNotificationDetail()} role="presentation">
              <div className="relative my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="notification-detail-title">
                <div className="flex items-center justify-between border-b border-[#e6edf3] px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-600">Chi tiết thông báo</p><h2 id="notification-detail-title" className="mt-1 text-xl font-semibold text-[#173554]">{selectedNotification.project} · {selectedNotification.bookingCode || "Không có booking"}</h2></div><button onClick={() => closeNotificationDetail()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Đóng chi tiết"><X className="h-5 w-5" /></button></div>
                <div className="space-y-4 px-5 py-5 text-sm"><div className="grid gap-3 sm:grid-cols-2"><Info label="Dự án" value={selectedNotification.project} /><Info label="Mã booking" value={selectedNotification.bookingCode || "Không có"} /><Info label="Ngày tiếp nhận" value={selectedNotification.receivedDate} /><Info label="Khách hàng" value={selectedNotification.customer || "Không có"} /></div>{selectedNotification.teamLeaderOpinion.trim() ? <section className="rounded-xl bg-[#fff9db] p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900">Ý kiến Team Leader</h3><p className="mt-2 whitespace-pre-wrap leading-6 text-amber-950">{selectedNotification.teamLeaderOpinion}</p></section> : null}{selectedNotification.managementOpinion.trim() ? <section className="rounded-xl bg-[#e7f5ff] p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-sky-900">Ý kiến quản lý</h3><p className="mt-2 whitespace-pre-wrap leading-6 text-sky-950">{selectedNotification.managementOpinion}</p></section> : null}<section><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nội dung khiếu nại</h3><p className="mt-2 whitespace-pre-wrap leading-6 text-slate-700">{selectedNotification.complaintContent || "Không có nội dung"}</p></section></div>
                <div className="flex justify-end gap-2 border-t border-[#e6edf3] px-5 py-4"><button onClick={() => closeNotificationDetail()} className="rounded-lg border border-[#d7e2f1] px-4 py-2 text-sm font-medium text-slate-600">Review case</button><button onClick={() => void resolveNotification()} disabled={resolving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{resolving ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Đang cập nhật" /> : "Đã xử lý"}</button></div>
              </div>
            </div>
          ) : null}
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[#f5f8fb] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-medium text-[#173554]">{value}</p></div>;
}
