"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { ProductCard } from "./product-card"
import { ProductFilters } from "./product-filters"
import type { Product } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth, AuthProvider } from "@/lib/auth-context"

function ProductFeedContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const category = searchParams.get("category")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const location = searchParams.get("location")
  const searchQuery = searchParams.get("q")

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        // Fetch user's wishlist if logged in
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists() && userDoc.data().wishlist) {
            setWishlist(userDoc.data().wishlist)
          }
        }

        let productsQuery = query(
          collection(db, "products"),
          where("status", "==", "approved")
        )

        // Apply filters in a specific order to match the composite index
        if (location && location !== "all") {
          productsQuery = query(
            productsQuery,
            where("location", "==", location)
          )
        }

        if (category && category !== "all") {
          productsQuery = query(productsQuery, where("category", "==", category))
        }

        if (minPrice && maxPrice) {
          productsQuery = query(
            productsQuery,
            where("price", ">=", Number(minPrice)),
            where("price", "<=", Number(maxPrice))
          )
        } else if (minPrice) {
          productsQuery = query(productsQuery, where("price", ">=", Number(minPrice)))
        } else if (maxPrice) {
          productsQuery = query(productsQuery, where("price", "<=", Number(maxPrice)))
        }

        // Add ordering and limit at the end
        productsQuery = query(
          productsQuery,
          orderBy("createdAt", "desc"),
          limit(20)
        )

        const querySnapshot = await getDocs(productsQuery)
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Filter by search query if present
        const filteredProducts = searchQuery
          ? productsData.filter(
              (product) =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : productsData

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, minPrice, maxPrice, location, searchQuery, user])

  if (loading) {
    return (
      <div className="space-y-8">
        <ProductFilters />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProductFilters />
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} inWishlist={wishlist.includes(product.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductFeed() {
  return (
    <AuthProvider>
      <ProductFeedContent />
    </AuthProvider>
  )
}
