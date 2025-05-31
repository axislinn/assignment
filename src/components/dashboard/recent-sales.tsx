"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  total: number
  status: string
  createdAt: any
  sellerId: string
  productTitle: string
  productImage: string
  items: {
    productImage: string
    productTitle: string
  }[]
}

function RecentSales() {
  const { user } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isIndexBuilding, setIsIndexBuilding] = useState(false)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user) {
        setRecentOrders([]);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("sellerIds", "array-contains", user.uid),
          where("status", "==", "confirmed"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const confirmedSnapshot = await getDocs(q);
        const ordersData = confirmedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        setRecentOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
        setError("Failed to fetch recent orders");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px] text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  if (recentOrders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[200px] space-y-2">
        <p className="text-muted-foreground">No confirmed orders found</p>
        <p className="text-xs text-muted-foreground">Seller ID: {user?.uid}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center">
          <div className="relative h-12 w-12 rounded-md overflow-hidden">
            {order.items && order.items.length > 0 ? (
              <Image
                src={order.items[0].productImage || "/placeholder.png"}
                alt={order.items[0].productTitle || "Product"}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <Image
                src="/placeholder.png"
                alt="Product"
                fill
                className="object-cover"
                sizes="48px"
              />
            )}
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {order.items && order.items.length > 0 ? order.items[0].productTitle : "Untitled Product"}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.buyerName || "Anonymous Buyer"}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +${typeof order.total === 'number' ? order.total.toFixed(2) : "0.00"}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentSales
