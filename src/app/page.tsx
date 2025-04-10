import { ProductFeed } from "@/components/product/product-feed"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <CategorySection />
      <ProductFeed />
    </div>
  )
}
