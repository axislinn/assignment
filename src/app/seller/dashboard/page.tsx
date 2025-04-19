"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, LineChart, Package, ShoppingCart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getSellerStats } from "@/lib/firebase/seller"

export default function SellerDashboard() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in and is a seller
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (userRole !== "seller") {
      toast({
        title: "Access denied",
        description: "You need a seller account to access this page",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        const sellerStats = await getSellerStats(user.uid)
        setStats(sellerStats)
      } catch (error) {
        console.error("Error fetching seller stats:", error)
        toast({
          title: "Error",
          description: "Failed to load seller statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, userRole, router, toast])

  // Fallback stats if none are found
  const fallbackStats = {
    totalListings: 12,
    activeListings: 8,
    pendingListings: 4,
    totalSales: 24,
    totalRevenue: 1250.75,
    recentSales: [
      { id: "1", product: "Vintage Camera", price: 120, date: "2023-05-15" },
      { id: "2", product: "Leather Jacket", price: 85.5, date: "2023-05-12" },
      { id: "3", product: "Antique Clock", price: 220, date: "2023-05-10" },
    ],
    topProducts: [
      { id: "1", product: "Vintage Camera", sales: 5 },
      { id: "2", product: "Leather Jacket", sales: 3 },
      { id: "3", product: "Antique Clock", sales: 2 },
    ],
  }

  const displayStats = stats || fallbackStats

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Link href="/seller/listings/new">
          <Button>Add New Listing</Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
              <p className="text-2xl font-bold">{displayStats.totalListings}</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold">{displayStats.activeListings}</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">{displayStats.totalSales}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${displayStats.totalRevenue.toFixed(2)}</p>
            </div>
            <LineChart className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your most recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayStats.recentSales.map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sale.product}</p>
                        <p className="text-sm text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-medium">${sale.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/seller/sales">
                  <Button variant="outline" size="sm">
                    View All Sales
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best-selling items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayStats.topProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <p className="font-medium">{product.product}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/seller/listings">
                  <Button variant="outline" size="sm">
                    View All Listings
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Your sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-muted/30 flex items-center justify-center">
                <BarChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Sales chart visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>How your products are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-muted/30 flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Product performance visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Seller Tips</CardTitle>
          <CardDescription>Improve your selling experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Take Quality Photos</h3>
              <p className="text-sm text-muted-foreground">
                Clear, well-lit photos from multiple angles help buyers see exactly what they're getting.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Write Detailed Descriptions</h3>
              <p className="text-sm text-muted-foreground">
                Include dimensions, condition details, and any flaws to set accurate expectations.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Price Competitively</h3>
              <p className="text-sm text-muted-foreground">
                Research similar items to ensure your pricing is attractive to potential buyers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
