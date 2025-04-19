"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Search, Truck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the Order type
interface Order {
  id: string;
  productTitle: string;
  productPrice: number;
  status: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  buyerId: string;
  sellerId: string;
  price?: number;
}

export default function DashboardOrdersPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    
    const fetchOrders = async () => {
      try {
        let ordersQuery
        
        if (userRole === "admin") {
          // Admins can see all orders
          ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
          )
        } else if (userRole === "seller") {
          // Sellers can only see orders for their products
          ordersQuery = query(
            collection(db, "orders"),
            where("sellerId", "==", user.uid),
            orderBy("createdAt", "desc")
          )
        } else {
          // Buyers can only see their own orders
          ordersQuery = query(
            collection(db, "orders"),
            where("buyerId", "==", user.uid),
            orderBy("createdAt", "desc")
          )
        }
        
        const ordersSnapshot = await getDocs(ordersQuery)
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]
        
        setOrders(ordersData)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [user, userRole, router, toast])
  
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
      })
      
      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status }
            : order
        )
      )
      
      toast({
        title: "Status updated",
        description: `Order status has been updated to ${status}`,
      })
      
      setSelectedOrder(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }
  
  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsDialogOpen(true)
  }
  
  // Add a function to handle status changes
  const handleStatusSelect = (status: string) => {
    setNewStatus(status)
  }
  
  const filteredOrders = orders.filter((order) =>
    order.productTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "outline"
      case "shipped":
        return "default"
      case "delivered":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }
  
  return (
    <DashboardShell>
      <DashboardShell.Header>
        <DashboardShell.Title>Orders</DashboardShell.Title>
        <DashboardShell.Description>
          {userRole === "buyer" ? "View your orders" : "Manage customer orders"}
        </DashboardShell.Description>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full min-w-[200px] pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </DashboardShell.Header>
      <DashboardShell.Content>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-4">No orders found</p>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : userRole === "buyer" ? "You haven't placed any orders yet" : "No orders have been placed yet"}
            </p>
            {userRole === "buyer" && (
              <Button asChild>
                <a href="/products">Browse Products</a>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {(userRole === "admin" || userRole === "seller") && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{order.productTitle}</TableCell>
                    <TableCell>${(order.productPrice || order.price)?.toFixed(2) || "N/A"}</TableCell>
                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    {(userRole === "admin" || userRole === "seller") && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <a href={`/dashboard/orders/${order.id}`}>View Details</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openStatusDialog(order)}>
                              <Truck className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DashboardShell.Content>
      
      {/* Status Update Dialog - Moved outside the loop */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Update Order Status</DialogTitle>
      <DialogDescription>
        Change the status for order {selectedOrder?.id?.substring(0, 8)}...
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <Select value={newStatus} onValueChange={handleStatusSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a status" /> {/* Placeholder is used here */}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <DialogFooter>
      <Button
        onClick={() => handleStatusChange(selectedOrder?.id || "", newStatus)}
        disabled={!selectedOrder || selectedOrder.status === newStatus}
      >
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </DashboardShell>
  )
}