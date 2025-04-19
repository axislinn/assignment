import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { app, db } from "./config"

// Initialize Firebase Cloud Messaging
let messaging: any

// Only initialize on client side
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.error("Error initializing Firebase messaging:", error)
  }
}

// Request permission and get token
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    if (!messaging) return null

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })

      if (token) {
        // Save token to user's document
        await saveUserFCMToken(userId, token)
        return token
      }
    }

    return null
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return null
  }
}

// Save FCM token to user's document
export async function saveUserFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token),
    })
    return true
  } catch (error) {
    console.error("Error saving FCM token:", error)
    return false
  }
}

// Remove FCM token from user's document
export async function removeUserFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      fcmTokens: arrayRemove(token),
    })
    return true
  } catch (error) {
    console.error("Error removing FCM token:", error)
    return false
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void): (() => void) | undefined {
  if (!messaging) return undefined

  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}
