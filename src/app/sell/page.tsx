"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { uploadMultipleImages } from "@/lib/supabase/storage"
import { syncSupabaseAuth } from "@/lib/supabase/auth"

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  category: z.string().min(1, { message: "Please select a category" }),
  condition: z.string().min(1, { message: "Please select a condition" }),
  location: z.string().min(1, { message: "Please select a location" }),
  inStockQuantity: z.coerce.number().int().positive({ message: "Quantity must be a positive integer" }),
})

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

const conditions = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "salvage", label: "Salvage" },
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

export default function SellPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: "",
      condition: "",
      location: "",
      inStockQuantity: 1,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages(files)
      setImagePreviews(files.map(file => URL.createObjectURL(file)))
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to list a product",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (userRole !== "seller" && userRole !== "admin") {
      toast({
        title: "Permission denied",
        description: "You need a seller account to list products",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Upload images to Supabase if selected
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        const uploadResults = await uploadMultipleImages(selectedImages)
        imageUrls = uploadResults.map(result => result.url)
      }

      // Add product to Firestore
      const productData = {
        ...values,
        sellerId: user.uid,
        sellerName: user.displayName,
        images: imageUrls,
        status: userRole === "admin" ? "approved" : "pending", // Auto-approve for admins
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "products"), productData)

      toast({
        title: "Product listed successfully",
        description:
          userRole === "admin"
            ? "Your product is now live on the marketplace"
            : "Your product has been submitted for review",
      })

      router.push("/my-listings")
    } catch (error: any) {
      console.error("Error listing product:", error)
      toast({
        title: "Error listing product",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to list a product on the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (userRole !== "seller" && userRole !== "admin") {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Seller Account Required</CardTitle>
            <CardDescription>You need a seller account to list products on the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please update your account to a seller account in your profile settings.</p>
            <Button asChild>
              <a href="/settings">Go to Settings</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>List Your Item</CardTitle>
          <CardDescription>Fill out the form below to list your item on the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. iPhone 13 Pro Max 256GB" {...field} />
                      </FormControl>
                      <FormDescription>A clear, concise title for your item</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 299.99" {...field} />
                      </FormControl>
                      <FormDescription>Set a competitive price for your item</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inStockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>In Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="e.g. 10" {...field} />
                      </FormControl>
                      <FormDescription>Number of items available for sale</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item in detail. Include condition, features, and any relevant information."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Be detailed and honest about the condition and features</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel htmlFor="images">Product Images</FormLabel>
                <div className="mt-2 flex flex-col space-y-2">
                  <Input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} />
                  <FormDescription>Upload at least one clear image of your product</FormDescription>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Image Previews</p>
                    <div className="flex flex-wrap gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-video w-40 h-40 overflow-hidden rounded-lg border border-dashed">
                          <img
                            src={preview}
                            alt={`Product preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Submitting..." : "List Item for Sale"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
