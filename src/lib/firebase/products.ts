import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./config"

interface ProductData {
  title: string
  description: string
  price: number
  category: string
  condition: string
  location: string
  sellerId: string
  images: string[]
  featured?: boolean
  status?: string
}

interface ProductQueryOptions {
  featured?: boolean
  category?: string
  sellerId?: string
  limit?: number
  userId?: string // For checking if products are in user's wishlist
}

export async function getProducts(options: ProductQueryOptions = {}) {
  try {
    // Create a base query
    const productsRef = collection(db, "products")
    let productsQuery

    // Handle different query combinations to avoid index errors
    if (options.featured) {
      // Simple query for featured products
      productsQuery = query(
        productsRef,
        where("featured", "==", true),
        options.limit ? firestoreLimit(options.limit) : firestoreLimit(100),
      )
    } else if (options.category && options.category !== "all") {
      // Query by category
      productsQuery = query(
        productsRef,
        where("category", "==", options.category),
        orderBy("createdAt", "desc"),
        options.limit ? firestoreLimit(options.limit) : firestoreLimit(100),
      )
    } else if (options.sellerId) {
      // Query by seller
      productsQuery = query(
        productsRef,
        where("sellerId", "==", options.sellerId),
        orderBy("createdAt", "desc"),
        options.limit ? firestoreLimit(options.limit) : firestoreLimit(100),
      )
    } else {
      // Default query - just sort by date
      productsQuery = query(
        productsRef,
        orderBy("createdAt", "desc"),
        options.limit ? firestoreLimit(options.limit) : firestoreLimit(100),
      )
    }

    const querySnapshot = await getDocs(productsQuery)

    // Get wishlist data if userId is provided
    let wishlistItems: string[] = []
    if (options.userId) {
      try {
        const wishlistDoc = await getDoc(doc(db, "wishlists", options.userId))
        if (wishlistDoc.exists()) {
          wishlistItems = wishlistDoc.data().products || []
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error)
      }
    }

    // Map results
    const products = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        price: data.price || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        isWishlisted: options.userId ? wishlistItems.includes(doc.id) : false,
      }
    })

    return products
  } catch (error) {
    console.error("Error getting products:", error)
    // Return empty array instead of throwing error
    return []
  }
}

export async function getProduct(id: string, userId?: string) {
  try {
    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error("Product not found")
    }

    const data = docSnap.data()

    // Check if product is in user's wishlist
    let isWishlisted = false
    if (userId) {
      try {
        const wishlistDoc = await getDoc(doc(db, "wishlists", userId))
        if (wishlistDoc.exists()) {
          isWishlisted = (wishlistDoc.data().products || []).includes(id)
        }
      } catch (error) {
        console.error("Error checking wishlist:", error)
      }
    }

    // Get seller information
    let sellerData = null
    try {
      const sellerDoc = await getDoc(doc(db, "users", data.sellerId))
      if (sellerDoc.exists()) {
        sellerData = sellerDoc.data()
      }
    } catch (error) {
      console.error("Error fetching seller data:", error)
    }

    return {
      id: docSnap.id,
      ...data,
      price: data.price || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      isWishlisted,
      seller: sellerData
        ? {
            id: data.sellerId,
            displayName: sellerData.displayName || "Unknown Seller",
            photoURL: sellerData.photoURL,
            rating: sellerData.rating || 0,
          }
        : null,
    }
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

export async function createProduct(data: ProductData, imageFiles: File[]) {
  try {
    // Upload images first
    const imageUrls = []

    for (const file of imageFiles) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      imageUrls.push(url)
    }

    // Create product document
    const productData = {
      ...data,
      images: imageUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active", // Set to active by default
    }

    const docRef = await addDoc(collection(db, "products"), productData)
    return { id: docRef.id, ...productData }
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, data: Partial<ProductData>, newImageFiles?: File[]) {
  try {
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      throw new Error("Product not found")
    }

    const currentData = productSnap.data()
    const imageUrls = [...(currentData.images || [])]

    // Upload new images if provided
    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const url = await getDownloadURL(snapshot.ref)
        imageUrls.push(url)
      }
    }

    // Update product document
    const updateData = {
      ...data,
      images: data.images || imageUrls,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(productRef, updateData)
    return { id, ...updateData }
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    // Get product to delete image references
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      throw new Error("Product not found")
    }

    const data = productSnap.data()

    // Delete images from storage
    if (data.images && data.images.length > 0) {
      for (const imageUrl of data.images) {
        try {
          // Extract the path from the URL
          const imagePath = decodeURIComponent(imageUrl.split("/o/")[1].split("?")[0])
          const imageRef = ref(storage, imagePath)
          await deleteObject(imageRef)
        } catch (error) {
          console.error("Error deleting image:", error)
          // Continue with other images even if one fails
        }
      }
    }

    // Delete product document
    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}
