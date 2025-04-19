import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Camera, FileText, Tag, MapPin } from "lucide-react"

export default function AddProductGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">How to Add Products</h1>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This guide will help you add products to your SecondChance Marketplace.
          Follow these steps to create effective listings that attract buyers.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="seller" className="mb-12">
        <TabsList className="mb-8 flex w-full flex-wrap justify-center gap-2">
          <TabsTrigger value="seller">For Sellers</TabsTrigger>
          <TabsTrigger value="admin">For Admins</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="seller">
          <Card>
            <CardHeader>
              <CardTitle>Adding Products as a Seller</CardTitle>
              <CardDescription>Step-by-step guide for sellers to list products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Register/Login as a Seller</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Create an account or log in to an existing account</li>
                  <li>If you're a new user, select "Seller" during registration</li>
                  <li>If you're an existing user, you may need to request a role change to "Seller"</li>
                  <li>Wait for admin approval if required by your marketplace settings</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Access Seller Dashboard</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>After logging in, go to your seller dashboard</li>
                  <li>Click on "My Listings" in the navigation menu</li>
                  <li>You'll see all your current listings (if any)</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Create a New Listing</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Click the "Add New Listing" button</li>
                  <li>Fill out the product form with the following information:
                    <ul className="ml-6 list-disc space-y-1 mt-2">
                      <li><strong>Title:</strong> A clear, descriptive title for your product</li>
                      <li><strong>Description:</strong> Detailed information about the product</li>
                      <li><strong>Price:</strong> The selling price in dollars</li>
                      <li><strong>Category:</strong> Select the appropriate category</li>
                      <li><strong>Condition:</strong> Choose from New, Like New, Good, Fair, or Poor</li>
                      <li><strong>Location:</strong> Enter your city and state or region</li>
                    </ul>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. Upload Product Images</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Click the "Add Image" button to select photos from your device</li>
                  <li>Upload multiple images showing different angles of the product</li>
                  <li>The first image will be used as the cover image</li>
                  <li>Each image must be under 5MB and in JPG, PNG, or WebP format</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">5. Submit Your Listing</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Review all information for accuracy</li>
                  <li>Click the "Create Listing" button</li>
                  <li>Your product will be listed immediately (or pending admin approval, depending on your marketplace settings)</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">6. Manage Your Listings</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Return to "My Listings" to view all your products</li>
                  <li>Edit, delete, or mark items as sold as needed</li>
                  <li>Respond to buyer inquiries promptly</li>
                </ol>
              </div>
              
              <div className="flex justify-center mt-6">
                <Link href="/seller/listings/new">
                  <Button>Create New Listing</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Adding Products as an Admin</CardTitle>
              <CardDescription>Admin-specific instructions for product management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Access Admin Dashboard</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Log in with your admin account</li>
                  <li>Navigate to the Admin Dashboard</li>
                  <li>You'll have access to all marketplace management features</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Add Products Directly</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Go to "Manage Listings" section</li>
                  <li>Click "Add New Product"</li>
                  <li>Fill out the same product form as sellers</li>
                  <li>You can also set additional options like featuring a product</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Manage Existing Products</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>View all products in the marketplace</li>
                  <li>Edit, delete, or feature any product</li>
                  <li>Approve pending products from sellers</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. Bulk Operations</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Select multiple products using checkboxes</li>
                  <li>Perform bulk actions like:
                    <ul className="ml-6 list-disc space-y-1 mt-2">
                      <li>Approve multiple listings</li>
                      <li>Feature multiple products</li>
                      <li>Delete multiple listings</li>
                      <li>Change category for multiple products</li>
                    </ul>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">5. Product Analytics</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>View performance metrics for products</li>
                  <li>See which products are most viewed or purchased</li>
                  <li>Use this data to make recommendations to sellers</li>
                </ol>
              </div>
              
              <div className="flex justify-center mt-6">
                <Link href="/admin/listings">
                  <Button>Go to Admin Listings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="best-practices">
          <Card>
            <CardHeader>
              <CardTitle>Best Practices for Product Listings</CardTitle>
              <CardDescription>Tips to create effective and attractive product listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">High-Quality Images</h3>
                  <ul className="ml-6 list-disc space-y-2 mt-2">
                    <li>Use well-lit, clear photos (natural light works best)</li>
                    <li>Include multiple angles (front, back, sides, details)</li>
                    <li>Show any defects or wear honestly</li>
                    <li>Use a neutral background when possible</li>
                    <li>Include a size reference if applicable</li>
                    <li>Avoid using stock photos - buyers want to see the actual item</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Detailed Descriptions</h3>
                  <ul className="ml-6 list-disc space-y-2 mt-2">
                    <li>Be thorough and accurate</li>
                    <li>Include dimensions, materials, and age</li>
                    <li>Mention any flaws or damage</li>
                    <li>List any included accessories or components</li>
                    <li>Describe the item's history if relevant</li>
                    <li>Use bullet points for easy scanning</li>
                    <li>Include brand, model, and other specific details</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Accurate Pricing</h3>
                  <ul className="ml-6 list-disc space-y-2 mt-2">
                    <li>Research similar items to set competitive prices</li>
                    <li>Consider the condition when pricing</li>
                    <li>Factor in original retail price and current market value</li>
                    <li>Be prepared for potential negotiations</li>
                    <li>Consider seasonal demand for certain items</li>
                    <li>Don't overprice - items priced fairly sell faster</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Shipping & Logistics</h3>
                  <ul className="ml-6 list-disc space-y-2 mt-2">
                    <li>Specify whether you offer shipping or local pickup only</li>
                    <li>Include estimated shipping costs if applicable</li>
                    <li>Mention packaging methods for fragile items</li>
                    <li>Be clear about who pays for shipping</li>
                    <li>Provide estimated shipping timeframes</li>
                    <li>Consider offering free shipping to attract more buyers</li>
                  </ul>
                </div>
              </div>
              
              <div className="rounded-lg border p-4 mt-6">
                <h3 className="mb-2 font-medium">Quick Checklist Before Listing</h3>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Are your photos clear and showing the actual item?</li>
                  <li>Is your title descriptive and accurate?</li>
                  <li>Have you included all relevant details in the description?\
