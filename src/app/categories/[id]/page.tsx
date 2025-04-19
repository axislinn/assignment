"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductGrid from "@/components/product-grid"
import { getCategory } from "@/lib/firebase/categories"
import { useAuth } from "@/lib/auth-context"

export default function CategoryPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const fetchedCategory = await getCategory(id as string)
        setCategory(fetchedCategory)
      } catch (error) {
        console.error("Error fetching category:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCategory()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-2 h-6 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Fallback if category not found
  const displayCategory = category || {
    id: id as string,
    name: id ? (id as string).charAt(0).toUpperCase() + (id as string).slice(1) : "Category",
    description: "Browse all items in this category",
    icon: "🔍",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/categories">
          <Button variant="ghost" className="mb-4 -ml-4 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Categories
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-4xl">
            {displayCategory.icon || "🔍"}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{displayCategory.name}</h1>
            <p className="text-muted-foreground">{displayCategory.description}</p>
          </div>
        </div>
      </div>

      <ProductGrid category={id as string} userId={user?.uid} />
    </div>
  )
}
