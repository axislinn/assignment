"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "vehicles", label: "Vehicles" },
  { value: "books", label: "Books" },
  { value: "phones", label: "Mobile Phones" },
  { value: "sports", label: "Sports" },
  { value: "home", label: "Home & Kitchen" },
]

const locations = [
  { value: "new-york", label: "New York" },
  { value: "los-angeles", label: "Los Angeles" },
  { value: "chicago", label: "Chicago" },
  { value: "houston", label: "Houston" },
  { value: "phoenix", label: "Phoenix" },
  { value: "philadelphia", label: "Philadelphia" },
  { value: "san-antonio", label: "San Antonio" },
  { value: "san-diego", label: "San Diego" },
]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || 1000),
  ])
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (category) params.set("category", category)
    if (location) params.set("location", location)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 1000) params.set("maxPrice", priceRange[1].toString())
    if (searchQuery) params.set("q", searchQuery)

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setCategory("")
    setLocation("")
    setPriceRange([0, 1000])
    setSearchQuery("")
    router.push("/products")
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="hidden md:flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="py-4"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    applyFilters()
                    document.querySelector<HTMLButtonElement>("[data-sheet-close]")?.click()
                  }}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={resetFilters} className="flex-1">
                  Reset
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="price-range">
            <AccordionTrigger>
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </AccordionTrigger>
            <AccordionContent>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="py-4"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Active filters */}
      {(category || location || priceRange[0] > 0 || priceRange[1] < 1000 || searchQuery) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {category && (
            <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
              <span>Category: {categories.find((c) => c.value === category)?.label}</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => setCategory("")}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove category filter</span>
              </Button>
            </div>
          )}

          {location && (
            <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
              <span>Location: {locations.find((l) => l.value === location)?.label}</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => setLocation("")}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove location filter</span>
              </Button>
            </div>
          )}

          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
              <span>
                Price: ${priceRange[0]} - ${priceRange[1]}
              </span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => setPriceRange([0, 1000])}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove price filter</span>
              </Button>
            </div>
          )}

          {searchQuery && (
            <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
              <span>Search: {searchQuery}</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove search filter</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
