import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSettingsLoading() {
  return (
    <DashboardShell>
      <DashboardShell.Header>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </DashboardShell.Header>
      <DashboardShell.Content>
        <Skeleton className="h-10 w-[300px] mb-4" />
        <Skeleton className="h-[500px] w-full rounded-md" />
      </DashboardShell.Content>
    </DashboardShell>
  )
}
