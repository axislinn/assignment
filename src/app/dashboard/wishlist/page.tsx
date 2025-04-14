"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types"

export default function DashboardWishlistPage() {
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

  return (
    <DashboardShell>
      <DashboardShell.Header>
        <DashboardShell.Title>Wishlist</DashboardShell.Title>
        <DashboardShell.Description>
          Items you've saved for later
        </DashboardShell.Description>
      </DashboardShell.Header>
      <DashboardShell.Content>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-4">Your wishlist is empty</p>
            <p className="text-muted-foreground mb-6">
              Save items you're interested in by clicking the heart icon on product pages
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <ProductCard key={product.id} product={product} inWishlist={true} />
            ))}
          </div>
        )}
      </DashboardShell.Content>
    </DashboardShell>
  )
}
