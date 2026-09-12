import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3, PlayCircle } from "lucide-react";
import { getCourse } from "@/lib/learning";
import { CourseContent } from "@/components/course-content";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const course = await getCourse(Number((await params).id));
  if (!course)
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-slate-500">Không tìm thấy khóa học.</p>
        <Link
          href="/learning"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#24618f]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại E-learning
        </Link>
      </main>
    );
  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#24618f]"
        >
          <ArrowLeft className="h-4 w-4" /> E-learning
        </Link>
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e3eaf2] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#2f80b7] to-[#163f68] px-6 py-12 text-white sm:px-10">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              {course.category}
            </span>
            <h1 className="mt-5 text-3xl font-semibold">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              {course.description || "Chưa có mô tả khóa học."}
            </p>
          </div>
          <div className="grid gap-4 border-b border-[#edf1f5] p-6 sm:grid-cols-3">
            <Info
              icon={<BookOpen />}
              label="Bài học"
              value={course.lessons.length}
            />
            <Info icon={<Clock3 />} label="Cấp độ" value={course.level} />
            <Info
              icon={<PlayCircle />}
              label="Trạng thái"
              value={course.status === "published" ? "Đang mở" : "Bản nháp"}
            />
          </div>
          <div className="grid gap-4 border-b border-[#edf1f5] p-6 md:grid-cols-3">
            <InfoBlock label="Các bước Agent cần thao tác/xử lý gì" value={course.agentSteps} />
            <InfoBlock label="Khi nào cần báo Team Leader/Manager" value={course.escalationGuidance} />
            <InfoBlock label="Ghi chú đào tạo" value={course.trainingNotes} />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#173554]">
              Nội dung khóa học
            </h2>
            {course.lessons.length ? <CourseContent lessons={course.lessons} /> : (
              <div className="mt-4 rounded-xl border border-dashed border-[#bdccda] px-5 py-10 text-center text-sm text-slate-500">
                Khóa học chưa có bài học.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#2d78aa]">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 font-semibold text-[#173554]">{value}</p>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <section className="rounded-xl bg-[#f8fbfd] p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value || "Chưa có nội dung"}</p></section>;
}
