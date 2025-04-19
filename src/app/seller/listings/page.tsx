"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getProducts, deleteProduct } from "@/lib/firebase/products"

export default function SellerListingsPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in and is a seller
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (userRole !== "seller") {
      toast({
        title: "Access denied",
        description: "You need a seller account to access this page",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    const fetchListings = async () => {
      try {
        const products = await getProducts({ sellerId: user.uid })
        setListings(products)
      } catch (error) {
        console.error("Error fetching listings:", error)
        toast({
          title: "Error",
          description: "Failed to load your listings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [user, userRole, router, toast])

  const handleDeleteListing = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      try {
        await deleteProduct(id)
        setListings(listings.filter((listing) => listing.id !== id))
        toast({
          title: "Success",
          description: "Listing deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting listing:", error)
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive",
        })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500">
            Pending Approval
          </Badge>
        )
      case "sold":
        return <Badge variant="secondary">Sold</Badge>
      default:
        return <Badge variant="outline">{status || "Active"}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="p-0">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/seller/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Listings</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="sold">Sold</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ListingsGrid listings={listings} onDelete={handleDeleteListing} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="active">
          <ListingsGrid
            listings={listings.filter((listing) => listing.status === "active")}
            onDelete={handleDeleteListing}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        <TabsContent value="pending">
          <ListingsGrid
            listings={listings.filter((listing) => listing.status === "pending")}
            onDelete={handleDeleteListing}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        <TabsContent value="sold">
          <ListingsGrid
            listings={listings.filter((listing) => listing.status === "sold")}
            onDelete={handleDeleteListing}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ListingsGridProps {
  listings: any[]
  onDelete: (id: string) => void
  getStatusBadge: (status: string) => React.ReactNode
}

function ListingsGrid({ listings, onDelete, getStatusBadge }: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="mb-4 text-center text-muted-foreground">No listings found</p>
          <Link href="/seller/listings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Listing
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="aspect-video overflow-hidden">
              <img
                src={listing.images?.[0] || "/placeholder.svg?height=300&width=500"}
                alt={listing.title || "Product"}
                className="h-full w-full object-cover"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="line-clamp-1 text-lg font-medium">{listing.title || "Untitled Product"}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/seller/listings/edit/${listing.id}`} className="flex cursor-pointer items-center">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(listing.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-primary">${(listing.price || 0).toFixed(2)}</p>
              {getStatusBadge(listing.status || "active")}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {listing.description || "No description available"}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex w-full gap-2">
              <Link href={`/products/${listing.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View
                </Button>
              </Link>
              <Link href={`/seller/listings/edit/${listing.id}`} className="flex-1">
                <Button className="w-full">Edit</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
