"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { createNotification } from "@/lib/firebase/notifications"

export default function AccountUpgradePage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Redirect if user is not logged in or already a seller/admin
  if (!user) {
    router.push("/auth/login?redirect=/account/upgrade")
    return null
  }

  if (userRole === "seller" || userRole === "admin") {
    router.push("/seller/dashboard")
    return null
  }

  const handleUpgrade = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please accept the seller terms and conditions",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Update user role in Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        role: "seller",
        approved: false, // Requires admin approval
        sellerSince: new Date().toISOString(),
      })

      // Create notification for admin
      await createNotification({
        userId: "admin", // This would be your admin user ID
        type: "system",
        title: "New Seller Request",
        message: `${user.displayName || user.email} has requested to become a seller`,
        read: false,
      })

      // Create notification for user
      await createNotification({
        userId: user.uid,
        type: "system",
        title: "Seller Request Submitted",
        message: "Your request to become a seller has been submitted and is pending approval",
        read: false,
      })

      toast({
        title: "Request submitted",
        description: "Your request to become a seller is pending approval",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error upgrading account:", error)
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4 -ml-4 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Become a Seller</h1>

        <Card>
          <CardHeader>
            <CardTitle>Seller Account Benefits</CardTitle>
            <CardDescription>
              Upgrade your account to start selling your items on SecondChance Marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">List and Sell Your Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Create listings for items you want to sell and reach thousands of potential buyers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Seller Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to a comprehensive dashboard to manage your listings, track sales, and view analytics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive payments securely through our platform with protection for both buyers and sellers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Seller Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Get dedicated support for any issues related to your listings or sales
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Seller Requirements</h3>
              <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                <li>You must be at least 18 years old</li>
                <li>Valid ID and contact information</li>
                <li>Ability to ship items or arrange local pickup</li>
                <li>Commitment to accurate descriptions and fair pricing</li>
                <li>Prompt communication with buyers</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the seller terms and conditions
                </Label>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleUpgrade} disabled={isSubmitting || !termsAccepted}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Upgrade to Seller Account"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
