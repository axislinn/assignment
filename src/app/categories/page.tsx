import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import CategoryList from "@/components/category-list"

export const metadata: Metadata = {
  title: "Categories | SecondChance Marketplace",
  description: "Browse all categories of second-hand items on SecondChance Marketplace",
}

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Browse Categories</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Explore our wide range of product categories to find exactly what you're looking for. From electronics to
          clothing, furniture to collectibles, we have it all.
        </p>
      </div>

      <CategoryList />

      <div className="mt-12 rounded-lg border bg-card p-8 text-center shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">Can't find what you're looking for?</h2>
        <p className="mb-6 text-muted-foreground">
          We're constantly expanding our categories. If you can't find what you're looking for, let us know!
        </p>
        <Link href="/contact">
          <Button>Contact Us</Button>
        </Link>
      </div>
    </div>
  )
}
