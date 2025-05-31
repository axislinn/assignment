import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative py-12 md:py-16 lg:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl overflow-hidden mb-8 md:mb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 dark:text-gray-50"
            style={{ color: "hsl(var(--secondary-foreground))" }}
          >
            Find Treasures, Create Stories
          </h1>
          <p
            className="text-lg md:text-xl mb-6 md:mb-8 dark:text-gray-300"
            style={{ color: "hsl(var(--secondary-foreground))" }}
          >
            Buy and sell pre-loved items in your community. Give items a second chance and make sustainable choices
            while saving money.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/sell">Sell an Item</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
        <svg
          width="300"
          height="300"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden md:block"
        >
          <path
            fill="currentColor"
            className="text-blue-600 dark:text-blue-400"
            d="M37.5,-48.1C52.9,-39.2,72.2,-33.5,79.9,-20.7C87.7,-7.9,83.9,12,74.4,27.3C64.9,42.6,49.6,53.3,33.7,59.7C17.8,66.1,1.3,68.2,-16.6,67.1C-34.5,66,-53.8,61.7,-65.2,49.6C-76.7,37.5,-80.3,17.8,-78.9,-0.8C-77.5,-19.4,-71.1,-36.8,-59.2,-45.7C-47.3,-54.6,-29.9,-55,-15.8,-53.8C-1.7,-52.6,9.2,-49.8,22.1,-57C35,-64.2,50,-57,37.5,-48.1Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  )
}
