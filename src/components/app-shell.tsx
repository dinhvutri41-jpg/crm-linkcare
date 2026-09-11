"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronRight, Database, FileWarning, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/complaints", label: "Khiếu nại", icon: FileWarning },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-[#e4eaf2] bg-[#102b4e] text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6"><Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4aa3df] text-lg font-bold">L</span><span><strong className="block text-[15px] tracking-wide">LinkCare</strong><small className="block text-[10px] uppercase tracking-[.2em] text-blue-200/70">CRM workspace</small></span></Link><button onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Đóng menu"><X className="h-5 w-5" /></button></div>
      <div className="flex-1 px-4 py-7"><p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200/50">Workspace</p><nav className="space-y-1">{navigation.map((item) => { const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#2d6fa8] text-white shadow-lg shadow-black/10" : "text-blue-100/70 hover:bg-white/10 hover:text-white"}`}><Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-blue-200/60"}`} /><span>{item.label}</span>{active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}</Link>; })}</nav><p className="px-3 pb-3 pt-9 text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200/50">Hệ thống</p><div className="space-y-1"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/50"><Database className="h-[18px] w-[18px]" /> Kết nối dữ liệu</button><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/50"><Settings className="h-[18px] w-[18px]" /> Cài đặt</button></div></div>
      <div className="border-t border-white/10 px-5 py-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9edf9] text-sm font-bold text-[#1d5f8f]">TV</div><div className="min-w-0"><p className="truncate text-sm font-semibold">LinkCare team</p><p className="truncate text-xs text-blue-100/50">Operations</p></div></div></div>
    </aside>
    {mobileOpen ? <button className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" /> : null}
    <div className="lg:pl-[252px]"><header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e4eaf2] bg-white/90 px-5 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[#315172] hover:bg-[#eef4f9] lg:hidden" aria-label="Mở menu"><Menu className="h-5 w-5" /></button><div><p className="text-xs font-medium text-slate-400">LinkCare CRM / {pathname === "/complaints" ? "Khiếu nại" : "Tổng quan"}</p><h1 className="mt-0.5 text-lg font-semibold text-[#173554]">{pathname === "/complaints" ? "Quản lý khiếu nại" : "Tổng quan vận hành"}</h1></div></div><div className="hidden items-center gap-3 sm:flex"><span className="flex items-center gap-2 rounded-full bg-[#edf8f2] px-3 py-1.5 text-xs font-medium text-[#28744a]"><span className="h-1.5 w-1.5 rounded-full bg-[#3cb371]" /> Database connected</span><BarChart3 className="h-5 w-5 text-slate-400" /></div></header><main>{children}</main></div>
  </div>;
}