import { NextRequest, NextResponse } from "next/server";
import { getCourse } from "@/lib/learning";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  const course = await getCourse(id);
  return course ? NextResponse.json(course) : NextResponse.json({ error: "Course not found" }, { status: 404 });
}
