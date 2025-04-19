"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types"

export default function WishlistPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists() && userDoc.data().wishlist) {
          const wishlistIds = userDoc.data().wishlist

          if (wishlistIds.length === 0) {
            setWishlistItems([])
            setLoading(false)
            return
          }

          const productsData: Product[] = []

          // Fetch products in batches of 10 (Firestore limitation for 'in' queries)
          for (let i = 0; i < wishlistIds.length; i += 10) {
            const batch = wishlistIds.slice(i, i + 10)

            const productsQuery = query(collection(db, "products"), where("__name__", "in", batch))

            const productsSnapshot = await getDocs(productsQuery)

            productsSnapshot.forEach((doc) => {
              productsData.push({ id: doc.id, ...doc.data() } as Product)
            })
          }

          setWishlistItems(productsData)
        } else {
          setWishlistItems([])
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error)
        toast({
          title: "Error",
          description: "Failed to load wishlist",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user, toast])

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view your wishlist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-4">
              Save items you're interested in by clicking the heart icon on product pages
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} inWishlist={true} />
          ))}
        </div>
      )}
    </div>
  )
}
