import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("grid items-start gap-8", className)} {...props}>
      {children}
    </div>
  )
}

interface DashboardShellHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

DashboardShell.Header = function DashboardShellHeader({ children, className, ...props }: DashboardShellHeaderProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between", className)} {...props}>
      <div className="grid gap-1">{children}</div>
    </div>
  )
}

interface DashboardShellTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

DashboardShell.Title = function DashboardShellTitle({ children, className, ...props }: DashboardShellTitleProps) {
  return (
    <h1 className={cn("text-2xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h1>
  )
}

interface DashboardShellDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

DashboardShell.Description = function DashboardShellDescription({
  children,
  className,
  ...props
}: DashboardShellDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}

interface DashboardShellContentProps extends React.HTMLAttributes<HTMLDivElement> {}

DashboardShell.Content = function DashboardShellContent({ children, className, ...props }: DashboardShellContentProps) {
  return (
    <div className={cn("grid gap-4 md:gap-8", className)} {...props}>
      {children}
    </div>
  )
}
