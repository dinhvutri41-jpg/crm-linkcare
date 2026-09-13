import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { courses, lessons } from "@/db/schema";

export async function listCourses() {
  return getDb().select().from(courses).orderBy(desc(courses.updatedAt), desc(courses.id));
}

export async function getCourse(id: number) {
  const [course] = await getDb().select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course) return null;
  const courseLessons = await getDb().select().from(lessons).where(eq(lessons.courseId, id)).orderBy(lessons.position, lessons.id);
  return { ...course, lessons: courseLessons };
}

export async function createCourse(input: { title: string; description: string; category: string; level: string; coverColor: string; agentSteps: string; escalationGuidance: string; trainingNotes: string; questions: Array<{ question: string; answer: string }> }) {
  const { questions: questionInput, ...courseInput } = input;
  const [course] = await getDb().insert(courses).values(courseInput).returning();
  const questions = questionInput.filter((item) => item.question.trim() || item.answer.trim());
  if (questions.length) await getDb().insert(lessons).values(questions.map((item, index) => ({ courseId: course.id, title: item.question.trim(), content: item.answer.trim(), position: index + 1 })));
  return course;
}

export async function updateCourse(id: number, input: { title: string; description: string; category: string; level: string; coverColor: string; agentSteps: string; escalationGuidance: string; trainingNotes: string; questions: Array<{ question: string; answer: string }> }) {
  const { questions: questionInput, ...courseInput } = input;
  const [course] = await getDb().update(courses).set({ ...courseInput, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
  if (!course) return null;
  await getDb().delete(lessons).where(eq(lessons.courseId, id));
  const questions = questionInput.filter((item) => item.question.trim() || item.answer.trim());
  if (questions.length) await getDb().insert(lessons).values(questions.map((item, index) => ({ courseId: id, title: item.question.trim(), content: item.answer.trim(), position: index + 1 })));
  return course;
}

export async function deleteCourse(id: number) {
  const [course] = await getDb().delete(courses).where(eq(courses.id, id)).returning({ id: courses.id });
  return course ?? null;
}
