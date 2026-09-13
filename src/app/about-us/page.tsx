import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Crown, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OrgScrollReveal } from "@/components/org-scroll-reveal";
import { OrgPeopleCounter } from "@/components/org-people-counter";

type Person = { name: string; role: string; note?: string };
type Team = { name: string; accent: string; people: Person[] };

const leadership: Person[] = [
  { name: "Phạm Ngọc Thiên Kim", role: "CEO VIP Booking 24H" },
  { name: "Tống Thị Hồng Đào", role: "TP. Phát triển" },
  { name: "Nguyễn Tường Vy", role: "Giám sát DVKH" },
  { name: "Nguyễn Đoàn Nhật Quỳnh", role: "HR" },
  { name: "Phạm Ngọc Minh Thư", role: "Admin" },
];

const teams: Team[] = [
  { name: "VCB", accent: "coral", people: [{ name: "Phạm Ngọc Phương Vy", role: "Team Leader" }, { name: "Phạm Nguyễn Huyền Đoan", role: "CS" }, { name: "Trần Thiên Vy", role: "CS" }, { name: "Cao Thị Mỹ Viên", role: "CS" }, { name: "Võ Thị Kim Hoàng", role: "CS" }, { name: "Phạm Thị Bích Trâm", role: "CS ca đêm" }, { name: "Hồng Thị Cẩm Hương", role: "CS" }] },
  { name: "TCB", accent: "blue", people: [{ name: "Đỗ Thị Hồng Nhung", role: "Team Leader" }, { name: "Đặng Thị Phương", role: "CS" }, { name: "Phan Thị Thúy Nhiên", role: "CS" }, { name: "Lê Nguyễn Lâm Nghi", role: "CS" }, { name: "Nguyễn Minh Anh", role: "CS" }] },
  { name: "UOB - TCL", accent: "mint", people: [{ name: "Nguyễn Tường Vy", role: "Team Leader", note: "Kiêm nhiệm" }, { name: "Đoàn Thị Nguyệt Quế", role: "CS" }, { name: "Nguyễn Văn Thanh Nhật", role: "CS" }, { name: "Huỳnh Hồng Kim Liên", role: "CS" }] },
  { name: "BIDV", accent: "amber", people: [{ name: "Đinh Thị Thanh Hoa", role: "Team Leader" }, { name: "Vũ Thị Lan Hương", role: "CS" }, { name: "Lưu Thị Hồng Đoan", role: "CS" }, { name: "Phùng Bảo Nhi", role: "CS" }, { name: "Phạm Ngọc Quỳnh Như", role: "CS" }, { name: "Nguyễn Thị Quỳnh Anh", role: "CS" }, { name: "Nguyễn Thị Hiền", role: "CS" }, { name: "Trần Thị Thúy Niềm", role: "CS" }] },
  { name: "VTB", accent: "violet", people: [{ name: "Lê Mỹ Tú Anh", role: "Team Leader" }, { name: "Nguyễn Thị Thiện Hoàng", role: "CS" }, { name: "Quách Mỹ Quyên", role: "CS" }, { name: "Trương Thị Thu Tuyết", role: "CS" }, { name: "Mai Khánh Hà", role: "CS" }, { name: "Lê Thị Cẩm Tiên", role: "CS ca đêm" }] },
  { name: "ELITE", accent: "rose", people: [{ name: "Lý Mỹ Trân", role: "Team Leader" }, { name: "Trần Nguyễn Khánh Linh", role: "CS" }] },
];

export default function AboutUsPage() {
  const totalPeople = new Set([...leadership, ...teams.flatMap((team) => team.people)].map((person) => person.name)).size;
  return <AppShell><main className="org-page mx-auto max-w-[1380px] px-5 py-6 sm:px-8 sm:py-8">
    <div className="mb-6 flex items-center justify-between gap-4"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#24618f]"><ArrowLeft className="h-4 w-4" /> Tổng quan</Link><span className="org-live-pill"><i /> Organization map</span></div>
    <section className="org-hero relative overflow-hidden rounded-[2rem] px-6 py-9 text-white sm:px-10 sm:py-12"><div className="org-hero-grid" /><div className="relative z-10 max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-100/75">VIP BOOKING 24H · PEOPLE & OPERATIONS</p><h1 className="mt-4 text-4xl font-semibold leading-none tracking-[-.04em] sm:text-6xl">Một đội ngũ.<br /><span className="text-[#ffb39b]">Một nhịp vận hành.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/75 sm:text-base">Đội ngũ nhân sự VIP BOOKING 24H - Những con người luôn nỗ lực để kết nối dịch vụ, khách hàng và trải nghiệm VIP mỗi ngày</p></div><div className="org-hero-ring org-hero-ring-one" /><div className="org-hero-ring org-hero-ring-two" /><div className="org-hero-stat absolute bottom-7 right-8 hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md lg:block"><OrgPeopleCounter value={totalPeople} /><span>people in motion</span></div></section>
    <OrgScrollReveal><section className="org-map mt-8"><div className="org-map-line" /><div className="org-leadership"><div className="org-section-label"><Crown className="h-4 w-4" /> Leadership & backbone</div><div className="org-people-grid">{leadership.map((person, index) => <PersonCard key={person.name} person={person} index={index} primary />)}</div></div><div className="mt-12"><div className="org-section-label"><Users className="h-4 w-4" /> Service teams</div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{teams.map((team, index) => <TeamCard key={team.name} team={team} index={index} />)}</div></div></section></OrgScrollReveal>
  </main></AppShell>;
}

function PersonCard({ person, index, primary = false }: { person: Person; index: number; primary?: boolean }) {
  return <article className={`org-person-card ${primary ? "org-person-primary" : ""}`} style={{ "--org-delay": `${index * 70}ms` } as React.CSSProperties}><span className="org-avatar">{person.name.split(" ").map((part) => part[0]).slice(-2).join("")}</span><div className="min-w-0"><h3>{person.name}</h3><p>{person.role}</p>{person.note ? <small>{person.note}</small> : null}</div></article>;
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  return <article className={`org-team-card org-team-${team.accent}`} style={{ "--org-delay": `${index * 90}ms` } as React.CSSProperties}><header><span className="org-team-icon"><BriefcaseBusiness className="h-4 w-4" /></span><div><h2>{team.name}</h2><p>{team.people.length} thành viên</p></div></header><div className="org-team-list">{team.people.map((person, personIndex) => <PersonCard key={`${team.name}-${person.name}`} person={person} index={personIndex} />)}</div></article>;
}
