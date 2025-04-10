import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardAnalyticsLoading() {
  return (
    <DashboardShell>
      <DashboardShell.Header>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[260px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </DashboardShell.Header>
      <DashboardShell.Content>
        <Skeleton className="h-10 w-[300px] mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] rounded-md" />
          <Skeleton className="h-[120px] rounded-md" />
          <Skeleton className="h-[120px] rounded-md" />
          <Skeleton className="h-[120px] rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Skeleton className="h-[400px] rounded-md lg:col-span-4" />
          <Skeleton className="h-[400px] rounded-md lg:col-span-3" />
        </div>
      </DashboardShell.Content>
    </DashboardShell>
  )
}
