import Link from "next/link"
import { Laptop, Sofa, Shirt, Car, BookOpen, Smartphone, Bike, Utensils } from "lucide-react"

const categories = [
  { name: "Electronics", icon: Laptop, href: "/products?category=electronics" },
  { name: "Furniture", icon: Sofa, href: "/products?category=furniture" },
  { name: "Clothing", icon: Shirt, href: "/products?category=clothing" },
  { name: "Vehicles", icon: Car, href: "/products?category=vehicles" },
  { name: "Books", icon: BookOpen, href: "/products?category=books" },
  { name: "Mobile Phones", icon: Smartphone, href: "/products?category=phones" },
  { name: "Sports", icon: Bike, href: "/products?category=sports" },
  { name: "Home & Kitchen", icon: Utensils, href: "/products?category=home" },
]

export function CategorySection() {
  return (
    <section className="mb-6 sm:mb-8 md:mb-12">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">Browse Categories</h2>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-primary/10 mb-1 sm:mb-2 md:mb-3">
              <category.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground text-center line-clamp-2">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
