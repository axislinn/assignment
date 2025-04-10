import { ProductFeed } from "@/components/product/product-feed"

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Products</h1>
      <ProductFeed />
    </div>
  )
}
