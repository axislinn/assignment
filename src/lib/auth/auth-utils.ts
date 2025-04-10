import { cookies } from "next/headers"
import { cache } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export const getCurrentUser = cache(async () => {
  try {
    // This is a server-side function, so we need to use cookies
    // In a real app, you'd implement a proper server-side auth solution
    // For this demo, we'll simulate by checking client-side
    const user = auth.currentUser
    
    if (!user) {
      return null
    }
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    
    if (!userDoc.exists()) {
      return null
    }
    
    return {
      ...user,
      ...userDoc.data(),
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
})
