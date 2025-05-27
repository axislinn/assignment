"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Heart, ShoppingCart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getWishlist } from "@/lib/firebase/wishlist"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types"

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      const items = await getWishlist(user.uid)
      setWishlistItems(items)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to load your wishlist",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user, router, toast])

  const handleRemoveItem = (productId: string) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  if (!user) {
    return null // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <div className="p-4">
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Your wishlist is empty</h2>
            <p className="mb-4 text-center text-muted-foreground">
              Browse products and add items to your wishlist to keep track of things you love.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item} 
              inWishlist={true}
              showRemoveButton={true}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
