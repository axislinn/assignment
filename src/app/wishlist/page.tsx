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
import { getWishlist, toggleWishlist } from "@/lib/firebase/wishlist"

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchWishlist = async () => {
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

    fetchWishlist()
  }, [user, router, toast])

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await toggleWishlist(user!.uid, productId)
      setWishlistItems(wishlistItems.filter((item) => item.id !== productId))
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      })
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      })
    }
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
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <Link href={`/products/${item.id}`}>
                  <img
                    src={item.images?.[0] || "/placeholder.svg?height=300&width=500"}
                    alt={item.title || "Product"}
                    className="aspect-video w-full object-cover"
                  />
                </Link>
              </div>
              <CardContent className="p-4">
                <Link href={`/products/${item.id}`}>
                  <h3 className="mb-1 text-lg font-medium hover:underline">{item.title || "Untitled Product"}</h3>
                </Link>
                <p className="mb-4 text-lg font-bold text-primary">${(item.price || 0).toFixed(2)}</p>
                <div className="flex gap-2">
                  <Link href={`/products/${item.id}`} className="flex-1">
                    <Button className="w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" /> View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="text-red-500"
                  >
                    <Heart className="h-4 w-4 fill-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
