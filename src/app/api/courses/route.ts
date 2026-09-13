import { NextRequest, NextResponse } from "next/server";
import { createCourse, listCourses } from "@/lib/learning";

export async function GET() {
  return NextResponse.json(await listCourses());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Tên khóa học là bắt buộc" }, { status: 400 });
  const existing = (await listCourses()).find((course) => course.title.toLowerCase() === title.toLowerCase());
  if (existing) return NextResponse.json({ error: `Dự án ${existing.title} đã có khóa học. Hãy dùng chức năng Sửa.` }, { status: 409 });
  const questions = Array.isArray(body?.questions) ? body.questions.map((item) => { const value = item as Record<string, unknown>; return { question: String(value.question ?? ""), answer: String(value.answer ?? ""), programName: String(value.programName ?? ""), agentSteps: String(value.agentSteps ?? ""), escalationGuidance: String(value.escalationGuidance ?? ""), trainingNotes: String(value.trainingNotes ?? ""), questionLevel: String(value.questionLevel ?? "") }; }) : [];
  const course = await createCourse({ title, description: String(body?.description ?? "").trim(), category: String(body?.category ?? "Đào tạo nội bộ").trim(), level: String(body?.level ?? "Cơ bản").trim(), coverColor: String(body?.coverColor ?? "blue").trim(), agentSteps: String(body?.agentSteps ?? "").trim(), escalationGuidance: String(body?.escalationGuidance ?? "").trim(), trainingNotes: String(body?.trainingNotes ?? "").trim(), questions });
  return NextResponse.json(course, { status: 201 });
}
