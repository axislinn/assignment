import { ProductFeed } from "@/components/products/product-feed"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <HeroSection />
      <CategorySection />
      <ProductFeed />
    </div>
  )
}
