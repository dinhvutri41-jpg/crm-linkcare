import { AppShell } from "@/components/app-shell";
import { MeetingReportsCrud } from "@/components/meeting-reports-crud";

export default function MeetingReportsPage() {
  return (
    <AppShell>
      <MeetingReportsCrud />
    </AppShell>
  );
}