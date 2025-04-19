import { doc, getDoc, setDoc, updateDoc, deleteField, serverTimestamp } from "firebase/firestore"
import { db } from "./config"
import { getProduct } from "./products"
import { createNotification } from "./notifications"

// Cart item interface
export interface CartItem {
  productId: string
  quantity: number
  price: number
  title: string
  image: string
  sellerId: string
}

// Get user's cart
export async function getCart(userId: string): Promise<CartItem[]> {
  try {
    const cartDoc = await getDoc(doc(db, "carts", userId))

    if (!cartDoc.exists()) {
      return []
    }

    const cartData = cartDoc.data()
    const items: CartItem[] = []

    // Convert cart data to array of cart items with product details
    for (const [productId, itemData] of Object.entries(cartData)) {
      if (typeof itemData === "object" && itemData !== null && productId !== "lastUpdated") {
        const item = itemData as Omit<CartItem, "productId">
        items.push({
          productId,
          ...item,
        })
      }
    }

    return items
  } catch (error) {
    console.error("Error getting cart:", error)
    return []
  }
}

// Add item to cart
export async function addToCart(userId: string, productId: string, quantity = 1): Promise<boolean> {
  try {
    // Get product details
    const product = await getProduct(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const cartRef = doc(db, "carts", userId)
    const cartDoc = await getDoc(cartRef)

    const cartItem = {
      quantity,
      price: product.price,
      title: product.title,
      image: product.images?.[0] || "",
      sellerId: product.sellerId,
    }

    if (!cartDoc.exists()) {
      // Create new cart
      await setDoc(cartRef, {
        [productId]: cartItem,
        lastUpdated: serverTimestamp(),
      })
    } else {
      // Update existing cart
      const existingItem = cartDoc.data()[productId]

      if (existingItem) {
        // Update quantity if item already exists
        await updateDoc(cartRef, {
          [`${productId}.quantity`]: existingItem.quantity + quantity,
          lastUpdated: serverTimestamp(),
        })
      } else {
        // Add new item to cart
        await updateDoc(cartRef, {
          [productId]: cartItem,
          lastUpdated: serverTimestamp(),
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error adding to cart:", error)
    return false
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
  try {
    if (quantity <= 0) {
      return removeFromCart(userId, productId)
    }

    const cartRef = doc(db, "carts", userId)

    await updateDoc(cartRef, {
      [`${productId}.quantity`]: quantity,
      lastUpdated: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error updating cart item:", error)
    return false
  }
}

// Remove item from cart
export async function removeFromCart(userId: string, productId: string): Promise<boolean> {
  try {
    const cartRef = doc(db, "carts", userId)

    await updateDoc(cartRef, {
      [productId]: deleteField(),
      lastUpdated: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error removing from cart:", error)
    return false
  }
}

// Clear cart
export async function clearCart(userId: string): Promise<boolean> {
  try {
    const cart = await getCart(userId)
    const clearData: Record<string, any> = { lastUpdated: serverTimestamp() }

    // Create an object with all product fields set to deleteField()
    cart.forEach((item) => {
      clearData[item.productId] = deleteField()
    })

    await updateDoc(doc(db, "carts", userId), clearData)
    return true
  } catch (error) {
    console.error("Error clearing cart:", error)
    return false
  }
}

// Get cart count (for navbar badge)
export async function getCartCount(userId: string): Promise<number> {
  try {
    const cart = await getCart(userId)
    return cart.reduce((total, item) => total + item.quantity, 0)
  } catch (error) {
    console.error("Error getting cart count:", error)
    return 0
  }
}

// Checkout process
export async function checkout(userId: string, shippingAddress: any, paymentMethod: string): Promise<string | null> {
  try {
    // Get cart items
    const cartItems = await getCart(userId)

    if (cartItems.length === 0) {
      throw new Error("Cart is empty")
    }

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = 5.99
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    // Create order
    const orderRef = await setDoc(doc(db, "orders", `${Date.now()}-${userId.slice(0, 5)}`), {
      userId,
      items: cartItems,
      subtotal,
      shipping,
      tax,
      total,
      status: "pending",
      shippingAddress,
      paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Notify sellers about the new order
    const sellerOrders: Record<string, CartItem[]> = {}

    cartItems.forEach((item) => {
      if (!sellerOrders[item.sellerId]) {
        sellerOrders[item.sellerId] = []
      }
      sellerOrders[item.sellerId].push(item)
    })

    // Create seller notifications
    for (const [sellerId, sellerItems] of Object.entries(sellerOrders)) {
      await createNotification({
        userId: sellerId,
        type: "new_order",
        title: "New Order Received",
        message: `You have received a new order with ${sellerItems.length} item(s) totaling $${sellerItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}`,
        read: false,
        orderId: orderRef.id,
      })
    }

    // Create buyer notification
    await createNotification({
      userId,
      type: "order_status",
      title: "Order Placed Successfully",
      message: `Your order has been placed and is being processed. Total: $${total.toFixed(2)}`,
      read: false,
      orderId: orderRef.id,
    })

    // Clear the cart
    await clearCart(userId)

    return orderRef.id
  } catch (error) {
    console.error("Error during checkout:", error)
    return null
  }
}
