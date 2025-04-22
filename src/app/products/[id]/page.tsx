"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/star-rating"
import { Heart, MessageSquare, ShoppingCart, User } from 'lucide-react'
import type { Product, Review } from "@/lib/types"

interface ChatData {
  id: string
  participants: string[]
  productId: string
  productTitle: string
  productImage: string
  createdAt: any
  lastMessage: string | null
  lastMessageTime: any | null
}

type FirestoreData = {
  participants: string[]
  productId: string
  productTitle: string
  productImage: string
  createdAt: any
  lastMessage: string | null
  lastMessageTime: any | null
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<any | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [inWishlist, setInWishlist] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", id as string))

        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() } as Product
          setProduct(productData)

          // Fetch seller data
          const sellerDoc = await getDoc(doc(db, "users", productData.sellerId))
          if (sellerDoc.exists()) {
            setSeller(sellerDoc.data())
          }

          // Fetch reviews
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("productId", "==", id),
            orderBy("createdAt", "desc"),
          )
          const reviewsSnapshot = await getDocs(reviewsQuery)
          const reviewsData = reviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Review[]
          setReviews(reviewsData)

          // Check if in user's wishlist
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists() && userDoc.data().wishlist) {
              setInWishlist(userDoc.data().wishlist.includes(id))
            }
          }
        } else {
          toast({
            title: "Product not found",
            description: "The product you are looking for does not exist",
            variant: "destructive",
          })
          router.push("/products")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [id, user, router, toast])

  const toggleWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const userRef = doc(db, "users", user.uid)

      if (inWishlist) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(id),
        })
        setInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: `${product?.title} has been removed from your wishlist`,
        })
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(id),
        })
        setInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: `${product?.title} has been added to your wishlist`,
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      })
    }
  }

  const startChat = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to contact the seller",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!product) return

    try {
      // Check if chat already exists
      const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid))
      const chatsSnapshot = await getDocs(chatsQuery)

      let existingChat: ChatData | null = null
      for (const doc of chatsSnapshot.docs) {
        const data = doc.data() as FirestoreData
        if (data.participants.includes(product.sellerId)) {
          existingChat = {
            id: doc.id,
            ...data
          } as ChatData
          break
        }
      }

      if (existingChat) {
        router.push(`/messages/${existingChat.id}`)
      } else {
        // Create new chat
        const chatData: Omit<ChatData, 'id'> = {
          participants: [user.uid, product.sellerId],
          productId: product.id,
          productTitle: product.title,
          productImage: product.images?.[0] || "",
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: null,
        }
        const chatRef = await addDoc(collection(db, "chats"), chatData)
        router.push(`/messages/${chatRef.id}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      toast({
        title: "Error",
        description: "Failed to start chat with seller",
        variant: "destructive",
      })
    }
  }

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to leave a review",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      })
      return
    }

    setSubmittingReview(true)

    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        rating,
        text: reviewText,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "reviews"), reviewData)

      // Add review to state
      setReviews([
        {
          id: "temp-id",
          ...reviewData,
          createdAt: new Date().toISOString(),
        } as Review,
        ...reviews,
      ])

      // Reset form
      setReviewText("")
      setRating(0)

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Create cart item data
    const cartItem = {
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || "",
      quantity: 1,
      maxQuantity: product.inStockQuantity,
      sellerId: product.sellerId
    }

    // Store in sessionStorage temporarily
    sessionStorage.setItem('cartItem', JSON.stringify(cartItem))
    
    // Redirect to cart page
    router.push('/cart')
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

  if (!product) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="mt-2">The product you are looking for does not exist or has been removed.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="container py-6 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          <Image
            src={product.images?.[0] || "/placeholder.svg?height=600&width=600"}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="space-y-4 md:space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleWishlist}>
                <Heart className={`h-5 w-5 md:h-6 md:w-6 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl md:text-3xl font-bold">${product.price.toFixed(2)}</p>
              <Badge variant="outline" className="ml-2">
                {product.condition}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <StarRating value={averageRating} readOnly />
              <span className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
              <p className="mt-1">{product.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
              <p className="mt-1">{product.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Listed by</h3>
              <p className="mt-1">{product.sellerName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Stock</h3>
              <p className="mt-1">{product.inStockQuantity} available</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Listed on</h3>
            <p className="mt-1">
              {product.createdAt ? new Date(product.createdAt.seconds * 1000).toLocaleDateString() : "Recently"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button className="flex-1" onClick={startChat}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Seller
            </Button>
            <Button className="flex-1" variant="secondary" onClick={toggleWishlist}>
              <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
              {inWishlist ? "Saved" : "Save"}
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleAddToCart}
              disabled={product.inStockQuantity <= 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 md:h-12 md:w-12">
                  <AvatarImage src={seller?.photoURL} alt={seller?.displayName} />
                  <AvatarFallback>
                    <User className="h-5 w-5 md:h-6 md:w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{seller?.displayName}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Member since {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 md:mt-12">
        <Tabs defaultValue="reviews">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="reviews" className="flex-1 sm:flex-initial">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1 sm:flex-initial">
              Shipping & Returns
            </TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="pt-6">
            {user && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Write a Review</h3>
                  <div className="mb-4">
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mb-4"
                  />
                  <Button onClick={submitReview} disabled={submittingReview}>
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No reviews yet</h3>
                <p className="text-muted-foreground">Be the first to review this product</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.userPhotoURL || ""} alt={review.userName || "User"} />
                            <AvatarFallback>{review.userName?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
                            </p>
                          </div>
                        </div>
                        <StarRating value={review.rating} readOnly size="sm" />
                      </div>
                      <p className="mt-4">{review.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="shipping" className="pt-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Shipping</h3>
                  <p>
                    Shipping methods and costs are determined by the seller. Please contact the seller for more
                    information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Returns</h3>
                  <p>
                    Return policies are determined by the seller. Please contact the seller for more information about
                    their return policy.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Buyer Protection</h3>
                  <p>
                    Our marketplace offers buyer protection for eligible purchases. If you don't receive your item or
                    it's significantly different from the description, you may be eligible for a refund.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}