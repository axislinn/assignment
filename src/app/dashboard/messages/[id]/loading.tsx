import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardMessageDetailLoading() {
  return (
    <DashboardShell className="h-[calc(100vh-4rem)]">
      <DashboardShell.Header className="border-b pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 p-2 rounded-md">
            <Skeleton className="h-10 w-10 rounded" />
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
        </div>
      </DashboardShell.Header>
      <DashboardShell.Content className="flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted">
              <Skeleton className="h-4 w-[200px] mb-2" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[70%] rounded-lg px-4 py-2 bg-primary">
              <Skeleton className="h-4 w-[250px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted">
              <Skeleton className="h-4 w-[180px] mb-2" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        </div>
        <div className="border-t p-4 flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </DashboardShell.Content>
    </DashboardShell>
  )
}
