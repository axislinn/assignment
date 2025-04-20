import { cookies } from "next/headers"
import { cache } from "react"
import { db } from "@/lib/firebase/config"
import { doc, getDoc } from "firebase/firestore"
import { RequestCookies } from "next/dist/server/web/spec-extension/cookies"

// A simpler server-compatible solution for the demo
// In a production app, you would use Firebase Admin SDK to verify session cookies
export const getCurrentUser = cache(async () => {
  try {
    // Get auth cookie from request - simplified for compatibility
    let userCookie = null
    try {
      // Access cookies - handle both sync and async possibilities
      const cookieStore = cookies() as unknown as RequestCookies
      userCookie = cookieStore.get?.('user-session')
    } catch (cookieError) {
      console.error("Error accessing cookies:", cookieError)
    }

    if (!userCookie?.value) {
      return null
    }

    // Parse user data from cookie
    const userData = JSON.parse(decodeURIComponent(userCookie.value))
    
    if (!userData || !userData.uid) {
      return null
    }
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userData.uid))
    
    if (!userDoc.exists()) {
      return null
    }
    
    return {
      ...userData,
      ...userDoc.data(),
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
})