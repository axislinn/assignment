"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/types"
import { Edit, Trash } from "lucide-react"

export default function MyListingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return

      try {
        const listingsQuery = query(
          collection(db, "products"),
          where("sellerId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const listingsSnapshot = await getDocs(listingsQuery)
        
        // If query returns empty, it's a new user - no error needed
        if (listingsSnapshot.empty) {
          setListings([])
          return
        }

        const listingsData = listingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        setListings(listingsData)
      } catch (error: any) {
        console.error("Error fetching listings:", error)
        
        // Show error toast for Firebase-specific errors (like missing index)
        // or other technical errors, but not for empty results
        if (error?.name === "FirebaseError" && !error.message?.includes("no documents in result")) {
          toast({
            title: "Error",
            description: "Failed to load your listings. Please try again later.",
            variant: "destructive",
          })
        }
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [user, toast])

  const handleDeleteListing = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId))

      // Update local state
      setListings(listings.filter((listing) => listing.id !== productId))

      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted successfully",
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

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view your listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Button asChild>
          <Link href="/sell">Add New Listing</Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-4">Start selling by creating your first listing</p>
            <Button asChild>
              <Link href="/sell">Create Listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative aspect-square md:w-40 overflow-hidden rounded-md">
                    <img
                      src={listing.imageUrl || "/placeholder.svg?height=160&width=160"}
                      alt={listing.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <p className="text-muted-foreground">${listing.price.toFixed(2)}</p>
                      </div>
                      <Badge
                        variant={
                          listing.status === "approved"
                            ? "default"
                            : listing.status === "pending"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </div>

                    <p className="mt-2 line-clamp-2">{listing.description}</p>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{listing.category}</Badge>
                        <Badge variant="outline">{listing.condition}</Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/products/${listing.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/edit-listing/${listing.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your listing.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteListing(listing.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
