import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardUsersLoading() {
  return (
    <DashboardShell>
      <DashboardShell.Header>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[300px]" />
        </div>
      </DashboardShell.Header>
      <DashboardShell.Content>
        <div className="rounded-md border">
          <div className="h-12 border-b px-4 flex items-center">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px] ml-auto" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-[150px] mb-2" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardShell.Content>
    </DashboardShell>
  )
}
