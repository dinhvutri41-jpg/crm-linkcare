import { NextRequest, NextResponse } from "next/server";
import { deleteCourse, getCourse, listCourses, updateCourse } from "@/lib/learning";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  const course = await getCourse(id);
  return course ? NextResponse.json(course) : NextResponse.json({ error: "Course not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Tên khóa học là bắt buộc" }, { status: 400 });
  const duplicate = (await listCourses()).find((course) => course.id !== id && course.title.toLowerCase() === title.toLowerCase());
  if (duplicate) return NextResponse.json({ error: `Dự án ${duplicate.title} đã có khóa học.` }, { status: 409 });
  const questions = Array.isArray(body?.questions) ? body.questions.map((item) => { const value = item as Record<string, unknown>; return { question: String(value.question ?? ""), answer: String(value.answer ?? ""), programName: String(value.programName ?? ""), agentSteps: String(value.agentSteps ?? ""), escalationGuidance: String(value.escalationGuidance ?? ""), trainingNotes: String(value.trainingNotes ?? ""), questionLevel: String(value.questionLevel ?? "") }; }) : [];
  const course = await updateCourse(id, { title, description: String(body?.description ?? "").trim(), category: String(body?.category ?? "Đào tạo nội bộ").trim(), level: String(body?.level ?? "Cơ bản").trim(), coverColor: String(body?.coverColor ?? "blue").trim(), agentSteps: String(body?.agentSteps ?? "").trim(), escalationGuidance: String(body?.escalationGuidance ?? "").trim(), trainingNotes: String(body?.trainingNotes ?? "").trim(), questions });
  return course ? NextResponse.json(course) : NextResponse.json({ error: "Course not found" }, { status: 404 });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  const course = await deleteCourse(id);
  return course ? NextResponse.json(course) : NextResponse.json({ error: "Course not found" }, { status: 404 });
}
