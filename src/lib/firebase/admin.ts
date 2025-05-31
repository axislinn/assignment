import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "./config"

export async function getAdminStats() {
  try {
    // Get user counts
    const usersQuery = await getDocs(collection(db, "users"))
    const users = usersQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const totalUsers = users.length
    const totalBuyers = users.filter((user) => user.role === "buyer").length
    const totalSellers = users.filter((user) => user.role === "seller").length
    const pendingSellers = users.filter((user) => user.role === "seller" && !user.approved).length

    // Get recent users (last 10)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((user) => ({
        id: user.id,
        name: user.displayName || user.email?.split("@")[0] || "Unknown",
        email: user.email || "No email",
        role: user.role,
        date: user.createdAt,
      }))

    // Get product counts
    const productsQuery = await getDocs(collection(db, "products"))
    const products = productsQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const totalProducts = products.length
    const pendingProducts = products.filter((product) => product.status === "pending").length

    // Get pending approvals
    const pendingSellerApprovals = users
      .filter((user) => user.role === "seller" && !user.approved)
      .slice(0, 5)
      .map((user) => ({
        id: user.id,
        type: "seller",
        name: user.displayName || user.email?.split("@")[0] || "Unknown",
        email: user.email || "No email",
        date: user.createdAt,
      }))

    const pendingProductApprovals = await Promise.all(
      products
        .filter((product) => product.status === "pending")
        .slice(0, 5)
        .map(async (product) => {
          // Get seller info
          let sellerName = "Unknown Seller"
          try {
            const sellerDoc = await getDoc(doc(db, "users", product.sellerId))
            if (sellerDoc.exists()) {
              sellerName = sellerDoc.data().displayName || sellerDoc.data().email?.split("@")[0] || "Unknown"
            }
          }

          return {
            id: product.id,
            type: "product",
            title: product.title || "Untitled Product",
            seller: sellerName,
            date: product.createdAt?.toDate?.() || product.createdAt || new Date(),
          }
        }),
    )

    const pendingApprovals = [...pendingSellerApprovals, ...pendingProductApprovals]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    // Get sales data (simplified for demo)
    const totalSales = 180 // This would come from a real orders collection
    const totalRevenue = 8750.5 // This would come from a real orders collection

    return {
      totalUsers,
      totalBuyers,
      totalSellers,
      pendingSellers,
      totalProducts,
      pendingProducts,
      totalSales,
      totalRevenue,
      recentUsers,
      pendingApprovals,
    }
  } catch (error) {
    // Return default stats
    return {
      totalUsers: 0,
      totalBuyers: 0,
      totalSellers: 0,
      pendingSellers: 0,
      totalProducts: 0,
      pendingProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      recentUsers: [],
      pendingApprovals: [],
    }
  }
}

export async function approveSeller(userId: string) {
  try {
    await updateDoc(doc(db, "users", userId), {
      approved: true,
    })
    return true
  } catch (error) {
    throw error
  }
}

export async function approveProduct(productId: string) {
  try {
    await updateDoc(doc(db, "products", productId), {
      status: "active",
    })
    return true
  } catch (error) {
    throw error
  }
}

export async function getUsers(options: { role?: string; approved?: boolean } = {}) {
  try {
    let q = collection(db, "users")

    // Add filters if provided
    const filters = []

    if (options.role) {
      filters.push(where("role", "==", options.role))
    }

    if (options.approved !== undefined) {
      filters.push(where("approved", "==", options.approved))
    }

    if (filters.length > 0) {
      q = query(q, ...filters)
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date(),
    }))
  } catch (error) {
    return []
  }
}
