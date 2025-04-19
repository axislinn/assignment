"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth, AuthProvider } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  category: string
  status: string
  createdAt: any
  images?: string[]
  imageUrl?: string
}

function DashboardProductsContent() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return

    const fetchProducts = async () => {
      try {
        const productsQuery = query(
          collection(db, "products"),
          where("sellerId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        
        const snapshot = await getDocs(productsQuery)
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]
        
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [user])

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Products</h1>
        <p className="text-muted-foreground">Manage your product listings</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Input
          type="search"
          placeholder="Search products..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button asChild>
          <Link href="/sell">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 text-muted-foreground font-medium" colSpan={2}>Product</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Category</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Price</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
              <th className="text-left p-4 text-muted-foreground font-medium">Date Added</th>
              <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b last:border-b-0">
                <td className="p-4 w-16">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={product.images?.[0] || product.imageUrl || "/placeholder.png"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{product.title}</div>
                </td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">${product.price.toFixed(2)}</td>
                <td className="p-4">
                  <Badge variant={product.status === "approved" ? "default" : "secondary"}>
                    {product.status}
                  </Badge>
                </td>
                <td className="p-4">
                  {product.createdAt?.seconds
                    ? new Date(product.createdAt.seconds * 1000).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/products/${product.id}`}>...</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DashboardProductsPage() {
  return (
    <AuthProvider>
      <DashboardProductsContent />
    </AuthProvider>
  )
}
