"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthProvider } from "@/lib/auth-context"
import { addDoc, collection, serverTimestamp, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ReceiptVoucher } from "@/components/receipt-voucher"
import { ExportReceiptDialog } from "@/components/export-receipt-dialog"
import { createReceipt } from "@/lib/firebase/collections"
import { v4 as uuidv4 } from 'uuid'
import { generateReceiptPDF } from '@/lib/utils/pdf-generator'
import { createNotification } from "@/lib/firebase/notifications"

interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  image: string
  quantity: number
  maxQuantity: number
  sellerId: string
  buyerId: string
  createdAt: any
}

const PAYMENT_METHODS = [
  { id: 'kbzpay', name: 'KBZPay', icon: '/payment-methods/KPay.png' },
  { id: 'wavepay', name: 'WavePay', icon: '/payment-methods/WavePay.png' },
  { id: 'ayapay', name: 'AYAPay', icon: '/payment-methods/Ayapay.jpg' },
  { id: 'uabpay', name: 'UABPay', icon: '/payment-methods/UABPay.jpg' },
  { id: 'cod', name: 'CoD', icon: '/payment-methods/COD.png' },
]

export default function CartPage() {
  return (
    <AuthProvider>
      <CartContent />
    </AuthProvider>
  )
}

function CartContent() {
  const { user, loading: authLoading, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [showPaymentError, setShowPaymentError] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [pendingReceipt, setPendingReceipt] = useState<any>(null)

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const cartsQuery = query(
          collection(db, "carts"),
          where("buyerId", "==", user.uid)
        )
        const querySnapshot = await getDocs(cartsQuery)
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CartItem[]
        setCartItems(items)
      } catch (error) {
        console.error("Error fetching cart items:", error)
        toast({
          title: "Error",
          description: "Failed to load cart items. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCartItems()
  }, [user, toast])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const item = cartItems.find(item => item.id === itemId)
      if (!item) return

      // Ensure quantity is within limits
      const quantity = Math.max(1, Math.min(newQuantity, item.maxQuantity))

      // Update in Firestore
      await updateDoc(doc(db, "carts", itemId), {
        quantity
      })

      // Update local state
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ))
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      // Remove from Firestore
      await deleteDoc(doc(db, "carts", itemId))

      // Update local state
      setCartItems(prev => prev.filter(item => item.id !== itemId))

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      })
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/cart")
      return
    }

    if (userRole === "seller") {
      toast({
        title: "Access Denied",
        description: "Sellers cannot purchase products. Please use a buyer account.",
        variant: "destructive"
      })
      return
    }

    if (cartItems.length === 0) {
      toast({ title: "Error", description: "No items in cart", variant: "destructive" })
      return
    }

    if (!selectedPaymentMethod) {
      setShowPaymentError(true)
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to proceed with checkout",
        variant: "destructive"
      })
      return
    }

    setShowPaymentError(false)
    setProcessing(true)

    try {
      // Group cart items by sellerId
      const itemsBySeller = cartItems.reduce((acc, item) => {
        if (!acc[item.sellerId]) acc[item.sellerId] = [];
        acc[item.sellerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Process each cart item (for orders, receipts, and buyer notifications)
      for (const item of cartItems) {
        try {
          // Get seller information
          const sellerDocRef = await getDoc(doc(db, "users", item.sellerId))
          if (!sellerDocRef.exists()) {
            throw new Error(`Seller not found for ID: ${item.sellerId}`)
          }
          const sellerInfo = sellerDocRef.data()

          // Create order
          const orderData = {
            buyerId: user.uid,
            buyerName: user.displayName || "Anonymous",
            sellerId: item.sellerId,
            productId: item.productId,
            productTitle: item.title,
            productImage: item.image,
            quantity: item.quantity,
            price: item.price,
            total: (item.price * item.quantity) + 5.99 + ((item.price * item.quantity) * 0.08),
            status: "confirmed",
            createdAt: new Date().toISOString(),
            paymentMethod: selectedPaymentMethod,
          }
          const orderRef = await addDoc(collection(db, "orders"), orderData)

          // Create receipt
          const receiptData = {
            orderId: orderRef.id,
            buyerId: user.uid,
            buyerName: user.displayName || "Anonymous",
            sellerId: item.sellerId,
            sellerName: sellerInfo.displayName || "Anonymous",
            productId: item.productId,
            productTitle: item.title,
            productImage: item.image,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            shipping: 5.99,
            tax: (item.price * item.quantity) * 0.08,
            total: (item.price * item.quantity) + 5.99 + ((item.price * item.quantity) * 0.08),
            paymentMethod: selectedPaymentMethod,
            status: "completed" as "completed" | "pending" | "cancelled"
          }
          await createReceipt(receiptData)

          // Notify buyer (per product)
          await createNotification({
            userId: user.uid,
            type: "order_status",
            title: "Order Confirmed",
            message: `Your order for ${item.title} has been confirmed. Click to view receipt.`,
            read: false,
            orderId: orderRef.id,
            productId: item.productId,
            link: `/orders/${orderRef.id}`
          })

          // Remove item from cart
          await deleteDoc(doc(db, "carts", item.id))
        } catch (itemError) {
          toast({
            title: "Error",
            description: `Failed to process item: ${item.title}. Please try again.`,
            variant: "destructive",
          })
          throw itemError
        }
      }

      // Notify each seller once with all their products
      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        const productTitles = items.map(i => i.title).join(', ');
        // Find the first orderId for this seller from the processed items
        const firstOrderId = items[0]?.orderId || undefined;
        const notificationData = {
          userId: sellerId,
          type: "order_status" as "order_status",
          orderId: firstOrderId || "testOrderId",
          title: "New Order Received",
          message: `You have received a new order for: ${productTitles}`,
          read: false
        };
        console.log("Notification data being sent:", notificationData);
        await createNotification(notificationData);
      }

      toast({
        title: "Order Confirmed",
        description: "Your order has been confirmed and the receipt is ready.",
        variant: "success",
      })

      // Clear cart items from state
      setCartItems([])
      router.push('/products')
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to process checkout: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleExportReceipt = () => {
    if (!pendingReceipt) return
    generateReceiptPDF(pendingReceipt)
    setShowExportDialog(false)
    setCartItems([])
    router.push('/products')
  }

  const handleSkipExport = () => {
    setShowExportDialog(false)
    setCartItems([])
    router.push('/products')
  }

  const handleCancelOrder = () => {
    setShowReceipt(false)
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = cartItems.length > 0 ? 5.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="mb-2 text-xl font-semibold">Please log in</h2>
            <p className="mb-4 text-center text-muted-foreground">
              You need to be logged in to view your cart.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
            <p className="mb-4 text-center text-muted-foreground">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-24 rounded-md object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-product.png';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                        className="h-8 w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Payment Method</h3>
                  {showPaymentError && (
                    <span className="text-sm text-destructive">Please select a payment method</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPaymentMethod(method.id)
                        setShowPaymentError(false)
                      }}
                      className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${selectedPaymentMethod === method.id
                        ? 'border-primary bg-primary/10'
                        : showPaymentError
                          ? 'border-destructive hover:border-destructive/50'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-payment.png';
                        }}
                      />
                      <span className="text-sm font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={processing || cartItems.length === 0}
              >
                {processing ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <ReceiptVoucher
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        onConfirm={handleCheckout}
        onCancel={handleCancelOrder}
        orderData={pendingReceipt}
      />

      <ExportReceiptDialog
        isOpen={showExportDialog}
        onClose={() => {
          setShowExportDialog(false)
          setCartItems([])
          router.push('/products')
        }}
        onExport={handleExportReceipt}
        onSkip={handleSkipExport}
      />
    </div>
  )
}