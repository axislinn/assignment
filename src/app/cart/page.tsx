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
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
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

interface CartItem {
  productId: string
  title: string
  price: number
  image: string
  quantity: number
  maxQuantity: number
  sellerId: string
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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cartItem, setCartItem] = useState<CartItem | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [showPaymentError, setShowPaymentError] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  useEffect(() => {
    // Get cart item from sessionStorage
    const storedItem = sessionStorage.getItem('cartItem')
    if (storedItem) {
      setCartItem(JSON.parse(storedItem))
      // Clear the stored item after reading
      sessionStorage.removeItem('cartItem')
    }
  }, [])

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!cartItem) return

    // Ensure quantity is within limits
    const quantity = Math.max(1, Math.min(newQuantity, cartItem.maxQuantity))
    
    setCartItem(prev => prev ? { ...prev, quantity } : null)
  }

  const handleRemoveItem = () => {
    setCartItem(null)
    setShowDeleteDialog(false)
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/cart")
      return
    }

    if (!cartItem) {
      toast({
        title: "Error",
        description: "No items in cart",
        variant: "destructive",
      })
      return
    }

    if (!selectedPaymentMethod) {
      setShowPaymentError(true)
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to proceed with checkout",
        variant: "destructive",
      })
      return
    }

    setShowPaymentError(false)
    setShowReceipt(true)
  }

  const handleConfirmOrder = async () => {
    if (!user || !cartItem) {
      toast({
        title: "Error",
        description: "Missing user or cart data",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const orderId = uuidv4()
      // Create receipt data
      const receiptData = {
        orderId,
        buyerId: user.uid,
        buyerName: user.displayName || "Anonymous",
        sellerId: cartItem.sellerId,
        productId: cartItem.productId,
        productTitle: cartItem.title,
        productImage: cartItem.image,
        quantity: cartItem.quantity,
        price: cartItem.price,
        subtotal: cartItem.price * cartItem.quantity,
        shipping: 5.99,
        tax: (cartItem.price * cartItem.quantity) * 0.08,
        total: (cartItem.price * cartItem.quantity) + 5.99 + ((cartItem.price * cartItem.quantity) * 0.08),
        paymentMethod: selectedPaymentMethod,
        status: "pending" as const
      }

      // Add to receipt_history collection
      await createReceipt(receiptData)

      // Show success toast
      toast({
        title: "Order Confirmed",
        description: "Your order has been successfully placed!",
        variant: "success",
      })

      // Close receipt dialog and show export dialog
      setShowReceipt(false)
      setShowExportDialog(true)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleExportReceipt = () => {
    if (!cartItem) return

    const receiptData = {
      orderId: uuidv4(),
      buyerId: user?.uid || '',
      buyerName: user?.displayName || 'Anonymous',
      sellerId: cartItem.sellerId,
      productId: cartItem.productId,
      productTitle: cartItem.title,
      productImage: cartItem.image,
      quantity: cartItem.quantity,
      price: cartItem.price,
      subtotal: cartItem.price * cartItem.quantity,
      shipping: 5.99,
      tax: (cartItem.price * cartItem.quantity) * 0.08,
      total: (cartItem.price * cartItem.quantity) + 5.99 + ((cartItem.price * cartItem.quantity) * 0.08),
      paymentMethod: selectedPaymentMethod,
      status: "pending" as const
    }

    generateReceiptPDF(receiptData)
    setShowExportDialog(false)
    setCartItem(null)
    router.push('/products')
  }

  const handleSkipExport = () => {
    setShowExportDialog(false)
    setCartItem(null)
    router.push('/products')
  }

  const handleCancelOrder = () => {
    setShowReceipt(false)
  }

  // Calculate totals
  const subtotal = cartItem ? cartItem.price * cartItem.quantity : 0
  const shipping = cartItem ? 5.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!cartItem) {
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
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <img
                  src={cartItem.image}
                  alt={cartItem.title}
                  className="h-24 w-24 rounded-md object-cover"
                  onError={(e) => {
                    console.error(`Failed to load cart item image: ${cartItem.image}`);
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-product.png';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{cartItem.title}</h3>
                  <p className="text-lg font-bold text-primary">${cartItem.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                      disabled={cartItem.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={cartItem.maxQuantity}
                      value={cartItem.quantity}
                      onChange={(e) => handleUpdateQuantity(Number(e.target.value))}
                      className="h-8 w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                      disabled={cartItem.quantity >= cartItem.maxQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8 text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                      className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                        selectedPaymentMethod === method.id
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
                          console.error(`Failed to load image: ${method.icon}`);
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
                disabled={processing || !cartItem}
              >
                {processing ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReceiptVoucher
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        onConfirm={handleConfirmOrder}
        onCancel={handleCancelOrder}
        orderData={{
          orderId: uuidv4(),
          buyerId: user?.uid || '',
          buyerName: user?.displayName || 'Anonymous',
          sellerId: cartItem?.sellerId || '',
          productId: cartItem?.productId || '',
          productTitle: cartItem?.title || '',
          productImage: cartItem?.image || '',
          quantity: cartItem?.quantity || 0,
          price: cartItem?.price || 0,
          subtotal: (cartItem?.price || 0) * (cartItem?.quantity || 0),
          shipping: 5.99,
          tax: ((cartItem?.price || 0) * (cartItem?.quantity || 0)) * 0.08,
          total: ((cartItem?.price || 0) * (cartItem?.quantity || 0)) + 5.99 + (((cartItem?.price || 0) * (cartItem?.quantity || 0)) * 0.08),
          paymentMethod: selectedPaymentMethod,
        }}
      />

      <ExportReceiptDialog
        isOpen={showExportDialog}
        onClose={() => {
          setShowExportDialog(false)
          setCartItem(null)
          router.push('/products')
        }}
        onExport={handleExportReceipt}
        onSkip={handleSkipExport}
      />
    </div>
  )
}
