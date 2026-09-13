import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FileWarning,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ActivityFeed } from "@/components/activity-feed";
import { ComplaintsOpenMetric } from "@/components/complaints-open-metric";
import { CoursesCountMetric } from "@/components/courses-count-metric";

export function Overview() {
  return (
    <AppShell>
      <main className="overview-page mx-auto max-w-[1380px] px-5 py-6 sm:px-8 sm:py-8">
        <section className="overview-hero relative overflow-hidden rounded-[2rem] px-6 py-8 text-white shadow-[0_24px_70px_rgba(16,43,78,.22)] sm:px-10 sm:py-11">
          <div className="overview-hero-grid" />
          <span className="overview-orbit overview-orbit-one" />
          <span className="overview-orbit overview-orbit-two" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.17em] text-cyan-100"><Sparkles className="h-3.5 w-3.5" /> VIP BOOKING 24H</div>
            <h2 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-.03em] sm:text-6xl">Mọi việc vận hành, trong tầm nhìn.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100/75 sm:text-base">Một không gian gọn để đội ngũ theo dõi khiếu nại, cập nhật kiến thức và đưa ra quyết định nhanh hơn mỗi ngày.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/complaints" className="inline-flex items-center gap-2 rounded-xl bg-[#ff8b68] px-4 py-3 text-sm font-bold text-[#3d2030] shadow-lg shadow-[#ff8b68]/20 transition hover:-translate-y-0.5 hover:bg-[#ff9c7d]"><Plus className="h-4 w-4" /> Tạo khiếu nại</Link>
              <Link href="/learning" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">Mở E-learning <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="overview-hero-console absolute bottom-7 right-8 hidden w-[280px] rounded-2xl border border-white/15 bg-[#071d39]/65 p-4 backdrop-blur-md lg:block">
            <div className="flex items-center justify-between text-xs text-blue-100/60"><span>LIVE OVERVIEW</span><span className="flex items-center gap-1.5 text-emerald-300"><i className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Connected</span></div>
            <div className="mt-5 flex items-end gap-2"><strong className="text-4xl tracking-tight">94.8%</strong><span className="mb-1 text-xs text-emerald-300">+12.4%</span></div>
            <p className="mt-1 text-xs text-blue-100/50">Service health this month</p>
            <div className="overview-sparkline mt-5">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
          </div>
        </section>

        <section className="-mt-7 relative z-10 grid gap-4 px-3 sm:grid-cols-3 sm:px-7">
          <ComplaintsOpenMetric />
          <CoursesCountMetric />
          <Link href="/about-us" className="overview-metric block rounded-2xl border border-[#e0e8ef] bg-white p-4 shadow-[0_12px_30px_rgba(26,62,95,.08)] transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><span className="overview-metric-icon overview-metric-amber"><Users /></span><span className="text-xs font-bold text-[#c98b36]">Đội ngũ</span></div><p className="mt-4 text-xs text-slate-500">Đội ngũ hoạt động</p><p className="mt-1 text-2xl font-semibold tracking-tight text-[#173554]">36</p></Link>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-[#e0e8ef] bg-white p-5 shadow-[0_12px_35px_rgba(26,62,95,.05)] sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#5b9bc0]">Today at VIP BOOKING 24H</p><h3 className="mt-1.5 text-xl font-semibold text-[#173554]">Dòng hoạt động</h3></div><Link href="/complaints" className="text-xs font-semibold text-[#24618f]">Xem tất cả <ChevronRight className="inline h-3.5 w-3.5" /></Link></div>
            <ActivityFeed />
          </div>
          <div className="rounded-2xl bg-[#fff8f0] p-5 shadow-[0_12px_35px_rgba(140,83,35,.06)] sm:p-6">
            <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#c68242]">Quick start</p><h3 className="mt-1.5 text-xl font-semibold text-[#4c3122]">Điểm đến hôm nay</h3></div><span className="rounded-xl bg-white p-2.5 text-[#d88632] shadow-sm"><ArrowUpRight className="h-5 w-5" /></span></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><QuickLink href="/complaints" icon={<FileWarning />} title="Xử lý khiếu nại" detail="Mở workspace dữ liệu" /><QuickLink href="/learning" icon={<BookOpen />} title="Tiếp tục đào tạo" detail="Xem thư viện nội bộ" /></div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Metric({ icon, label, value, change, tone }: { icon: React.ReactNode; label: string; value: string; change: string; tone: "coral" | "mint" | "amber" }) {
  return <div className="overview-metric rounded-2xl border border-[#e0e8ef] bg-white p-4 shadow-[0_12px_30px_rgba(26,62,95,.08)]"><div className="flex items-center justify-between"><span className={`overview-metric-icon overview-metric-${tone}`}>{icon}</span><span className={`text-xs font-bold ${tone === "coral" ? "text-[#e2765b]" : tone === "mint" ? "text-[#3d9b78]" : "text-[#c98b36]"}`}>{change}</span></div><p className="mt-4 text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-[#173554]">{value}</p></div>;
}

function QuickLink({ href, icon, title, detail }: { href: "/complaints" | "/learning"; icon: React.ReactNode; title: string; detail: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl border border-[#f0dfcd] bg-white/70 p-3 transition hover:-translate-y-0.5 hover:bg-white"><span className="rounded-lg bg-[#fff0df] p-2 text-[#d88633]">{icon}</span><span className="flex-1"><strong className="block text-sm text-[#4c3122]">{title}</strong><small className="mt-0.5 block text-xs text-[#a57c5b]">{detail}</small></span><ChevronRight className="h-4 w-4 text-[#d5a476]" /></Link>;
}
