import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "./config"

export async function getWishlist(userId: string) {
  try {
    const docRef = doc(db, "wishlists", userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return []
    }

    const productIds = docSnap.data().products || []

    // Fetch product details for each ID
    const products = []
    for (const id of productIds) {
      try {
        const productDoc = await getDoc(doc(db, "products", id))
        if (productDoc.exists()) {
          products.push({
            id: productDoc.id,
            ...productDoc.data(),
            isWishlisted: true,
          })
        }
      } catch (error) {
        console.error(`Error fetching product ${id}:`, error)
      }
    }

    return products
  } catch (error) {
    console.error("Error getting wishlist:", error)
    return []
  }
}

export async function toggleWishlist(userId: string, productId: string) {
  try {
    const docRef = doc(db, "wishlists", userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      // Create new wishlist with product
      await setDoc(docRef, {
        products: [productId],
      })
      return true
    }

    const products = docSnap.data().products || []
    const isInWishlist = products.includes(productId)

    // Toggle product in wishlist
    if (isInWishlist) {
      await setDoc(
        docRef,
        {
          products: arrayRemove(productId),
        },
        { merge: true },
      )
    } else {
      await setDoc(
        docRef,
        {
          products: arrayUnion(productId),
        },
        { merge: true },
      )
    }

    return !isInWishlist
  } catch (error) {
    console.error("Error toggling wishlist:", error)
    throw error
  }
}
