"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/auth-context"
import { getUserNotifications, type Notification } from "@/lib/firebase/notifications"
import { createReceipt } from "@/lib/firebase/collections"
import { createNotification } from "@/lib/firebase/notifications"
import { ReceiptVoucher } from "@/components/receipt-voucher"
import { ExportReceiptDialog } from "@/components/export-receipt-dialog"
import { generateReceiptPDF } from "@/lib/utils/pdf-generator"
import type { ReceiptHistory } from "@/lib/firebase/collections"
import { useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function NotificationsTab() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptHistory | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [clickedNotificationId, setClickedNotificationId] = useState<string | null>(null)
  const [actionedNotificationId, setActionedNotificationId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const userNotifications = await getUserNotifications(user.uid)
        setNotifications(userNotifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user, toast])

  const handleAccept = async (notification: Notification) => {
    setActionedNotificationId(notification.id)
    setTimeout(async () => {
      try {
        console.log("Debug - Current user:", {
          uid: user?.uid
        });
        // Fetch order data for receipt
        const orderDoc = await getDoc(doc(db, "orders", notification.orderId!));
        const orderData = orderDoc.data();
        if (!orderData) throw new Error("Order not found");
        console.log("Debug - Order data:", {
          orderId: notification.orderId,
          sellerId: orderData.sellerId,
          buyerId: orderData.buyerId,
          currentUserId: user?.uid
        });
        // Update order status to confirmed
        await updateDoc(doc(db, "orders", notification.orderId!), {
          status: "confirmed",
          updatedAt: new Date().toISOString()
        })
        // Create receipt
        await createReceipt({
          orderId: notification.orderId!,
          buyerId: orderData.buyerId,
          buyerName: orderData.buyerName,
          sellerId: orderData.sellerId,
          sellerName: orderData.sellerName,
          productId: orderData.productId,
          productTitle: orderData.productTitle,
          productImage: orderData.productImage,
          quantity: orderData.quantity,
          price: orderData.price,
          subtotal: orderData.price * orderData.quantity,
          shipping: 5.99,
          tax: (orderData.price * orderData.quantity) * 0.08,
          total: (orderData.price * orderData.quantity) + 5.99 + ((orderData.price * orderData.quantity) * 0.08),
          paymentMethod: orderData.paymentMethod,
          status: "completed"
        })
        // Notify buyer
        await createNotification({
          userId: orderData.buyerId,
          type: "order_status",
          title: "Order Accepted",
          message: "Your order has been accepted! Click to see the receipt.",
          read: false,
          orderId: notification.orderId,
          productId: orderData.productId,
          link: `/orders/${notification.orderId}`
        })
        // Optionally, mark notification as read or remove it from UI
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        toast({ title: "Order accepted", description: "The buyer has been notified." })
      } catch (error) {
        console.error("Update error:", error);
        toast({ title: "Error", description: error instanceof Error ? error.message : String(error) });
      } finally {
        setActionedNotificationId(null)
      }
    }, 200)
  }

  const handleDeny = async (notification: Notification) => {
    setActionedNotificationId(notification.id)
    setTimeout(async () => {
      try {
        // Update order status to rejected
        await updateDoc(doc(db, "orders", notification.orderId!), {
          status: "rejected",
          updatedAt: new Date().toISOString()
        })
        // Fetch order data
        const orderDoc = await getDoc(doc(db, "orders", notification.orderId!))
        const orderData = orderDoc.data()
        if (!orderData) throw new Error("Order not found")
        // Notify buyer
        await createNotification({
          userId: orderData.buyerId,
          type: "order_status",
          title: "Order Rejected",
          message: "Your order was rejected by the seller.",
          read: false,
          orderId: notification.orderId,
          productId: orderData.productId
        })
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        toast({ title: "Order denied", description: "The buyer has been notified." })
      } catch (error) {
        toast({ title: "Error", description: "Failed to deny order." })
      } finally {
        setActionedNotificationId(null)
      }
    }, 200)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (
      notification.type === "order_status" &&
      notification.message.includes("accepted") &&
      notification.orderId
    ) {
      setClickedNotificationId(notification.id)
      setTimeout(() => setClickedNotificationId(null), 200)
      try {
        if (!user) return;
        const q = query(
          collection(db, "receipt_history"),
          where("orderId", "==", notification.orderId),
          where("buyerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const receiptData = snapshot.docs[0].data();
          const receipt = { 
            id: snapshot.docs[0].id,
            ...receiptData 
          } as unknown as ReceiptHistory;
          setSelectedReceipt(receipt);
          setShowReceiptModal(true);
        } else {
          toast({
            title: "Receipt not found",
            description: "No receipt found for this order.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("[DEBUG] Error during receipt query:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <p className="text-muted-foreground">No notifications</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const isBuyer = user?.uid === notification.userId;
        const isAcceptedOrder =
          notification.type === "order_status" &&
          notification.message.includes("accepted") &&
          notification.orderId;
        const isBuyerAcceptedOrder = isAcceptedOrder && isBuyer;
        const isSellerNewOrder = notification.type === "new_order";
        const isRejectedOrder =
          notification.type === "order_status" &&
          notification.title === "Order Rejected";
        const cardClass = [
          notification.read ? "bg-card" : "bg-muted/20",
          (isBuyerAcceptedOrder || isSellerNewOrder) ? "transition-transform duration-150" : "",
          clickedNotificationId === notification.id ? "scale-95" : "",
          actionedNotificationId === notification.id ? "opacity-50 scale-95 transition-all duration-200" : "",
          isRejectedOrder && isBuyer ? "border-2 border-red-500 bg-transparent" : ""
        ].join(" ");
        return (
          <Card
            key={notification.id}
            className={cardClass}
            onClick={isBuyerAcceptedOrder ? () => handleNotificationClick(notification) : undefined}
            style={isBuyerAcceptedOrder ? { cursor: "pointer", border: "2px solid #22c55e" } : {}}
          >
            <CardHeader>
              <CardTitle className={isRejectedOrder && isBuyer ? "text-red-700 font-bold" : "text-lg"}>{notification.title}</CardTitle>
              <CardDescription className={isRejectedOrder && isBuyer ? "text-white" : ""}>
                {notification.createdAt.toLocaleDateString()} at {notification.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <p className={isRejectedOrder && isBuyer ? "text-red-700" : "text-sm text-muted-foreground"}>{notification.message}</p>
                {isSellerNewOrder && (
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleAccept(notification)} variant="default">Accept</Button>
                    <Button onClick={() => handleDeny(notification)} variant="destructive">Deny</Button>
                  </div>
                )}
                {isBuyerAcceptedOrder && (
                  <span className="text-green-600 font-semibold">Click to view receipt</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {showReceiptModal && selectedReceipt && (
        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-[210mm] w-[210mm] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-6">Order Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-xl font-semibold">SecondChance Marketplace</h2>
                <p className="text-sm text-muted-foreground">Order Receipt</p>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Order Information</h3>
                  <p className="text-sm">Order ID: {selectedReceipt.orderId}</p>
                  <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm">Buyer: {selectedReceipt.buyerName}</p>
                  <p className="text-sm">Seller: {selectedReceipt.sellerName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Payment Method</h3>
                  <p className="text-sm capitalize">{selectedReceipt.paymentMethod}</p>
                </div>
              </div>
              {/* Product Details */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Product Details</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedReceipt.productImage}
                    alt={selectedReceipt.productTitle}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{selectedReceipt.productTitle}</p>
                    <p className="text-sm">Quantity: {selectedReceipt.quantity}</p>
                    <p className="text-sm">Price: ${selectedReceipt.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              {/* Price Breakdown */}
              <h3 className="font-medium mb-2">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${selectedReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${selectedReceipt.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${selectedReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${selectedReceipt.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  generateReceiptPDF(selectedReceipt);
                  setShowReceiptModal(false);
                }}
                className="w-40"
              >
                Export to PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <ExportReceiptDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={() => {
          if (selectedReceipt) {
            generateReceiptPDF(selectedReceipt);
          }
          setShowExportDialog(false);
        }}
        onSkip={() => setShowExportDialog(false)}
      />
    </div>
  )
} 