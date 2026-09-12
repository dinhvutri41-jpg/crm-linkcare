import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const expectedEmail = process.env.CRM_LOGIN_EMAIL?.trim();
  const expectedPassword = process.env.CRM_LOGIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return NextResponse.json({ error: "Chưa cấu hình tài khoản đăng nhập." }, { status: 503 });
  if (body?.email?.trim().toLowerCase() !== expectedEmail.toLowerCase() || body?.password !== expectedPassword) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set("linkcare_session", "authenticated", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
