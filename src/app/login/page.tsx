"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      window.location.assign("/");
      return;
    }
    const data = await response.json().catch(() => null) as { error?: string } | null;
    setError(data?.error || "Email hoặc mật khẩu không đúng.");
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(74,163,223,.25),transparent_35%),linear-gradient(135deg,#102b4e,#1d527d)] px-5 py-10">
    <section className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-8 shadow-2xl sm:p-10">
      <div className="mb-8 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#24618f] text-xl font-bold text-white">L</span><div><p className="font-semibold text-[#173554]">LinkCare CRM</p><p className="text-xs uppercase tracking-[.18em] text-slate-400">Operations workspace</p></div></div>
      <h1 className="text-2xl font-semibold text-[#173554]">Đăng nhập</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Đăng nhập để quản lý dữ liệu khiếu nại và vận hành LinkCare.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-600">Email</span><span className="relative block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="team@linkcare.vn" className="h-11 w-full rounded-xl border border-[#d7e2f1] pl-10 pr-3 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/15" /></span></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-600">Mật khẩu</span><span className="relative block"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" className="h-11 w-full rounded-xl border border-[#d7e2f1] pl-10 pr-3 text-sm outline-none focus:border-[#24618f] focus:ring-2 focus:ring-[#24618f]/15" /></span></label>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#24618f] text-sm font-semibold text-white transition hover:bg-[#1d527d] disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Đang xác thực" /> : <>Đăng nhập<ArrowRight className="h-4 w-4" /></>}</button>
      </form>
    </section>
  </main>;
}
