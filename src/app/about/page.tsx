import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Recycle, ShieldCheck, Users, Leaf } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about SecondChance Marketplace and our mission to promote sustainable shopping.",
}

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About SecondChance Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          We're on a mission to make second-hand shopping the first choice for conscious consumers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="mb-4">
            SecondChance was founded in 2023 with a simple idea: to create a platform where pre-loved items could find
            new homes, reducing waste and making quality goods more accessible.
          </p>
          <p className="mb-4">
            What started as a small community of environmentally conscious shoppers has grown into a thriving
            marketplace connecting buyers and sellers across the country.
          </p>
          <p>
            We believe that every item has a story and deserves a second chance. By extending the lifecycle of products,
            we're helping to create a more sustainable future.
          </p>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image src="/placeholder.svg?height=400&width=600" alt="SecondChance team" fill className="object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Recycle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Reduce Waste</h3>
            <p className="text-center text-muted-foreground">
              By giving items a second life, we help reduce the amount of waste going to landfills.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Safe & Secure</h3>
            <p className="text-center text-muted-foreground">
              Our platform prioritizes user safety with secure transactions and verified accounts.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Community</h3>
            <p className="text-center text-muted-foreground">
              We're building a community of like-minded individuals who value sustainability.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Eco-Friendly</h3>
            <p className="text-center text-muted-foreground">
              Every purchase on SecondChance helps reduce the environmental impact of consumerism.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted rounded-lg p-8 text-center mb-16">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Whether you're looking to declutter your home or find unique items at great prices, SecondChance is the
          perfect platform for you.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">Create an Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">How does SecondChance work?</h3>
            <p className="text-muted-foreground">
              SecondChance connects buyers and sellers of pre-loved items. Sellers can list their items, and buyers can
              browse, purchase, and arrange pickup or delivery.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Is it free to list items?</h3>
            <p className="text-muted-foreground">
              Yes, listing items on SecondChance is completely free. We only charge a small commission when an item
              sells.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">How do I know the items are in good condition?</h3>
            <p className="text-muted-foreground">
              Sellers are required to accurately describe the condition of their items and provide clear photos. We also
              have a review system so you can see feedback from previous buyers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What if I'm not satisfied with my purchase?</h3>
            <p className="text-muted-foreground">
              We have a buyer protection policy that covers items that are significantly different from their
              description. Contact our support team within 48 hours of receiving the item.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
