import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./config"

export async function getSellerStats(sellerId: string) {
  try {
    // Get seller's products
    const productsQuery = query(collection(db, "products"), where("sellerId", "==", sellerId))
    const productsSnapshot = await getDocs(productsQuery)
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const totalListings = products.length
    const activeListings = products.filter((product) => product.status === "active").length
    const pendingListings = products.filter((product) => product.status === "pending").length

    // In a real app, you would have an orders collection to get this data
    // For demo purposes, we'll return mock data
    const totalSales = 24
    const totalRevenue = 1250.75

    // Mock recent sales data
    const recentSales = [
      { id: "1", product: "Vintage Camera", price: 120, date: "2023-05-15" },
      { id: "2", product: "Leather Jacket", price: 85.5, date: "2023-05-12" },
      { id: "3", product: "Antique Clock", price: 220, date: "2023-05-10" },
    ]

    // Mock top products data
    const topProducts = [
      { id: "1", product: "Vintage Camera", sales: 5 },
      { id: "2", product: "Leather Jacket", sales: 3 },
      { id: "3", product: "Antique Clock", sales: 2 },
    ]

    return {
      totalListings,
      activeListings,
      pendingListings,
      totalSales,
      totalRevenue,
      recentSales,
      topProducts,
    }
  } catch (error) {
    console.error("Error getting seller stats:", error)
    // Return default stats
    return {
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0,
      totalSales: 0,
      totalRevenue: 0,
      recentSales: [],
      topProducts: [],
    }
  }
}
