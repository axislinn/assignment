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
import { getUserNotifications, type Notification, deleteNotification, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/firebase/notifications"
import { createReceipt } from "@/lib/firebase/collections"
import { createNotification } from "@/lib/firebase/notifications"
import { ReceiptVoucher } from "@/components/receipt-voucher"
import { ExportReceiptDialog } from "@/components/export-receipt-dialog"
import { generateReceiptPDF } from "@/lib/utils/pdf-generator"
import type { ReceiptHistory } from "@/lib/firebase/collections"
import { useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bell, Check, MessageSquare, Package, ShoppingBag, Tag } from "lucide-react"

export function NotificationsTab({ onUnreadCountChange }: { onUnreadCountChange?: (count: number) => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptHistory | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [clickedNotificationId, setClickedNotificationId] = useState<string | null>(null)
  const [actionedNotificationId, setActionedNotificationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const userNotifications = await getUserNotifications(user.uid)
        setNotifications(userNotifications)
        // Calculate and notify parent about unread count
        const unreadCount = userNotifications.filter(n => !n.read).length
        onUnreadCountChange?.(unreadCount)
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
  }, [user, toast, onUnreadCountChange])

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await markAllNotificationsAsRead(user.uid)
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      )
      onUnreadCountChange?.(0)
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleAccept = async (notification: Notification) => {
    /* Commented out accept functionality
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
        // Delete the notification from database
        await deleteNotification(notification.id)
        // Remove from UI
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        toast({ title: "Order accepted", description: "The buyer has been notified." })
      } catch (error) {
        console.error("Update error:", error);
        toast({ title: "Error", description: error instanceof Error ? error.message : String(error) });
      } finally {
        setActionedNotificationId(null)
      }
    }, 200)
    */
  }

  const handleDeny = async (notification: Notification) => {
    /* Commented out deny functionality
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
        // Delete the notification from database
        await deleteNotification(notification.id)
        // Remove from UI
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        toast({ title: "Order denied", description: "The buyer has been notified." })
      } catch (error) {
        toast({ title: "Error", description: "Failed to deny order." })
      } finally {
        setActionedNotificationId(null)
      }
    }, 200)
    */
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.type === "order_status" && notification.orderId) {
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
        setError("Failed to fetch receipt information");
        toast({
          title: "Error",
          description: "Failed to fetch receipt information",
          variant: "destructive",
        });
      }
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_order":
        return <ShoppingBag className="h-5 w-5 text-blue-600" />
      case "order_status":
        return <Package className="h-5 w-5 text-green-600" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-600" />
      case "product_sold":
        return <Tag className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      )
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

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
      {notifications.some((notification) => !notification.read) && (
        <div className="flex justify-end px-5">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Mark All as Read
          </Button>
        </div>
      )}
      {notifications.map((notification) => {
        const isBuyer = user?.uid === notification.userId;
        const isOrderNotification = notification.type === "order_status" && notification.orderId;
        const isRejectedOrder =
          notification.type === "order_status" &&
          notification.title === "Order Rejected";
        const cardClass = [
          notification.read ? "bg-card" : "bg-muted/20",
          isOrderNotification ? "transition-transform duration-150 cursor-pointer hover:bg-muted/50" : "",
          clickedNotificationId === notification.id ? "scale-95" : "",
          actionedNotificationId === notification.id ? "opacity-50 scale-95 transition-all duration-200" : "",
          isRejectedOrder && isBuyer ? "border-2 border-red-500 bg-transparent" : ""
        ].join(" ");
        return (
          <Card
            key={notification.id}
            className={cardClass}
            onClick={isOrderNotification ? () => handleNotificationClick(notification) : undefined}
            style={isOrderNotification && !notification.read ? { border: "2px solid #22c55e" } : {}}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {notification.createdAt.toLocaleDateString()} at{" "}
                      {notification.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!notification.read && (
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {showReceiptModal && selectedReceipt && (
        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-[210mm] w-[210mm] p-8 max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-none">
              <DialogTitle className="text-2xl font-bold text-center mb-6">Order Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 flex-1 overflow-y-auto">
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
                <div className="space-y-4">
                  {selectedReceipt.products.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={product.productImage}
                        alt={product.productTitle}
                        className="h-20 w-20 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.productTitle}</p>
                        <p className="text-sm text-muted-foreground">Seller: {product.sellerName}</p>
                        <p className="text-sm">Quantity: {product.quantity}</p>
                        <p className="text-sm">Price: ${product.price.toFixed(2)}</p>
                        <p className="text-sm">Subtotal: ${product.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Price Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedReceipt.products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}</span>
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
            </div>
            <DialogFooter className="flex-none pt-4 mt-6 border-t">
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