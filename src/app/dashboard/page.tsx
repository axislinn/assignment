"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, CreditCard, DollarSign, Package, Users } from 'lucide-react'
import { NotificationsTab } from "@/components/dashboard/notifications-tab"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth, AuthProvider } from "@/lib/auth-context"
import { DateRange } from "react-day-picker"

// Dynamically import components with SSR disabled
const Overview = dynamic(() => import("@/components/dashboard/overview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[350px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
})

const RecentSales = dynamic(() => import("@/components/dashboard/recent-sales"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[350px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
})

function DashboardContent() {
  const { user } = useAuth()
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [monthlySalesCount, setMonthlySalesCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchPendingOrdersCount = async () => {
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("sellerId", "==", user.uid),
          where("status", "==", "pending")
        )
        const snapshot = await getDocs(ordersQuery)
        setPendingOrdersCount(snapshot.size)
      } catch (error) {
        console.error("Error fetching pending orders count:", error)
      }
    }

    fetchPendingOrdersCount()
  }, [user])

  useEffect(() => {
    const fetchMonthlySales = async () => {
      if (!user) return

      try {
        // Get the start of the current month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        // First try without the date filter to check if we have any confirmed orders
        const salesQuery = query(
          collection(db, "orders"),
          where("sellerId", "==", user.uid),
          where("status", "in", ["confirmed", "Confirmed", "CONFIRMED", "paid", "Paid", "PAID", "delivered", "Delivered", "DELIVERED"])
        )
        
        try {
          const snapshot = await getDocs(salesQuery)
          console.log("Total confirmed orders found:", snapshot.size)
          
          // Now try with the date filter
          const monthlyQuery = query(
            collection(db, "orders"),
            where("sellerId", "==", user.uid),
            where("status", "in", ["confirmed", "Confirmed", "CONFIRMED", "paid", "Paid", "PAID", "delivered", "Delivered", "DELIVERED"]),
            where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
          )
          
          const monthlySnapshot = await getDocs(monthlyQuery)
          console.log("Monthly orders found:", monthlySnapshot.size)
          setMonthlySalesCount(monthlySnapshot.size)
          
        } catch (queryError: any) {
          if (queryError?.message?.includes("requires an index")) {
            console.error("Index required for orders query:", queryError)
            // Try a simpler query without date filtering
            const simpleQuery = query(
              collection(db, "orders"),
              where("sellerId", "==", user.uid),
              where("status", "in", ["confirmed", "Confirmed", "CONFIRMED"])
            )
            const simpleSnapshot = await getDocs(simpleQuery)
            setMonthlySalesCount(simpleSnapshot.size)
          } else {
            throw queryError
          }
        }
      } catch (error) {
        console.error("Error fetching monthly sales:", error)
        setMonthlySalesCount(0)
      }
    }

    fetchMonthlySales()
  }, [user])

  return (
    <DashboardShell>
      <DashboardShell.Header>
        <DashboardShell.Title>Dashboard</DashboardShell.Title>
        <DashboardShell.Description>
          Welcome back! Here's an overview of your marketplace activity.
        </DashboardShell.Description>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
          <Button>Download</Button>
        </div>
      </DashboardShell.Header>
      <DashboardShell.Content>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {pendingOrdersCount > 0 && selectedTab !== "notifications" && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {pendingOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2350</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Suspense fallback={
                    <div className="flex items-center justify-center w-full h-[350px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  }>
                    <Overview />
                  </Suspense>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    {monthlySalesCount !== null 
                      ? `You made ${monthlySalesCount} sales this month.`
                      : 'Loading sales data...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="flex items-center justify-center w-full h-[350px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  }>
                    <RecentSales />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </DashboardShell.Content>
    </DashboardShell>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
