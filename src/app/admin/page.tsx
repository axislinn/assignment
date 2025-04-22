"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, User, Package, DollarSign, Users } from "lucide-react"
import type { Product } from "@/lib/types"

export default function AdminDashboardPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [pendingProducts, setPendingProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || userRole !== "admin") {
      router.push("/")
      return
    }

    const fetchAdminData = async () => {
      try {
        // Fetch pending products
        const pendingProductsQuery = query(
          collection(db, "products"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc"),
        )

        const pendingProductsSnapshot = await getDocs(pendingProductsQuery)
        const pendingProductsData = pendingProductsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        setPendingProducts(pendingProductsData)

        // Fetch users
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))

        const usersSnapshot = await getDocs(usersQuery)
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setUsers(usersData)

        // Fetch stats
        const productsQuery = query(collection(db, "products"))
        const productsSnapshot = await getDocs(productsQuery)

        // In a real app, you would have a sales collection
        // This is just a placeholder
        setStats({
          totalUsers: usersData.length,
          totalProducts: productsSnapshot.size,
          totalSales: 0,
        })
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [user, userRole, router, toast])

  const handleProductApproval = async (productId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        status: approved ? "approved" : "rejected",
      })

      // Update local state
      setPendingProducts(pendingProducts.filter((product) => product.id !== productId))

      toast({
        title: approved ? "Product approved" : "Product rejected",
        description: `The product has been ${approved ? "approved" : "rejected"} successfully`,
      })
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    }
  }

  if (!user || userRole !== "admin") {
    return null // Redirecting in useEffect
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <h3 className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals ({pendingProducts.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="pt-6">
          {pendingProducts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">No pending products</h2>
                <p className="text-muted-foreground">All products have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative aspect-square md:w-40 overflow-hidden rounded-md">
                        <img
                          src={product.images?.[0] || "/placeholder.svg?height=160&width=160"}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{product.title}</h3>
                            <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                          </div>
                          <Badge>{product.category}</Badge>
                        </div>

                        <p className="mt-2 line-clamp-2">{product.description}</p>

                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{product.sellerName?.[0] || "S"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{product.sellerName}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/products/${product.id}`}>View</Link>
                            </Button>
                            <Button variant="default" size="sm" onClick={() => handleProductApproval(product.id, true)}>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleProductApproval(product.id, false)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="pt-6">
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{user.displayName}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : user.role === "seller" ? "default" : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
