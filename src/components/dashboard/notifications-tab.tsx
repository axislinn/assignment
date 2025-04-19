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
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/auth-context"

interface Order {
  id: string
  buyerId: string
  buyerName: string
  productId: string
  productTitle: string
  productImage: string
  quantity: number
  price: number
  total: number
  status: string
  createdAt: any
}

export function NotificationsTab() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showDenyDialog, setShowDenyDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchPendingOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("sellerId", "==", user.uid),
          where("status", "==", "pending")
        )
        const snapshot = await getDocs(ordersQuery)
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[]
        setPendingOrders(orders)
      } catch (error) {
        console.error("Error fetching pending orders:", error)
        toast({
          title: "Error",
          description: "Failed to load pending orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPendingOrders()
  }, [user, toast])

  const handleAccept = async () => {
    if (!selectedOrder) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        status: "confirmed",
        updatedAt: serverTimestamp()
      })

      setPendingOrders(current => 
        current.filter(order => order.id !== selectedOrder.id)
      )

      toast({
        title: "Order Accepted",
        description: "The order has been accepted successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error accepting order:", error)
      // Only show error toast if it's a Firebase error
      if (error instanceof Error && error.message.includes("Firebase")) {
        toast({
          title: "Error",
          description: "Failed to accept order. Please try again.",
          variant: "destructive",
        })
      }
    }

    setShowAcceptDialog(false)
    setSelectedOrder(null)
  }

  const handleDeny = async () => {
    if (!selectedOrder) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        status: "rejected",
        updatedAt: serverTimestamp()
      })

      setPendingOrders(current => 
        current.filter(order => order.id !== selectedOrder.id)
      )

      toast({
        title: "Order Denied",
        description: "The order has been denied.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error denying order:", error)
      // Only show error toast if it's a Firebase error
      if (error instanceof Error && error.message.includes("Firebase")) {
        toast({
          title: "Error",
          description: "Failed to deny order. Please try again.",
          variant: "destructive",
        })
      }
    }

    setShowDenyDialog(false)
    setSelectedOrder(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (pendingOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <p className="text-muted-foreground">No pending orders</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pendingOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <CardTitle className="text-lg">New Order: {order.productTitle}</CardTitle>
            <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center gap-4">
                <img
                  src={order.productImage || "/placeholder.svg"}
                  alt={order.productTitle}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium">Buyer: {order.buyerName}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                  <p className="text-sm text-muted-foreground">Total: ${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedOrder(order)
                setShowDenyDialog(true)
              }}
            >
              Deny
            </Button>
            <Button
              onClick={() => {
                setSelectedOrder(order)
                setShowAcceptDialog(true)
              }}
            >
              Accept
            </Button>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this order? This will confirm the order and notify the buyer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>Accept</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deny Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deny this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeny} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deny
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 