import { doc, getDoc, setDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./config"
import type { Product } from "@/lib/types"

export async function getWishlist(userId: string) {
  try {
    const wishlistRef = doc(db, "wishlists", userId)
    const wishlistDoc = await getDoc(wishlistRef)

    if (!wishlistDoc.exists()) {
      return []
    }

    const productIds = wishlistDoc.data().products || []
    const products: Product[] = []

    // Fetch products in batches of 10 (Firestore limitation for 'in' queries)
    for (let i = 0; i < productIds.length; i += 10) {
      const batch = productIds.slice(i, i + 10)
      const productsQuery = query(
        collection(db, "products"),
        where("__name__", "in", batch)
      )
      const productsSnapshot = await getDocs(productsQuery)
      
      productsSnapshot.forEach((doc) => {
        const data = doc.data()
        // Ensure all required Product fields are present
        const product: Product = {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          price: data.price || 0,
          category: data.category || "",
          condition: data.condition || "new",
          location: data.location || "",
          images: data.images || [],
          sellerId: data.sellerId || "",
          sellerName: data.sellerName || "",
          inStockQuantity: data.inStockQuantity || 0,
          createdAt: data.createdAt || new Date(),
          status: data.status || "active"
        }
        products.push(product)
      })
    }

    return products
  } catch (error) {
    console.error("Error getting wishlist:", error)
    return []
  }
}

export async function toggleWishlist(userId: string, productId: string) {
  try {
    const wishlistRef = doc(db, "wishlists", userId)
    const wishlistDoc = await getDoc(wishlistRef)

    if (!wishlistDoc.exists()) {
      // Create new wishlist with product
      await setDoc(wishlistRef, {
        products: [productId],
        updatedAt: new Date(),
      })
      return true
    }

    const products = wishlistDoc.data().products || []
    const isInWishlist = products.includes(productId)

    // Toggle product in wishlist
    if (isInWishlist) {
      await setDoc(
        wishlistRef,
        {
          products: arrayRemove(productId),
          updatedAt: new Date(),
        },
        { merge: true }
      )
    } else {
      await setDoc(
        wishlistRef,
        {
          products: arrayUnion(productId),
          updatedAt: new Date(),
        },
        { merge: true }
      )
    }

    return !isInWishlist
  } catch (error) {
    console.error("Error toggling wishlist:", error)
    throw error
  }
}

export async function isInWishlist(userId: string, productId: string) {
  try {
    const wishlistRef = doc(db, "wishlists", userId)
    const wishlistDoc = await getDoc(wishlistRef)

    if (!wishlistDoc.exists()) {
      return false
    }

    const products = wishlistDoc.data().products || []
    return products.includes(productId)
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return false
  }
}
