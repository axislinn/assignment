"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, BarChart, MessageSquare, Heart, CreditCard } from 'lucide-react'

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardNav({ className, ...props }: DashboardNavProps) {
  const pathname = usePathname()
  const { userRole } = useAuth()

  // Define navigation items based on user role
  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "seller", "buyer"],
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: Package,
      roles: ["admin", "seller"],
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
      roles: ["admin", "seller", "buyer"],
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart,
      roles: ["admin", "seller"],
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      roles: ["admin", "seller", "buyer"],
    },
    {
      title: "Wishlist",
      href: "/dashboard/wishlist",
      icon: Heart,
      roles: ["buyer"],
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      roles: ["admin", "seller"],
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "My Account",
      href: "/dashboard/account",
      icon: Users, // You can use another icon like User if available
      roles: ["admin", "seller", "buyer"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin", "seller", "buyer"],
    }
  ]

  // Filter items based on user role
  const filteredNavItems = navItems.filter((item) => 
    userRole ? item.roles.includes(userRole) : false
  )

  return (
    <ScrollArea className="h-full py-6">
      <div className={cn("flex flex-col gap-2 px-2", className)} {...props}>
        {filteredNavItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "justify-start",
              pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}