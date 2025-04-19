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
}

function RecentSales() {
  const { user } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isIndexBuilding, setIsIndexBuilding] = useState(false)

  useEffect(() => {
    if (!user) {
      console.log("No user found")
      return
    }

    const fetchRecentOrders = async () => {
      try {
        console.log("Fetching orders for seller:", user.uid)
        
        const confirmedOrdersQuery = query(
          collection(db, "orders"),
          where("sellerId", "==", user.uid),
          where("status", "in", ["confirmed", "Confirmed", "CONFIRMED"]),
          orderBy("createdAt", "desc"),
          limit(5)
        )
        
        try {
          const confirmedSnapshot = await getDocs(confirmedOrdersQuery)
          console.log("Confirmed orders found:", confirmedSnapshot.size)
          
          const orders = confirmedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[]
          
          setRecentOrders(orders)
          setError(null)
          setIsIndexBuilding(false)
        } catch (queryError: any) {
          if (queryError?.message?.includes("requires an index")) {
            console.log("Index required, setting building state")
            setIsIndexBuilding(true)
            setError("Creating database index...")
          } else {
            throw queryError
          }
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch orders")
        setIsIndexBuilding(false)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()

    // Retry if index is building
    let retryInterval: NodeJS.Timeout
    if (isIndexBuilding) {
      retryInterval = setInterval(fetchRecentOrders, 5000) // Retry every 5 seconds
    }

    return () => {
      if (retryInterval) {
        clearInterval(retryInterval)
      }
    }
  }, [user, isIndexBuilding])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isIndexBuilding) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] space-y-4 text-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Setting up the database...</span>
        </div>
        <p className="text-sm text-muted-foreground">This may take a few minutes. The page will automatically refresh when ready.</p>
      </div>
    )
  }

  if (error && !isIndexBuilding) {
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
            <Image
              src={order.productImage || "/placeholder.png"}
              alt={order.productTitle || "Product"}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.productTitle || "Untitled Product"}</p>
            <p className="text-sm text-muted-foreground">
              {order.buyerName || "Anonymous Buyer"}
            </p>
          </div>
          <div className="ml-auto font-medium">+${order.total?.toFixed(2) || "0.00"}</div>
        </div>
      ))}
    </div>
  )
}

export default RecentSales
