"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  inWishlist?: boolean
}

export function ProductCard({ product, inWishlist = false }: ProductCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isInWishlist, setIsInWishlist] = useState(inWishlist)
  const [isLoading, setIsLoading] = useState(false)

  const toggleWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const userRef = doc(db, "users", user.uid)

      if (isInWishlist) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(product.id),
        })
        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: `${product.title} has been removed from your wishlist`,
        })
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(product.id),
        })
        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: `${product.title} has been added to your wishlist`,
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square">
        <Image
          src={product.imageUrl || "/placeholder.svg?height=300&width=300"}
          alt={product.title}
          fill
          className="object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 rounded-full dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
          onClick={toggleWishlist}
          disabled={isLoading}
        >
          <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.id}`} className="hover:underline">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{product.title}</h3>
          </Link>
          <Badge variant="outline" className="ml-2 text-xs whitespace-nowrap">
            {product.condition}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg sm:text-xl">${product.price.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{product.location}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/products/${product.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
